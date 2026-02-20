
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Language, LANGUAGES } from '../types';

interface Message {
  role: 'user' | 'tutor';
  text: string;
}

interface ChatSessionLog {
  id: string;
  date: Date;
  messages: Message[];
  language: Language;
}

interface LiveChatProps {
  language: Language;
  onSessionEnd?: (durationMinutes: number) => void;
}

const GREETINGS: Record<Language, string> = {
  'Inglês': "Hello! I'm your English practice partner. How are you today? Please try to answer me in English!",
  'Espanhol': "¡Hola! Soy tu compañero de prática de español. ¿Cómo estás hoy? ¡Por favor, intenta responderme em español!",
  'Francês': "Bonjour ! Je suis ton partenaire de prática du français. Comment vas-tu today? S'il vous plaît, essayez de me répondre en français !",
  'Alemão': "Hallo! Ich bin dein Deutsch-Übungspartner. Wie geht es dir heute? Bitte versuche mir auf Deutsch zu antworten!",
  'Português Brasil': "Olá! Tudo bem? Sou seu parceiro de conversação em Português. Sobre o que quer falar?",
  'Japonês': "こんにちは！私はあなたの日本語練習パートナーです。今日の調子ですか？日本語で答えてみてください！",
  'Italiano': "Ciao! Sono il teu compagno di pratica di italiano. Come stai oggi? Per favore, prova a rispondermi in italiano!",
  'Chinês': "你好！我是你的中文练习伙伴。你今天怎么样？请尝试用中文回答我！"
};

