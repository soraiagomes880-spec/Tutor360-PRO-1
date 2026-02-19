import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Language, LANGUAGES } from '../types';

interface PronunciationLabProps {
  language: Language;
  onActivity?: () => void;
  apiKey?: string;
}

const DEFAULT_PHRASES: Record<Language, string> = {
  'Inglês': 'Through the thickest fog, the three friends thought they heard thunder.',
  'Espanhol': 'Tres tristes tigres tragaban trigo en un trigal.',
  'Francês': 'Un chasseur sachant chasser sans son chien est un bon chasseur.',
  'Alemão': 'Fischers Fritz fischt frische Fische, frische Fische fischt Fischers Fritz.',
  'Português Brasil': 'O rato roeu a roupa do rei de Roma e a rainha raivosa rasgou o resto.',
  'Japonês': '生麦生米生卵 (Namamugi namamigome namatamago).',
  'Italiano': 'Trentatré trentini entrarono a Trento todos e trentatré trotterellando.',
  'Chinês': '妈妈骑马。马慢，妈妈骂马。(Māma qí mǎ. Mǎ màn, māma mà mǎ.)'
};

export const PronunciationLab: React.FC<PronunciationLabProps> = ({ language, onActivity, apiKey }) => {
  const [targetPhrase, setTargetPhrase] = useState(DEFAULT_PHRASES[language]);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);

  // Translation states
  const [targetTranslationLang, setTargetTranslationLang] = useState<Language>('Português Brasil');
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setTargetPhrase(DEFAULT_PHRASES[language]);
    setFeedback(null);
    setTranslation(null);
  }, [language]);

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

  const playTargetAudio = async () => {
    if (isPlayingTarget || !targetPhrase.trim()) return;
    setIsPlayingTarget(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: `Say this clearly in ${language}: ${targetPhrase}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlayingTarget(false);
        source.start();
      }
    } catch (e) {
      setIsPlayingTarget(false);
    }
  };

  const handleAnalyze = async () => {
    setIsRecording(false);
    if (!targetPhrase.trim()) return;
    setFeedback("Analisando sua pronúncia...");
    setTranslation(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analyze the pronunciation of this phrase in ${language}: "${targetPhrase}". Provide 3 tips in ${language}. Keep the tips very short.`,
      });
      setFeedback(response.text ?? "Análise indisponível.");
      if (onActivity) onActivity();
    } catch (e) {
      setFeedback("Erro ao analisar.");
    }
  };

  const translateFeedback = async () => {
    if (!feedback || isTranslating || feedback === "Analisando sua pronúncia..." || feedback === "Erro ao analisar.") return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Traduza esta análise de pronúncia para ${targetTranslationLang}: "${feedback}"`,
      });
      setTranslation(response.text ?? "Erro na tradução.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Laboratório de Pronúncia</h2>
        <p className="text-slate-400">Personalize seu treino escrevendo o que deseja praticar em {language}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 shadow-xl space-y-8 flex flex-col">
          <div className="space-y-4">
            <textarea
              value={targetPhrase}
              onChange={(e) => setTargetPhrase(e.target.value)}
              className="w-full bg-black/30 p-6 rounded-2xl border border-white/10 text-xl font-medium text-white leading-relaxed focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none h-40"
            />
            <button onClick={playTargetAudio} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              <i className="fas fa-volume-high mr-2"></i> Ouvir IA
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 py-4 flex-1 justify-center">
            <button
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={handleAnalyze}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 scale-90' : 'bg-indigo-600 hover:scale-105'}`}
            >
              <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'} text-4xl text-white`}></i>
            </button>
            <p className="font-black text-sm text-slate-400 uppercase tracking-widest">
              {isRecording ? 'Capturando...' : 'Segure para Gravar'}
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 shadow-xl flex flex-col min-h-[500px] bg-slate-900/30">
          <div className="flex justify-between items-center mb-6">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Feedback</label>
            <div className="flex flex-col gap-1 items-end">
              <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest">TRADUÇÃO</label>
              <div className="flex items-center gap-2">
                <select
                  value={targetTranslationLang}
                  onChange={(e) => setTargetTranslationLang(e.target.value as Language)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-indigo-400 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.name} value={lang.name} className="bg-slate-900">{lang.name}</option>
                  ))}
                </select>
                <button
                  onClick={translateFeedback}
                  disabled={isTranslating || !feedback}
                  className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-indigo-500/20 disabled:opacity-30"
                >
                  {isTranslating ? <i className="fas fa-spinner fa-spin"></i> : 'PRONTO'}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
            {feedback ? (
              <div className="space-y-4">
                <div className="prose prose-invert text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                  {feedback}
                </div>
                {translation && (
                  <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Tradução</p>
                    <p className="text-slate-400 text-sm italic leading-relaxed">{translation}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 opacity-20 text-center">
                <i className="fas fa-wand-magic-sparkles text-5xl mb-6"></i>
                <p className="text-slate-500 italic text-sm font-medium">Grave sua voz para ver a análise.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};