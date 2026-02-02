
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Language, LANGUAGES } from '../types';

interface GrammarLabProps {
  language: Language;
}

export const GrammarLab: React.FC<GrammarLabProps> = ({ language }) => {
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
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Analyze this ${language} text for grammar, vocabulary, and flow. Suggest corrections and explain why in Portuguese: "${text}"`,
      });
      setAnalysis(response.text);
    } catch (e: any) {
      setAnalysis("Erro na análise: " + (e.message || e.toString()));
    } finally {
      setIsLoading(false);
    }
  };

  const translateAnalysis = async () => {
    if (!analysis || isTranslating) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Translate the following educational analysis from Portuguese to ${targetTransLang}. Keep the same formatting and tone: "${analysis}"`,
      });
      setTranslation(response.text);
    } catch (e: any) {
      setTranslation("Erro ao traduzir: " + (e.message || e.toString()));
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
        {/* Painel de Entrada */}
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

        {/* Painel de Resultado */}
        <div className="glass-panel p-8 rounded-[2rem] border-white/10 overflow-hidden flex flex-col bg-slate-900/30">
          <div className="flex items-center justify-between mb-6">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Feedback & Correções</label>
            {analysis && !isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gerado</span>
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
                <div className="prose prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {analysis}
                </div>

                {translation && (
                  <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 mb-4">
                      <i className="fas fa-language text-indigo-400"></i>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Tradução para {targetTransLang}</span>
                    </div>
                    <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed whitespace-pre-wrap italic text-sm">
                      {translation}
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex-1 w-full">
                      <select
                        value={targetTransLang}
                        onChange={(e) => setTargetTransLang(e.target.value as Language)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.name} value={lang.name} className="bg-slate-900">{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={translateAnalysis}
                      disabled={isTranslating}
                      className="w-full sm:w-auto px-6 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {isTranslating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-language"></i>}
                      Traduzir Explicação
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 italic text-center">Traduzir o feedback da IA ajuda na compreensão profunda dos erros.</p>
                </div>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
