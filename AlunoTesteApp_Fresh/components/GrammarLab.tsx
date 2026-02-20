import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Language, LANGUAGES } from '../types';

interface GrammarLabProps {
  language: Language;
  onActivity?: () => void;
}

export const GrammarLab: React.FC<GrammarLabProps> = ({ language, onActivity }) => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeWriting = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setAnalysis(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this ${language} text for grammar. Suggest corrections in Portuguese: "${text}"`,
        });
        setAnalysis(response.text ?? "Análise concluída.");
        if (onActivity) onActivity();
    } catch (e) {
        setAnalysis("Erro na análise.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Laboratório de Escrita</h2>
        <p className="text-slate-400">Escreva livremente e deixe a IA polir sua escrita.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[550px]">
        <div className="flex flex-col space-y-4 h-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 glass-panel p-8 rounded-[2rem] border-white/10 bg-black/20 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none text-lg transition-all"
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
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Feedback</label>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-indigo-400">
                <i className="fas fa-circle-notch fa-spin text-2xl"></i>
              </div>
            ) : analysis ? (
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                {analysis}
              </div>
            ) : (
              <p className="text-slate-600 italic text-center p-12">Envie seu texto para análise.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};