
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Language } from '../types';
import { encode, decode, decodeAudioData, blobToBase64 } from '../utils/audio';
import { analyzePronunciation } from '../services/geminiService';
import TTSButton from './TTSButton';

interface VoiceTutorProps {
  targetLanguage: Language;
  onAction: () => void;
}

const VoiceTutor: React.FC<VoiceTutorProps> = ({ targetLanguage, onAction }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [status, setStatus] = useState<string>('Ready to talk');
  const [labWord, setLabWord] = useState('');
  const [latestFeedback, setLatestFeedback] = useState<{ tip: string, focus: string } | null>(null);
  
  // Recording Lab State
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<{score: number, feedback: string, detected_text: string} | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const currentOutputTranscriptionRef = useRef<string>('');
  const currentInputTranscriptionRef = useRef<string>('');

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsSessionActive(false);
    setStatus('Ready to talk');
  }, []);

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      onAction(); // Usage count increment
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsSessionActive(true);
            setStatus('Listening...');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const uText = currentInputTranscriptionRef.current;
              const mText = currentOutputTranscriptionRef.current;
              
              if (uText) setTranscriptions(prev => [...prev, { role: 'user', text: uText }]);
              if (mText) {
                setTranscriptions(prev => [...prev, { role: 'model', text: mText }]);
                
                const coachMatch = mText.match(/Coach Tip: (.*?)\s*\|\s*Focus: (.*?)(?=\s*Response:|$)/i);
                if (coachMatch && coachMatch[1] && coachMatch[2]) {
                  setLatestFeedback({
                    tip: coachMatch[1].trim(),
                    focus: coachMatch[2].trim()
                  });
                } else {
                  const simpleTip = mText.match(/Coach Tip: (.*?)(?=\s*Response:|$)/i);
                  if (simpleTip && simpleTip[1]) {
                    setLatestFeedback({
                      tip: simpleTip[1].trim(),
                      focus: simpleTip[1].trim()
                    });
                  }
                }
              }
              
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onerror: (e) => {
            console.error('Gemini Live error:', e);
            setStatus('Error occurred');
            stopSession();
          },
          onclose: () => {
            setIsSessionActive(false);
            setStatus('Session closed');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are an expert language coach for ${targetLanguage.name}. 
          Your goal is to help the student achieve fluency through real-time feedback.
          
          Guidelines:
          1. Actively listen for grammar errors and pronunciation slips.
          2. Structure your response strictly as follows if you have feedback:
             "Coach Tip: [Concise description of the error] | Focus: [The exact word or short phrase the student needs to practice]
              Response: [Continue the conversation naturally in ${targetLanguage.name}]"
          3. If the user is perfect, just respond naturally.
          4. Always speak in ${targetLanguage.name} for the conversation part.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
      setStatus('Failed to access microphone');
    }
  };

  // Recording Lab Logic
  const startRecording = async () => {
    try {
      // Clear previous recording
      if (audioURL) URL.revokeObjectURL(audioURL);
      setAudioURL(null);
      setRecordedBlob(null);
      setPronunciationResult(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingClip(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone access denied or error starting recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingClip) {
      mediaRecorderRef.current.stop();
      setIsRecordingClip(false);
    }
  };

  const handleAnalyzePronunciation = async () => {
    if (!recordedBlob || !labWord.trim()) return;
    setIsAnalyzing(true);
    onAction(); // Usage count increment
    try {
      const base64 = await blobToBase64(recordedBlob);
      const result = await analyzePronunciation(base64, labWord, targetLanguage.name);
      setPronunciationResult(result);
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [stopSession, audioURL]);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {/* Main Interaction Area */}
        <div className="md:col-span-2 p-8 flex flex-col items-center text-center">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 transition-all relative ${isSessionActive ? 'bg-indigo-100' : 'bg-slate-100'}`}>
            {isSessionActive && (
              <div className="absolute inset-0 border-4 border-indigo-400 rounded-full animate-ping opacity-20"></div>
            )}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isSessionActive ? 'bg-indigo-600 shadow-xl shadow-indigo-200 scale-110' : 'bg-slate-300'}`}>
               <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-3m4-12V5a3 3 0 00-6 0v6a3 3 0 006 0z" />
               </svg>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 mb-2">Live Chat</h2>
          <p className={`text-sm font-bold uppercase tracking-widest mb-8 ${isSessionActive ? 'text-indigo-600' : 'text-slate-400'}`}>{status}</p>

          {!isSessionActive ? (
            <button 
              onClick={startSession}
              className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Practice
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="px-12 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black transition-all shadow-lg hover:shadow-red-200 active:scale-95 flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Finish Session
            </button>
          )}

          <div className="w-full mt-12 text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Live Transcript
            </h3>
            {transcriptions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                 <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-3m4-12V5a3 3 0 00-6 0v6a3 3 0 006 0z" />
                </svg>
                <p className="text-sm font-bold">Waiting for your first words...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {transcriptions.map((t, idx) => (
                  <div key={idx} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`group relative max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      t.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      {t.text}
                      {t.role === 'model' && (
                        <div className="absolute -right-10 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TTSButton text={t.text} language={targetLanguage.name} className="scale-75 !p-1 shadow-none border-none bg-indigo-50 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Feedback & Lab Sidebar */}
        <div className="bg-slate-50 p-8 flex flex-col gap-8">
          
          {/* Live Feedback Section */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Live Feedback
            </h3>
            
            {latestFeedback ? (
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-lg animate-in slide-in-from-right-4 duration-300 border-l-4 border-l-indigo-500">
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Coaching Tip</span>
                    <TTSButton 
                      text={latestFeedback.tip} 
                      language="English" 
                      className="scale-75 !p-1 !rounded-full shadow-none border-none bg-transparent text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" 
                    />
                  </div>
                  <p className="text-sm text-slate-700 font-bold leading-relaxed">
                    {latestFeedback.tip}
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Focus</span>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xl font-black text-slate-900 tracking-tight leading-none truncate">{latestFeedback.focus}</p>
                    <div className="flex gap-1 shrink-0">
                      <TTSButton 
                        text={latestFeedback.focus} 
                        language={targetLanguage.name} 
                        slow={true} 
                        className="!p-2 shadow-none scale-90"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center opacity-50">
                <p className="text-xs font-bold text-slate-400">Feedback will appear during conversation</p>
              </div>
            )}
          </section>

          {/* Pronunciation Lab Section */}
          <section className="mt-auto pt-8 border-t border-slate-200">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-3m4-12V5a3 3 0 00-6 0v6a3 3 0 006 0z" />
              </svg>
              Pronunciation Lab
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={labWord}
                  onChange={(e) => setLabWord(e.target.value)}
                  placeholder="Target phrase..."
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <TTSButton text={labWord} language={targetLanguage.name} className="scale-75 !p-1.5 shadow-none" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={isRecordingClip ? stopRecording : startRecording}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecordingClip ? 'bg-red-500 animate-pulse text-white shadow-lg shadow-red-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {isRecordingClip ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
                      )}
                    </button>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{isRecordingClip ? 'Recording...' : recordedBlob ? 'Recorded!' : 'Record yourself'}</p>
                      <p className="text-[10px] text-slate-400">{isRecordingClip ? 'Speak now' : 'Tap to start'}</p>
                    </div>
                  </div>

                  {audioURL && (
                    <button 
                      onClick={() => {
                        const audio = new Audio(audioURL);
                        audio.play().catch(e => console.error("Playback failed", e));
                      }}
                      className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm"
                      title="Play Recording"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  )}
                </div>

                <button
                  onClick={handleAnalyzePronunciation}
                  disabled={!recordedBlob || !labWord.trim() || isAnalyzing || isRecordingClip}
                  className={`w-full py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                    !recordedBlob || !labWord.trim() || isAnalyzing || isRecordingClip ? 'bg-slate-100 text-slate-300' : 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {isAnalyzing ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : 'Analyze Pronunciation'}
                </button>
              </div>

              {pronunciationResult && (
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Analysis Result</span>
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-black text-emerald-700">{pronunciationResult.score}%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/50 rounded-xl border border-emerald-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">I Heard:</p>
                      <p className="text-sm font-bold text-slate-800">"{pronunciationResult.detected_text}"</p>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed italic">
                      "{pronunciationResult.feedback}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default VoiceTutor;
