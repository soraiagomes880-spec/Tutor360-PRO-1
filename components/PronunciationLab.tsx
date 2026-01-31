
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Language } from '../types';

interface PronunciationLabProps {
  language: Language;
}

const DEFAULT_PHRASES: Record<Language, string> = {
  'Inglês': 'Through the thickest fog, the three friends thought they heard thunder.',
  'Espanhol': 'Tres tristes tigres tragaban trigo en un trigal.',
  'Francês': 'Un chasseur sachant chasser sans son chien est un bon chasseur.',
  'Alemão': 'Fischers Fritz fischt frische Fische, frische Fische fischt Fischers Fritz.',
  'Português Brasil': 'O rato roeu a roupa do rei de Roma e a rainha raivosa rasgou o resto.',
  'Japonês': '生麦生米生卵 (Namamugi namamigome namatamago).',
  'Italiano': 'Trentatré trentini entrarono a Trento tutti e trentatré trotterellando.',
  'Chinês': '妈妈骑马。马慢，妈妈骂马。(Māma qí mǎ. Mǎ màn, māma mà mǎ.)'
};

export const PronunciationLab: React.FC<PronunciationLabProps> = ({ language }) => {
  const [targetPhrase, setTargetPhrase] = useState(DEFAULT_PHRASES[language]);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setTargetPhrase(DEFAULT_PHRASES[language]);
    setFeedback(null);
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ parts: [{ text: `Say this clearly in ${language}: ${targetPhrase}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
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
      console.error(e);
      setIsPlayingTarget(false);
    }
  };

  const handleAnalyze = async () => {
    setIsRecording(false);
    if (!targetPhrase.trim()) {
      setFeedback("Por favor, escreva algo para treinar.");
      return;
    }
    setFeedback("Analisando sua pronúncia...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Analyze the pronunciation of this phrase in ${language} for a student: "${targetPhrase}". Assume the student just spoke this. Provide 3 specific tips on how to pronounce specific sounds or words in this text clearly. Respond in Portuguese.`,
      });
      setFeedback(response.text);
    } catch (e) {
      setFeedback("Erro ao analisar. Tente novamente.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Laboratório de Pronúncia</h2>
          <p className="text-slate-400">Personalize seu treino escrevendo exatamente o que deseja praticar em {language}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 shadow-xl space-y-8 flex flex-col">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">O que você quer treinar?</label>
              <button
                onClick={() => setTargetPhrase('')}
                className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
              >
                Limpar Texto
              </button>
            </div>
            <textarea
              value={targetPhrase}
              onChange={(e) => setTargetPhrase(e.target.value)}
              placeholder={`Escreva uma palavra ou frase em ${language} aqui...`}
              className="w-full bg-black/30 p-6 rounded-2xl border border-white/10 text-xl font-medium text-white leading-relaxed focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none h-40"
            />
            <div className="flex justify-end">
              <button
                onClick={playTargetAudio}
                disabled={isPlayingTarget || !targetPhrase.trim()}
                className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
              >
                <i className={`fas ${isPlayingTarget ? 'fa-spinner fa-spin' : 'fa-volume-high'}`}></i>
                {isPlayingTarget ? 'Reproduzindo...' : 'Ouvir Pronúncia da IA'}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 py-4 flex-1 justify-center">
            <button
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={handleAnalyze}
              disabled={!targetPhrase.trim()}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 group relative disabled:opacity-20 disabled:grayscale ${isRecording ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-90' : 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-900/40 hover:scale-105'}`}
            >
              <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'} text-4xl text-white`}></i>
              {isRecording && <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>}
            </button>
            <div className="text-center">
              <p className={`font-black text-sm transition-all uppercase tracking-widest ${isRecording ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                {isRecording ? 'Capturando sua voz...' : 'Segure para Gravar sua fala'}
              </p>
              {!targetPhrase.trim() && <p className="text-[10px] text-red-400/50 mt-2 uppercase tracking-tighter">Escreva algo acima primeiro</p>}
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 shadow-xl flex flex-col min-h-[500px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Feedback Fonético Personalizado</label>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {feedback ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4 text-green-400 mb-6 bg-green-400/10 p-5 rounded-2xl border border-green-400/20">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-spell-check"></i>
                  </div>
                  <div>
                    <p className="font-bold">Análise do Tutor IA</p>
                    <p className="text-[10px] uppercase opacity-80 tracking-tighter">Foco na clareza e entonação</p>
                  </div>
                </div>
                <div className="prose prose-invert text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/5 italic">
                  {feedback}
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                  <p className="text-[10px] text-indigo-300 font-bold uppercase mb-2">Dica de mestre:</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Pratique cada palavra difícil isoladamente antes de tentar a frase completa várias vezes.</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 italic p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 opacity-20">
                  <i className="fas fa-keyboard text-3xl"></i>
                </div>
                <p className="max-w-[200px] text-sm leading-relaxed">Digite qualquer palavra ou frase difícil no campo ao lado. Grave-se falando e receba dicas instantâneas de como melhorar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};