export const LiveChat: React.FC<LiveChatProps> = ({ language, onSessionEnd }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<Message[]>([]);
  const [pastSessions, setPastSessions] = useState<ChatSessionLog[]>([]);
  const [viewingHistoryIdx, setViewingHistoryIdx] = useState<number | null>(null);
  
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [playingTtsId, setPlayingTtsId] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  
  const [userTextResponse, setUserTextResponse] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  // Translation states
  const [targetTranslationLang, setTargetTranslationLang] = useState<Language>('Português Brasil');
  const [messageTranslations, setMessageTranslations] = useState<Record<number, string>>({});
  const [isTranslatingIdx, setIsTranslatingIdx] = useState<number | null>(null);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [transcription, currentInput, currentOutput]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): any => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const handleTextResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTextResponse.trim() || isTextLoading || isConnecting) return;

    const text = userTextResponse;
    setUserTextResponse('');
    
    if (transcription.length === 0 && !isActive) {
      setTranscription([{ role: 'tutor', text: GREETINGS[language] }]);
    }

    setTranscription(prev => [...prev, { role: 'user', text }]);
    setIsTextLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `System context: You are a native tutor of ${language}. Response in ${language}. Be encouraging and end with a question. User input: ${text}` }] }
        ],
      });

      const aiResponse = response.text || "Desculpe, não consegui processar isso.";
      setTranscription(prev => [...prev, { role: 'tutor', text: aiResponse }]);
    } catch (err) {
      console.error(err);
      setTranscription(prev => [...prev, { role: 'tutor', text: "Erro ao conectar com a IA." }]);
    } finally {
      setIsTextLoading(false);
    }
  };

  const playTts = async (text: string, msgKey: string) => {
    if (playingTtsId !== null) return;
    setPlayingTtsId(msgKey);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this perfectly in ${language}: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          setPlayingTtsId(null);
          if (ctx.state !== 'closed') ctx.close();
        };
        source.start();
      } else { setPlayingTtsId(null); }
    } catch (e) { 
      setPlayingTtsId(null); 
    }
  };

  const startSession = async () => {
    if (isActive || isConnecting) return;
    setViewingHistoryIdx(null);
    setIsConnecting(true);
    setTranscription([]);
    setMessageTranslations({});
    setSessionStartTime(Date.now());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const audioCtxIn = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const audioCtxOut = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      audioContextInRef.current = audioCtxIn;
      audioContextOutRef.current = audioCtxOut;
      nextStartTimeRef.current = 0;

      const analyzer = audioCtxIn.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;
      const sourceMic = audioCtxIn.createMediaStreamSource(stream);
      sourceMic.connect(analyzer);

      const updateLevel = () => {
        if (!analyzerRef.current) return;
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 128);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            audioCtxIn.resume();
            audioCtxOut.resume();
            setIsActive(true);
            setIsConnecting(false);
            setTranscription([{ role: 'tutor', text: GREETINGS[language] }]);
            const scriptProcessor = audioCtxIn.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            sourceMic.connect(scriptProcessor);
            scriptProcessor.connect(audioCtxIn.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioCtxOut.state !== 'closed') {
              const ctx = audioCtxOut;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.inputTranscription) {
              setCurrentInput(prev => prev + (message.serverContent?.inputTranscription?.text || ''));
            }
            if (message.serverContent?.outputTranscription) {
              setCurrentOutput(prev => prev + (message.serverContent?.outputTranscription?.text || ''));
            }
            if (message.serverContent?.turnComplete) {
              setTranscription(prev => [
                ...prev,
                ...(currentInput ? [{ role: 'user', text: currentInput }] : []),
                ...(currentOutput ? [{ role: 'tutor', text: currentOutput }] : [])
              ] as any);
              setCurrentInput('');
              setCurrentOutput('');
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => { console.error('Live API Error:', e); stopSession(); },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are a native expert tutor of ${language}. YOUR MISSION: Keep the student speaking through open questions. GOLDEN RULES: 1. Every response must end with an open question. 2. Immersion: if user speaks other languages, ask them to stick to ${language}. 3. Be vibrant and encouraging.`
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) { stopSession(); }
  };

  const stopSession = () => {
    if (transcription.length > 1) {
      const newSession: ChatSessionLog = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date(),
        messages: [...transcription],
        language
      };
      setPastSessions(prev => [newSession, ...prev]);
      
      // Notify parent about session completion
      if (sessionStartTime && onSessionEnd) {
        const durationMinutes = (Date.now() - sessionStartTime) / 60000;
        onSessionEnd(Math.max(1, Math.round(durationMinutes)));
      }
    }
    setSessionStartTime(null);
    setIsActive(false);
    setIsConnecting(false);
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => { try { session.close(); } catch (e) {} });
      sessionPromiseRef.current = null;
    }
    if (audioContextInRef.current && audioContextInRef.current.state !== 'closed') audioContextInRef.current.close().catch(() => {});
    if (audioContextOutRef.current && audioContextOutRef.current.state !== 'closed') audioContextOutRef.current.close().catch(() => {});
    audioContextInRef.current = null;
    audioContextOutRef.current = null;
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    analyzerRef.current = null;
    setAudioLevel(0);
  };

  const currentDisplayMessages = viewingHistoryIdx !== null 
    ? pastSessions[viewingHistoryIdx].messages 
    : transcription;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <div className="mb-4 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
            <i className="fas fa-comments text-white text-xl md:text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black text-white leading-none mb-1">
              {viewingHistoryIdx !== null ? 'Revisando' : 'Live Chat'}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium">
              {viewingHistoryIdx !== null 
                ? `${pastSessions[viewingHistoryIdx].language} • ${pastSessions[viewingHistoryIdx].date.toLocaleDateString()}` 
                : `Conversação real.`}
            </p>
          </div>
        </div>

        {(isActive || isConnecting) && (
          <div className="flex items-center gap-3 md:gap-5 px-4 md:px-6 py-2 md:py-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl shadow-2xl backdrop-blur-md">
            <div className="flex gap-1 h-4 md:h-6 items-center">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-0.5 md:w-1 bg-indigo-400 rounded-full" 
                  style={{ 
                    height: isConnecting ? '30%' : `${Math.max(20, audioLevel * 120 + (Math.random() * 20))}%`, 
                    transition: 'height 0.1s ease-out'
                  }}
                ></div>
              ))}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                {isConnecting ? 'Conectando...' : 'Ouvindo...'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 glass-panel rounded-[1.5rem] md:rounded-[2.5rem] border-white/10 flex flex-col overflow-hidden relative shadow-2xl bg-slate-950/40">
        <div ref={chatContainerRef} className="flex-1 p-4 md:p-8 overflow-y-auto space-y-4 md:space-y-6 flex flex-col scroll-smooth custom-scrollbar">
          {currentDisplayMessages.length === 0 && !isActive && !isConnecting && viewingHistoryIdx === null && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-12">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6 md:mb-8 border border-indigo-500/20 shadow-inner">
                <i className="fas fa-headset text-indigo-400 text-3xl md:text-4xl"></i>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-4">Escolha como começar</h3>
              <p className="text-slate-500 text-xs md:text-sm max-w-sm mb-8 md:mb-12 leading-relaxed">
                Pratique sua fala em <b>{language}</b> por voz ou tire dúvidas digitando abaixo.
              </p>
              
              <button
                onClick={startSession}
                className="w-full max-w-xs py-4 md:py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl md:rounded-3xl shadow-2xl shadow-indigo-900/50 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3 md:gap-4 text-base md:text-lg"
              >
                <i className="fas fa-microphone"></i>
                Iniciar Aula por Voz
              </button>
            </div>
          )}
          
          {currentDisplayMessages.map((line, i) => (
            line.text && (
              <div key={`${line.role}-${i}`} className={`group relative p-4 md:p-6 rounded-2xl md:rounded-[2rem] max-w-[90%] sm:max-w-md animate-in slide-in-from-bottom-4 duration-500 ${line.role === 'tutor' ? 'bg-indigo-600/10 border border-indigo-500/20 self-start text-indigo-100 shadow-xl' : 'bg-slate-800/80 border border-white/5 self-end text-slate-100'}`}>
                <div className="flex justify-between items-center mb-2 md:mb-3">
                  <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest opacity-50 flex items-center gap-2">
                    <i className={`fas ${line.role === 'tutor' ? 'fa-robot' : 'fa-user'}`}></i>
                    {line.role === 'tutor' ? 'Tutor IA' : 'Você'}
                  </div>
                  {line.role === 'tutor' && (
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      <button 
                        onClick={() => playTts(line.text, `msg-${i}`)}
                        className={`text-[8px] md:text-[9px] flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl transition-all font-black uppercase tracking-tighter ${playingTtsId === `msg-${i}` ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                      >
                        <i className={`fas ${playingTtsId === `msg-${i}` ? 'fa-spinner fa-spin' : 'fa-volume-high'}`}></i>
                        Ouvir
                      </button>
                    </div>
                  )}
                </div>
                <div className={`transition-all duration-300 ${line.role === 'tutor' && !showCaptions ? 'blur-md select-none opacity-20' : 'blur-0 opacity-100'}`}>
                  <p className="text-sm md:text-base leading-relaxed font-semibold text-left">{line.text}</p>
                </div>
                
                {line.role === 'tutor' && messageTranslations[i] && (
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Tradução</p>
                    <p className="text-xs md:text-sm text-slate-300 italic font-medium">{messageTranslations[i]}</p>
                  </div>
                )}
              </div>
            )
          ))}

          {(currentInput || currentOutput || isTextLoading) && (
            <div className="space-y-4">
              {currentInput && <div className="p-3 md:p-4 rounded-xl md:rounded-2xl max-w-[80%] md:max-w-md bg-slate-800/20 border border-white/5 self-end italic text-xs md:text-sm font-medium opacity-50">{currentInput}...</div>}
              {currentOutput && (
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl max-w-[80%] md:max-w-md bg-indigo-600/5 border border-indigo-500/10 self-start italic text-xs md:text-sm font-medium transition-all duration-300 ${!showCaptions ? 'blur-md opacity-20' : 'opacity-50'}`}>
                  {currentOutput}...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 border-t border-white/5 bg-slate-950/80 backdrop-blur-2xl z-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            {viewingHistoryIdx !== null ? (
              <button
                onClick={() => setViewingHistoryIdx(null)}
                className="w-full px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
              >
                <i className="fas fa-arrow-left mr-2"></i> Voltar ao Início
              </button>
            ) : (
              <>
                <form onSubmit={handleTextResponse} className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                    <i className="fas fa-keyboard"></i>
                  </div>
                  <input 
                    type="text"
                    value={userTextResponse}
                    onChange={(e) => setUserTextResponse(e.target.value)}
                    placeholder={isActive ? "Digite sua resposta..." : "Digite ou use voz..."}
                    disabled={isConnecting}
                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-28 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-600/40 focus:border-indigo-600 transition-all shadow-inner text-sm font-medium disabled:opacity-30"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button 
                      type="submit"
                      disabled={isConnecting || !userTextResponse.trim() || isTextLoading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black rounded-xl transition-all shadow-lg text-xs"
                    >
                      {isTextLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Enviar'}
                    </button>
                  </div>
                </form>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex flex-col gap-1 w-full sm:w-32">
                      <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Tradução</label>
                      <select 
                        value={targetTranslationLang}
                        onChange={(e) => setTargetTranslationLang(e.target.value as Language)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-indigo-400 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.name} value={lang.name} className="bg-slate-900">{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-white/10"></div>
                    <div className="hidden md:block">
                      <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">
                        {isActive ? 'Voz Ativa' : 'Pronto'}
                      </p>
                    </div>
                  </div>
                  
                  {isActive && (
                    <button
                      onClick={stopSession}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-2.5 bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-red-950/20"
                    >
                      <i className="fas fa-stop"></i>
                      Encerrar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
};
