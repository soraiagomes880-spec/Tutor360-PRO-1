import React, { useState } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Language, LANGUAGES } from '../types';
import { withRetry } from '../utils';
import { getGeminiKey } from '../lib/gemini';

interface GrammarLabProps {
  language: Language;
  onAction?: () => void;
  apiKey?: string;
}

export const GrammarLab: React.FC<GrammarLabProps> = ({ language, onAction, apiKey }) => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetTransLang, setTargetTransLang] = useState<Language>('Português Brasil');

  const analyzeWriting = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setAnalysis(null);
    setTranslation(null);
    if (onAction) onAction();
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || getGeminiKey() || '' });
      // Fix: Use GenerateContentResponse generic type for withRetry to resolve "unknown" type error
      const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analyze this ${language} text for grammar, vocabulary, and flow. Suggest corrections and explain why in Portuguese: "${text}"`,
      }));
      setAnalysis(response.text ?? null);
    } catch (e: any) {
      setAnalysis(e.message?.includes('503')
        ? "O servidor de IA está ocupado. Por favor, tente novamente em instantes."
        : "Erro na análise.");
    } finally {
      setIsLoading(false);
    }
  };

  const translateAnalysis = async () => {
    if (!analysis || isTranslating) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || getGeminiKey() || '' });
      // Fix: Use GenerateContentResponse generic type for withRetry to resolve "unknown" type error
      const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Translate the following educational analysis from Portuguese to ${targetTransLang}. Keep the same formatting and tone: "${analysis}"`,
      }));
      setTranslation(response.text ?? null);
    } catch (e) {
      setTranslation("Erro ao traduzir a análise.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Laboratório de Escrita</h2>
        <p className="text-slate-400">Escreva livremente em {language} e deixe a IA polir sua escrita.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[550px]">
        <div className="flex flex-col space-y-4 h-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Escreva algo em ${language}...`}
            className="flex-1 glass-panel p-8 rounded-[2rem] border-white/10 bg-black/20 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none text-lg transition-all"
          />
          <button
            onClick={analyzeWriting}
            disabled={isLoading || !text.trim()}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            Analisar {language}
          </button>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] border-white/10 overflow-hidden flex flex-col bg-slate-900/30">
          <div className="flex justify-between items-center mb-6">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Feedback & Correções</label>
            {analysis && (
              <div className="flex flex-col gap-1 items-end">
                <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest">TRADUÇÃO</label>
                <div className="flex items-center gap-2">
                  <select
                    value={targetTransLang}
                    onChange={(e) => setTargetTransLang(e.target.value as Language)}
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
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-indigo-400">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-sm font-bold uppercase tracking-widest animate-pulse">IA Processando...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="prose prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base bg-white/5 p-6 rounded-2xl border border-white/5 italic">
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
              <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                <i className="fas fa-spell-check text-4xl mb-4 opacity-10"></i>
                <p className="text-center max-w-[250px]">Envie seu texto para receber correções detalhadas e dicas de estilo.</p>
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
