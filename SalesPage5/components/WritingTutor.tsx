
import React, { useState } from 'react';
import { Language, Feedback } from '../types';
import { analyzeWriting, translateText } from '../services/geminiService';
import TTSButton from './TTSButton';

interface WritingTutorProps {
  targetLanguage: Language;
  onAction: () => void;
}

const WritingTutor: React.FC<WritingTutorProps> = ({ targetLanguage, onAction }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [quickTranslation, setQuickTranslation] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setQuickTranslation(null);
    onAction(); // Usage increment
    try {
      const result = await analyzeWriting(text, targetLanguage.name);
      setFeedback({
        original: text,
        ...result
      });
    } catch (err) {
      console.error(err);
      alert('Failed to analyze writing. Try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickTranslate = async () => {
    if (!text.trim()) return;
    setIsTranslating(true);
    onAction(); // Usage increment
    try {
      const translation = await translateText(text, 'English');
      setQuickTranslation(translation || null);
    } catch (err) {
      console.error(err);
      alert('Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 p-6 md:p-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Writing Lab</h2>
          <p className="text-slate-500">Master grammar and style with AI coaching.</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Write a few sentences in ${targetLanguage.name}...`}
              className="w-full h-72 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-lg resize-none transition-all shadow-inner"
            />
            <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-300">
              {text.length} characters
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || isTranslating || !text.trim()}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-md ${
                isAnalyzing || isTranslating || !text.trim() ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-95'
              }`}
            >
              {isAnalyzing ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analyze Draft
                </>
              )}
            </button>
            
            <button
              onClick={handleQuickTranslate}
              disabled={isAnalyzing || isTranslating || !text.trim()}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border-2 ${
                isAnalyzing || isTranslating || !text.trim() 
                  ? 'border-slate-100 text-slate-300 cursor-not-allowed' 
                  : 'border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 active:scale-95'
              }`}
            >
              {isTranslating ? (
                <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c1.382 0 2.72.253 3.946.706" />
                  </svg>
                  Translate to EN
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {(feedback || quickTranslation) ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Quick Translation Result */}
              {quickTranslation && (
                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0">
                    <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Quick Translation</div>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-xl text-slate-800 font-medium leading-relaxed italic flex-1">"{quickTranslation}"</p>
                    <TTSButton text={quickTranslation} language="English" className="mt-1 bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-none scale-90" />
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {feedback && (
                <>
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 flex items-center gap-2">
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Corrected</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-xl text-slate-800 font-bold leading-relaxed flex-1">{feedback.corrected}</p>
                      <TTSButton text={feedback.corrected} language={targetLanguage.name} className="mt-1" />
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden">
                      <h4 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Full Translation</h4>
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-slate-700 italic flex-1">"{feedback.translation}"</p>
                        <TTSButton text={feedback.translation} language="English" className="scale-75 !p-1.5 shadow-none border-none bg-indigo-50 text-indigo-600" />
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Coaching Notes</h4>
                        <TTSButton 
                          text={feedback.explanation} 
                          language="English" 
                          className="scale-75 !p-2 !rounded-full shadow-none border-none bg-transparent text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" 
                        />
                      </div>
                      <p className="text-slate-600 leading-relaxed">{feedback.explanation}</p>
                    </div>
                  </div>

                  {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <h4 className="text-xs font-black text-indigo-400 uppercase mb-4 tracking-widest">Level Up Vocab</h4>
                      <div className="flex flex-wrap gap-2">
                        {feedback.suggestions.map((word, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white border border-indigo-200 pl-3 pr-2 py-1.5 rounded-lg shadow-sm">
                            <span className="text-sm font-bold text-indigo-700">{word}</span>
                            <TTSButton text={word} language={targetLanguage.name} className="bg-indigo-50 text-indigo-600 p-1 hover:bg-indigo-100 shadow-none border-none" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-10 opacity-60">
              <svg className="w-16 h-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-bold text-slate-500 mb-2">Awaiting Analysis</h3>
              <p className="text-sm text-slate-400 max-w-xs">Use the buttons below your draft to get a quick translation or a full grammatical analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingTutor;
