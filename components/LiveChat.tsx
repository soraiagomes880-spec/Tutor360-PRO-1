
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Language, LANGUAGES } from '../types';
import { getGeminiKey } from '../lib/gemini';

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
  onAction?: () => void;
}

const GREETINGS: Record<Language, string> = {
  'Inglês': "Hello! I'm your English practice partner. How are you today?",
  'Espanhol': "¡Hola! Soy tu compañero de prática de español. ¿Cómo estás hoy?",
  'Francês': "Bonjour ! Je suis ton partenaire de prática du français. Comment vas-tu?",
  'Alemão': "Hallo! Ich bin dein Deutsch-Übungspartner. Wie geht es dir heute?",
  'Português Brasil': "Olá! Tudo bem? Sou seu parceiro de conversação em Português.",
  'Japonês': "こんにちは！私はあなたの日本語練習パートナーです。今日の調子ですか？",
  'Italiano': "Ciao! Sono il tuo compagno di pratica di italiano. Come stai oggi?",
  'Chinês': "你好！我是你的中文练习伙伴。你今天怎么样？"
};

export const LiveChat: React.FC<LiveChatProps> = ({ language, onAction }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<Message[]>([]);
  const [pastSessions, setPastSessions] = useState<ChatSessionLog[]>([]);
  const [viewingHistoryIdx, setViewingHistoryIdx] = useState<number | null>(null);

  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const [userTextResponse, setUserTextResponse] = useState('');
  const [targetTransLang, setTargetTransLang] = useState<Language>('Português Brasil');

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): any => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const handleTextResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTextResponse.trim()) return;
    const text = userTextResponse;
    setUserTextResponse('');
    setTranscription(prev => [...prev, { role: 'user', text }]);
    if (onAction) onAction();
  };

  const startSession = async () => {
    if (isActive || isConnecting) return;
    setViewingHistoryIdx(null);
    setIsConnecting(true);
    setTranscription([]);
    if (onAction) onAction();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const apiKey = getGeminiKey();

      console.log("PRO Debug: Iniciando Chat de Voz...");

      if (!apiKey) {
        console.error("PRO Debug: Chave de API não encontrada.");
        alert("API Key não configurada. Clique no título 'Tutor 360' (5 vezes) para configurar sua chave.");
        setIsConnecting(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
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

      console.log("PRO Debug: Conectando ao modelo Live...");
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        callbacks: {
          onopen: () => {
            console.log("PRO Debug: Conexão aberta.");
            setIsActive(true);
            setIsConnecting(false);
            setTranscription([{ role: 'tutor', text: GREETINGS[language] }]);
            const scriptProcessor = audioCtxIn.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            sourceMic.connect(scriptProcessor);
            scriptProcessor.connect(audioCtxIn.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
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
          },
          onclose: () => {
            console.log("PRO Debug: Conexão fechada.");
            stopSession();
          },
          onerror: (err) => {
            console.error("PRO Debug Error:", err);
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `Você é um tutor nativo especialista em ${language} do PLANO PRO. 
          SUA MISSÃO PRINCIPAL: Manter o aluno falando e imerso através de perguntas.
          DIFERENCIAL PRO: Sempre que o aluno usar uma palavra simples, sugira uma alternativa mais sofisticada ou avançada de vocabulário após responder a ele.
          REGRAS: 1. Cada resposta deve ter uma pergunta aberta. 2. Imersão total no idioma ${language}. 3. Corrija suavemente.`
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error("PRO Debug Exception:", err);
      stopSession();
    }
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
    }
    setIsActive(false);
    setIsConnecting(false);
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => { try { session.close(); } catch (e) { } });
      sessionPromiseRef.current = null;
    }
    if (audioContextInRef.current) {
      if (audioContextInRef.current.state !== 'closed') audioContextInRef.current.close().catch(() => { });
      audioContextInRef.current = null;
    }
    if (audioContextOutRef.current) {
      if (audioContextOutRef.current.state !== 'closed') audioContextOutRef.current.close().catch(() => { });
      audioContextOutRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
    sourcesRef.current.clear();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyzerRef.current = null;
    setAudioLevel(0);
  };

  const currentDisplayMessages = viewingHistoryIdx !== null
    ? pastSessions[viewingHistoryIdx].messages
    : transcription;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <div className="mb-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <i className="fas fa-graduation-cap text-white text-lg"></i>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tutor 360 <span className="text-indigo-400">PRO</span></h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de Voz DESBLOQUEADO (Diferencial PRO) */}
          <div className="hidden sm:flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/40 px-3 py-1.5 rounded-xl">
            <i className="fas fa-check-circle text-[10px] text-indigo-400"></i>
            <i className="fas fa-user-tie text-xs text-indigo-300"></i>
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Voz Premium Ativa</span>
          </div>

          {(isActive || isConnecting) && (
            <div className="flex items-center gap-4 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
              <div className="flex gap-1 items-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1 bg-indigo-400 rounded-full" style={{ height: isConnecting ? '30%' : `${Math.max(20, audioLevel * 100)}%`, transition: 'height 0.1s ease-out' }}></div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">{isConnecting ? 'Conectando...' : 'IA Ativa (PRO)'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-[2.5rem] border-white/10 flex flex-col overflow-hidden relative shadow-2xl bg-[#0a0f1d]">
        <div className="flex-1 p-8 overflow-y-auto space-y-6 flex flex-col scroll-smooth custom-scrollbar">
          {currentDisplayMessages.length === 0 && !isActive && !isConnecting && viewingHistoryIdx === null && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <h3 className="text-3xl font-bold text-white mb-4">Bem-vindo ao Nível PRO</h3>
              <p className="text-slate-400 max-w-sm mb-12 text-sm leading-relaxed opacity-80">
                Sua aula em <span className="font-bold text-white">{language}</span> terá agora sugestões de vocabulário avançado automáticas.
              </p>

              <button
                onClick={startSession}
                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-900/50 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                <i className="fas fa-microphone"></i>
                Iniciar Aula por Voz PRO
              </button>
            </div>
          )}

          {currentDisplayMessages.map((line, i) => (
            line.text && (
              <div key={`${line.role}-${i}`} className={`group relative p-6 rounded-[2rem] max-w-[85%] md:max-w-md animate-in slide-in-from-bottom-4 duration-500 ${line.role === 'tutor' ? 'bg-[#1e293b]/50 border border-white/5 self-start text-white' : 'bg-indigo-600 border border-indigo-400/30 self-end text-white'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-40">{line.role === 'tutor' ? 'Tutor' : 'Você'}</div>
                </div>
                <p className="text-sm md:text-base leading-relaxed font-medium">{line.text}</p>
              </div>
            )
          ))}

          {(currentInput || currentOutput) && (
            <div className="space-y-4 opacity-30">
              {currentInput && <div className="p-4 rounded-2xl max-w-md bg-white/5 self-end italic text-sm">{currentInput}...</div>}
              {currentOutput && <div className="p-4 rounded-2xl max-w-md bg-white/5 self-start italic text-sm">{currentOutput}...</div>}
            </div>
          )}
        </div>

        <div className="p-6 bg-[#0f172a] border-t border-white/5">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">TRADUÇÃO</span>
                  <div className="flex items-center gap-3">
                    <select value={targetTransLang} onChange={(e) => setTargetTransLang(e.target.value as Language)} className="bg-transparent border-none text-xs text-slate-300 font-medium outline-none cursor-pointer hover:text-white transition-colors">
                      {LANGUAGES.map(lang => (
                        <option key={lang.name} value={lang.name} className="bg-[#0f172a]">{lang.name}</option>
                      ))}
                    </select>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-400/10 rounded">PRONTO</span>
                  </div>
                </div>

                {/* Diferencial Vocabulário Avançado PRO DESBLOQUEADO */}
                <div className="hidden lg:flex items-center gap-2">
                  <i className="fas fa-sparkles text-[9px] text-indigo-400"></i>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300">Vocabulário Avançado PRO ATIVO</span>
                </div>
              </div>

              {(isActive || isConnecting) && (
                <button onClick={stopSession} className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-red-500/20 transition-all">Sair da Aula</button>
              )}
            </div>

            <form onSubmit={handleTextResponse} className="relative w-full">
              <input type="text" value={userTextResponse} onChange={(e) => setUserTextResponse(e.target.value)} placeholder="Diga algo ou digite aqui..." disabled={!isActive && !isConnecting} className="w-full bg-[#1e293b]/40 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-all text-sm pr-28" />
              <button type="submit" disabled={(!isActive && !isConnecting) || !userTextResponse.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 hover:text-white disabled:opacity-20 text-xs font-bold rounded-xl transition-all">Enviar</button>
            </form>
          </div>
        </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }`}</style>
    </div>
  );
};
