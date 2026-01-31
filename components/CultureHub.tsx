
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { Language, LANGUAGES } from '../types';

interface CultureHubProps {
  language: Language;
}

interface GroundingLink {
  title: string;
  uri: string;
}

interface CulturalInsights {
  historicalCuriosity: { title: string; content: string };
  socialCustom: { title: string; content: string };
  idioms: Array<{ phrase: string; meaning: string; usage: string }>;
}

export const CultureHub: React.FC<CultureHubProps> = ({ language }) => {
  const [content, setContent] = useState<string | null>(null);
  const [links, setLinks] = useState<GroundingLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Cultural Cards State
  const [insights, setInsights] = useState<CulturalInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [playingIdiomIdx, setPlayingIdiomIdx] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const langInfo = LANGUAGES.find(l => l.name === language);

  const getCoordinates = (): Promise<{ latitude: number, longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsLoading(true);
    setContent(null);
    setLinks([]);

    try {
      const coords = await getCoordinates();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `O aluno quer saber sobre este local ou aspecto cultural em ${langInfo?.region || language}: "${searchQuery}". 
                   Explique detalhadamente em Português, focando em curiosidades culturais e dicas para quem está aprendendo ${language}. 
                   Se for um local físico, mencione sua importância histórica ou popularidade atual.`,
        config: {
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
          toolConfig: coords ? {
            retrievalConfig: {
              latLng: {
                latitude: coords.latitude,
                longitude: coords.longitude
              }
            }
          } : undefined
        }
      });

      setContent(response.text);
      extractLinks(response);
    } catch (e) {
      setContent("Desculpe, não consegui explorar esse local agora. Tente novamente.");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Gere insights culturais sobre ${langInfo?.region || language}. 
                   Retorne um JSON com:
                   1. 'historicalCuriosity': { 'title', 'content' } (fato histórico fascinante)
                   2. 'socialCustom': { 'title', 'content' } (dica de etiqueta ou costume local)
                   3. 'idioms': Lista de 3 objetos { 'phrase', 'meaning', 'usage' } (expressões idiomáticas comuns).
                   Tudo em Português Brasil, exceto o campo 'phrase' das expressões que deve ser no idioma ${language}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              historicalCuriosity: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["title", "content"]
              },
              socialCustom: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["title", "content"]
              },
              idioms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phrase: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                    usage: { type: Type.STRING }
                  },
                  required: ["phrase", "meaning", "usage"]
                }
              }
            },
            required: ["historicalCuriosity", "socialCustom", "idioms"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setInsights(data);
    } catch (e) {
      console.error("Erro ao carregar insights culturais:", e);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const fetchTrends = async () => {
    setIsLoading(true);
    setSearchQuery('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Quais são as 3 principais tendências culturais ou de entretenimento em ${langInfo?.region || language} esta semana? Resuma para um estudante de ${language} em Português.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      setContent(response.text);
      extractLinks(response);
    } catch (e) {
      setContent("Não foi possível carregar as notícias agora.");
    } finally {
      setIsLoading(false);
    }
  };

  const playIdiomAudio = async (phrase: string, index: number) => {
    if (playingIdiomIdx !== null) return;
    setPlayingIdiomIdx(index);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ parts: [{ text: phrase }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const ctx = audioContextRef.current;
        const decode = (b64: string) => {
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return bytes;
        };
        const decodeAudioData = async (data: Uint8Array, c: AudioContext): Promise<AudioBuffer> => {
          const dataInt16 = new Int16Array(data.buffer);
          const buffer = c.createBuffer(1, dataInt16.length, 24000);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
          return buffer;
        };
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingIdiomIdx(null);
        source.start();
      } else { setPlayingIdiomIdx(null); }
    } catch (e) { setPlayingIdiomIdx(null); }
  };

  const extractLinks = (response: any) => {
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      const formattedLinks: GroundingLink[] = chunks.map((c: any) => {
        if (c.maps) return { title: c.maps.title || 'Ver no Maps', uri: c.maps.uri };
        if (c.web) return { title: c.web.title || 'Saiba mais', uri: c.web.uri };
        return null;
      }).filter((l: any) => l !== null);
      setLinks(formattedLinks);
    }
  };

  useEffect(() => {
    fetchTrends();
    fetchInsights();
  }, [language]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Cultura & Exploração</h2>
          <p className="text-slate-400">Descubra tendências ou explore locais específicos em países de língua {language}.</p>
        </div>
        <button
          onClick={fetchTrends}
          className="self-start md:self-center p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-400 flex items-center gap-2 text-sm"
          title="Ver tendências gerais"
        >
          <i className="fas fa-arrow-trend-up"></i>
          Tendências
        </button>
      </div>

      <div className="glass-panel p-6 rounded-[2rem] border-white/10 bg-indigo-500/5">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-300 transition-colors">
            <i className="fas fa-map-location-dot text-xl"></i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`O que você quer saber sobre ${langInfo?.region || language}? (Ex: Museus em Paris, Comida de rua em Tóquio...)`}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-32 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40 text-sm flex items-center gap-2"
          >
            {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magnifying-glass"></i>}
            Explorar
          </button>
        </form>
      </div>

      <div className="glass-panel p-10 rounded-[3rem] border-white/10 bg-gradient-to-br from-slate-900 to-indigo-950/20 shadow-2xl min-h-[400px]">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-earth-americas text-indigo-400 animate-pulse"></i>
              </div>
            </div>
            <div className="text-center">
              <p className="text-indigo-400 font-medium">Conectando ao conhecimento global...</p>
              <p className="text-xs text-slate-500 mt-1 italic">Buscando dados em tempo real sobre {language}.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {searchQuery && !isSearching && (
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
                <i className="fas fa-location-dot"></i>
                Explorando: {searchQuery}
              </div>
            )}

            <div className="prose prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
              {content}
            </div>

            {links.length > 0 && (
              <div className="pt-8 border-t border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <i className="fas fa-map-pin"></i>
                  Locais e Referências Encontradas
                </p>
                <div className="flex flex-wrap gap-3">
                  {links.map((link, i) => (
                    <a
                      key={i}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 border ${link.uri.includes('google.com/maps')
                          ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                          : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20'
                        }`}
                    >
                      <i className={`fas ${link.uri.includes('google.com/maps') ? 'fa-location-arrow' : 'fa-link'}`}></i>
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW: Cultural Insights Deep Dive */}
      <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] whitespace-nowrap">Deep Dive Cultural</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isLoadingInsights || !insights ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-64 glass-panel rounded-3xl border-white/5 bg-white/5 animate-pulse"></div>
            ))
          ) : (
            <>
              {/* Card 1: Historical Curiosity */}
              <div className="glass-panel p-8 rounded-[2rem] border-white/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40"></div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-landmark-dome text-xl"></i>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{insights.historicalCuriosity.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{insights.historicalCuriosity.content}</p>
                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Curiosidade Histórica
                </div>
              </div>

              {/* Card 2: Social Custom */}
              <div className="glass-panel p-8 rounded-[2rem] border-white/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40"></div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-people-group text-xl"></i>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{insights.socialCustom.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{insights.socialCustom.content}</p>
                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Costumes & Etiqueta
                </div>
              </div>

              {/* Card 3: Idioms List */}
              <div className="glass-panel p-8 rounded-[2rem] border-white/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40"></div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-comment-dots text-xl"></i>
                </div>
                <h4 className="text-xl font-bold text-white mb-6">Expressões Comuns</h4>
                <div className="space-y-6">
                  {insights.idioms.map((idiom, idx) => (
                    <div key={idx} className="group/idiom">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-400 font-bold text-sm">"{idiom.phrase}"</span>
                        <button
                          onClick={() => playIdiomAudio(idiom.phrase, idx)}
                          disabled={playingIdiomIdx !== null}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${playingIdiomIdx === idx ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                        >
                          <i className={`fas ${playingIdiomIdx === idx ? 'fa-spinner fa-spin' : 'fa-volume-high'} text-xs`}></i>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium mb-1">{idiom.meaning}</p>
                      <p className="text-[9px] text-slate-500 italic">Ex: {idiom.usage}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Expressões Idiomáticas
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
