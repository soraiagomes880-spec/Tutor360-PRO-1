
import React, { useState, useEffect } from 'react';
import { StudyMode, Language, LANGUAGES } from './types';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import VoiceTutor from './components/VoiceTutor';
import WritingTutor from './components/WritingTutor';
import VisualTutor from './components/VisualTutor';
import CultureTutor from './components/CultureTutor';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<StudyMode>('voice');
  const [targetLang, setTargetLang] = useState<Language>(LANGUAGES[0]);
  
  // Usage tracking state
  const [usageCount, setUsageCount] = useState<number>(() => {
    const saved = localStorage.getItem('tutor360_usage');
    return saved ? parseInt(saved, 10) : 0;
  });

  const MAX_USAGE = 50;

  useEffect(() => {
    localStorage.setItem('tutor360_usage', usageCount.toString());
  }, [usageCount]);

  const incrementUsage = () => {
    if (usageCount < MAX_USAGE) {
      setUsageCount(prev => prev + 1);
    }
  };

  const renewSubscription = () => {
    setUsageCount(0);
  };

  const isLimitReached = usageCount >= MAX_USAGE;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Aprender <span className="text-indigo-600">{targetLang.name}</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Seu caminho de aprendizado total, guiado pela Inteligência Artificial.</p>
          </div>
          
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-sm font-bold text-slate-400 uppercase ml-2">Objetivo:</span>
              <select 
                value={targetLang.code}
                onChange={(e) => setTargetLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Credit Counter Button */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso do Plano</span>
                  <span className={`text-xs font-black ${usageCount > 40 ? 'text-red-500' : 'text-indigo-600'}`}>
                    {usageCount}/{MAX_USAGE}
                  </span>
               </div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${usageCount > 45 ? 'bg-red-500' : usageCount > 30 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                    style={{ width: `${(usageCount / MAX_USAGE) * 100}%` }}
                  ></div>
               </div>
               {isLimitReached && (
                 <button 
                  onClick={renewSubscription}
                  className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition-all shadow-md shadow-emerald-100 animate-pulse"
                 >
                   RENOVAR ASSINATURA
                 </button>
               )}
            </div>
          </div>
        </div>

        <ModeSelector activeMode={activeMode} setActiveMode={setActiveMode} />

        <div className="mt-10 transition-all duration-300 relative">
          {isLimitReached ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-indigo-200 shadow-xl animate-in zoom-in-95 duration-500">
               <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
               </div>
               <h2 className="text-3xl font-black text-slate-800 mb-4">Limite de 50 Usos Atingido!</h2>
               <p className="text-slate-500 max-w-md mx-auto mb-8">
                 Você aproveitou ao máximo seu tutor hoje. Para continuar praticando e desbloquear mais 50 usos, clique no botão abaixo para renovar sua assinatura.
               </p>
               <button 
                onClick={renewSubscription}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center gap-3 mx-auto"
               >
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
                 RENOVAR AGORA
               </button>
            </div>
          ) : (
            <>
              {activeMode === 'voice' && <VoiceTutor targetLanguage={targetLang} onAction={incrementUsage} />}
              {activeMode === 'writing' && <WritingTutor targetLanguage={targetLang} onAction={incrementUsage} />}
              {activeMode === 'visual' && <VisualTutor targetLanguage={targetLang} onAction={incrementUsage} />}
              {activeMode === 'culture' && <CultureTutor targetLanguage={targetLang} onAction={incrementUsage} />}
            </>
          )}
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg font-black text-slate-800">TUTOR 360 IA</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Experiência completa de ensino de idiomas com inteligência artificial multimodal.</p>
          </div>
          
          <div className="flex justify-center gap-8 mb-6">
            <a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">Privacidade</a>
            <a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">Termos</a>
            <a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">Suporte</a>
          </div>
          
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em]">
            TUTOR 360 IA &copy; {new Date().getFullYear()} — Powered by Gemini 2.5
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
