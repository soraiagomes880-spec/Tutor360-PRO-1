import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Language, LANGUAGES } from '../types';

interface GrammarLabProps {
  language: Language;
  onActivity?: () => void;
  apiKey?: string;
}

export const GrammarLab: React.FC<GrammarLabProps> = ({ language, onActivity, apiKey }) => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Translation states
  const [targetTranslationLang, setTargetTranslationLang] = useState<Language>('Português Brasil');
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const analyzeWriting = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setAnalysis(null);
    setTranslation(null);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analyze this ${language} text for grammar. Suggest corrections in ${language}. Keep the tips short and point out 3 things: "${text}"`,
      });
      setAnalysis(response.text ?? "Análise concluída.");
      if (onActivity) onActivity();
    } catch (e) {
      setAnalysis("Erro na análise.");
    } finally {
      setIsLoading(false);
    }
  };

  const translateAnalysis = async () => {
    if (!analysis || isTranslating || analysis === "Analisando..." || analysis === "Erro na análise.") return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Traduza esta análise gramatical para ${targetTranslationLang}. Preserve a formatação técnica: "${analysis}"`,
      });
      setTranslation(response.text ?? "Erro na tradução.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Laboratório de Escrita</h2>
          <p className="text-slate-400">Escreva livremente e deixe a IA polir sua escrita.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[550px]">
        <div className="flex flex-col space-y-4 h-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 glass-panel p-8 rounded-[2rem] border-white/10 bg-black/20 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none text-lg transition-all"
            placeholder={`Escreva algo em ${language}...`}
          />
          <button
            onClick={analyzeWriting}
            disabled={isLoading || !text.trim()}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            Analisar {language}
          </button>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] border-white/10 overflow-hidden flex flex-col bg-slate-900/30">
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
                  onClick={translateAnalysis}
                  disabled={isTranslating || !analysis}
                  className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-indigo-500/20 disabled:opacity-30"
                >
                  {isTranslating ? <i className="fas fa-spinner fa-spin"></i> : 'PRONTO'}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-indigo-400">
                <i className="fas fa-circle-notch fa-spin text-2xl"></i>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-sm bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                  {analysis}
                </div>
                {translation && (
                  <div className="bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Tradução</p>
                    <div className="prose prose-invert max-w-none text-slate-400 text-sm italic leading-relaxed whitespace-pre-wrap">
                      {translation}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 opacity-20 text-center">
                <i className="fas fa-edit text-5xl mb-6"></i>
                <p className="text-slate-500 italic text-sm font-medium">Envie seu texto para análise.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};