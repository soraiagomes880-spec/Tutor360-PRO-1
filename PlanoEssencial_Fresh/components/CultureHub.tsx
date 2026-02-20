
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from '@google/genai';
import { Language, LANGUAGES } from '../types';
import { withRetry } from '../utils';

interface Expression {
  phrase: string;
  meaning: string;
  example: string;
}

interface CultureData {
  history: { title: string; text: string };
  etiquette: { title: string; text: string };
  expressions: Expression[];
}

interface CultureHubProps {
  language: Language;
  onAction?: () => void;
}

export const CultureHub: React.FC<CultureHubProps> = ({ language, onAction }) => {
  const [cultureData, setCultureData] = useState<CultureData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [playingAudioIdx, setPlayingAudioIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

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

  const playExpression = async (text: string, index: number) => {
    if (playingAudioIdx !== null) return;
    setPlayingAudioIdx(index);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say this naturally in ${language}: ${text}` }] }],
        config: {
          // Fix: Correct typo in responseModalities (was responseModalalities)
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      }));
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const ctx = audioContextRef.current;
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingAudioIdx(null);
        source.start();
      } else { setPlayingAudioIdx(null); }
    } catch (e) { setPlayingAudioIdx(null); }
  };

  const fetchCultureData = async (query?: string) => {
    setIsLoading(true);
    setError(null);
    if (onAction) onAction();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptText = query 
        ? `Aja como um guia cultural. Explore o tema "${query}" relacionado a países que falam ${language}.`
        : `Gere um resumo cultural dinâmico sobre curiosidades e costumes atuais em países que falam ${language}.`;

      const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
          parts: [{ 
            text: `${promptText} 
            REGRAS OBRIGATÓRIAS:
            1. Retorne apenas o objeto JSON.
            2. Responda as explicações em PORTUGUÊS.
            3. As expressões devem estar no idioma original (${language}).
            4. Seja conciso e use fatos interessantes.` 
          }] 
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              history: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["title", "text"]
              },
              etiquette: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["title", "text"]
              },
              expressions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phrase: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                    example: { type: Type.STRING }
                  },
                  required: ["phrase", "meaning", "example"]
                }
              }
            },
            required: ["history", "etiquette", "expressions"]
          }
        }
      }));

      const text = response.text || '';
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      
      if (parsed && parsed.history && parsed.etiquette) {
        setCultureData(parsed);
      } else {
        throw new Error("Formato de dados incompleto.");
      }
    } catch (e: any) {
      console.error("CultureHub Error:", e);
      setError("Não conseguimos encontrar informações para essa busca específica. Tente algo mais amplo.");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchCultureData();
  }, [language]);

  const handleSearchClick = () => {
    alert("Busca em Tempo Real (Google Search) e Business Mode são exclusivos do Plano ELITE. Faça o upgrade agora!");
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Cultura & Exploração</h2>
          <p className="text-slate-400 text-sm md:text-base">Descubra curiosidades ou explore locais específicos em países de língua {language}.</p>
        </div>
        <button 
          onClick={handleSearchClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1e293b]/40 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-500 text-sm font-medium opacity-60"
        >
          <i className="fas fa-lock text-[10px]"></i>
          <i className="fas fa-arrow-trend-up text-indigo-400"></i>
          Tendências ELITE
        </button>
      </div>

      <div className="glass-panel p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-white/5 bg-[#0f172a]/50">
        <div className="flex flex-col sm:flex-row items-stretch gap-4 relative">
          <div className="flex-1 flex items-center bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 px-4 md:px-6 py-1 opacity-50">
            <div className="text-slate-600 mr-3 shrink-0">
              <i className="fas fa-lock"></i>
            </div>
            <input 
              type="text"
              disabled
              placeholder={`Busca Real-Time (ELITE)...`}
              className="flex-1 bg-transparent py-4 text-slate-600 placeholder-slate-700 outline-none text-sm cursor-not-allowed"
            />
          </div>
          <button 
            onClick={handleSearchClick}
            className="px-6 py-4 bg-slate-800 border border-white/5 text-slate-500 font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-2"
          >
            <i className="fas fa-magnifying-glass"></i>
            Explorar
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] md:rounded-[3rem] border-white/5 bg-[#0f172a]/30 min-h-[400px] flex flex-col shadow-2xl overflow-hidden relative">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 md:p-20 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <i className="fas fa-earth-americas absolute inset-0 flex items-center justify-center text-indigo-400/50 text-xl animate-pulse"></i>
            </div>
            <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest animate-pulse text-center">Viajando pelo conhecimento...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 text-center animate-in zoom-in-95">
            <i className="fas fa-circle-exclamation text-red-500 text-3xl mb-4"></i>
            <h4 className="text-white font-bold text-lg mb-2">Ops! Algo deu errado</h4>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button onClick={() => fetchCultureData()} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Tentar Novamente</button>
          </div>
        ) : cultureData ? (
          <div className="p-6 md:p-10 space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center">
              <h3 className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] md:tracking-[0.5em] mb-8 md:mb-12 italic">Deep Dive Cultural (Versão Essencial)</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {/* History Card */}
              <div className="glass-panel rounded-[2.5rem] border-white/5 bg-black/20 overflow-hidden flex flex-col group transition-all">
                <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/10 shrink-0">
                    <i className="fas fa-landmark text-amber-500 text-lg"></i>
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-white">{cultureData.history.title}</h4>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{cultureData.history.text}</p>
                </div>
                <div className="mt-auto h-1 w-full bg-amber-500/10"></div>
              </div>

              {/* Etiquette Card */}
              <div className="glass-panel rounded-[2.5rem] border-white/5 bg-black/20 overflow-hidden flex flex-col group transition-all">
                <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/10 shrink-0">
                    <i className="fas fa-handshake text-indigo-500 text-lg"></i>
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-white">{cultureData.etiquette.title}</h4>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{cultureData.etiquette.text}</p>
                </div>
                <div className="mt-auto h-1 w-full bg-indigo-500/10"></div>
              </div>

              {/* Expressions Card */}
              <div className="glass-panel rounded-[2.5rem] border-white/5 bg-black/20 overflow-hidden flex flex-col group transition-all">
                <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10 shrink-0">
                    <i className="fas fa-comment-dots text-emerald-500 text-lg"></i>
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-white">Língua Local</h4>
                  <div className="space-y-5 md:space-y-6">
                    {cultureData.expressions.slice(0, 3).map((exp, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-emerald-400 font-bold text-sm md:text-base">"{exp.phrase}"</span>
                          <button 
                            onClick={() => playExpression(exp.phrase, idx)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${playingAudioIdx === idx ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                          >
                            <i className={`fas ${playingAudioIdx === idx ? 'fa-spinner fa-spin' : 'fa-volume-high'} text-[10px]`}></i>
                          </button>
                        </div>
                        <p className="text-slate-300 text-[11px] md:text-xs mt-1">{exp.meaning}</p>
                        <p className="text-slate-500 text-[10px] italic mt-1">Ex: {exp.example}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto h-1 w-full bg-emerald-500/10"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
            <i className="fas fa-map-marked-alt text-5xl md:text-6xl text-slate-700 mb-6"></i>
            <p className="text-slate-600 text-xs md:text-sm italic">O resumo cultural básico será carregado automaticamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};
