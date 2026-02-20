
import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveChat } from './components/LiveChat';
import { PronunciationLab } from './components/PronunciationLab';
import { GrammarLab } from './components/GrammarLab';
import { VisualScan } from './components/VisualScan';
import { CultureHub } from './components/CultureHub';
import { Tutorial } from './components/Tutorial';
import { AppTab, Language, LANGUAGES } from './types';

interface UserStats {
  lessons: number;
  hours: number;
  days: number;
  usage: number;
  lastActiveDate: string | null;
}

const USAGE_LIMIT = 15;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [language, setLanguage] = useState<Language>('Inglês');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownExitPopup, setHasShownExitPopup] = useState(false);
  
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('tutor360_stats_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { lessons: 0, hours: 0, days: 0, usage: 0, lastActiveDate: null };
  });

  useEffect(() => {
    localStorage.setItem('tutor360_stats_v1', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 5 && !hasShownExitPopup) {
        setShowExitPopup(true);
        setHasShownExitPopup(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShownExitPopup]);

  const recordActivity = (durationMinutes: number = 5) => {
    setStats(prev => {
      const newUsage = prev.usage + 1;
      return {
        ...prev,
        lessons: prev.lessons + 1,
        hours: Number((prev.hours + durationMinutes / 60).toFixed(1)),
        usage: newUsage > USAGE_LIMIT ? USAGE_LIMIT : newUsage
      };
    });
  };

  const currentLang = LANGUAGES.find(l => l.name === language) || LANGUAGES[0];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#020617] text-slate-200 overflow-hidden">
      
      {/* POPUP DE INTENÇÃO DE SAÍDA */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowExitPopup(false)}></div>
          <div className="relative w-full max-w-lg glass-panel p-8 md:p-14 rounded-[2.5rem] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center animate-in zoom-in duration-300">
            <button onClick={() => setShowExitPopup(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
            <div className="w-24 h-24 bg-[#1e293b]/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
              <i className="fas fa-lock text-indigo-500 text-4xl"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Espere! Não vá ainda!</h2>
            <p className="text-slate-400 text-base md:text-lg mb-10 leading-relaxed px-4">
              Você ainda tem acesso gratuito ao Tutor 360 IA. Queremos te oferecer uma condição especial para se tornar parceiro.
            </p>
            <button 
              onClick={() => {
                setShowExitPopup(false);
                window.open('https://api.whatsapp.com/send?phone=5511914146879&text=Quero%20testar', '_blank');
              }}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-950/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-lg mb-8"
            >
              Seja uma Escola Parceira
              <i className="fas fa-arrow-right"></i>
            </button>
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em]">
              TUTOR 360 IA • PREMIUM LEARNING
            </p>
          </div>
        </div>
      )}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} usage={stats.usage} />

      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0 custom-scrollbar">
        <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-white">Tutor 360 <span className="text-indigo-400">IA</span></h1>
          </div>
          <div className="relative">
            <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-all">
              <span className="text-xl">{currentLang.flag}</span>
              <span className="text-sm font-medium hidden sm:inline">{currentLang.name}</span>
              <i className="fas fa-chevron-down text-[10px] ml-1 opacity-50"></i>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-3 w-64 glass-panel border border-white/10 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden">
                <div className="p-2 grid grid-cols-1 gap-1">
                  {LANGUAGES.map((lang) => (
                    <button key={lang.name} onClick={() => { setLanguage(lang.name); setShowLangMenu(false); }} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${language === lang.name ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-bold">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Suspense fallback={<div className="flex items-center justify-center py-20"><i className="fas fa-circle-notch fa-spin text-3xl text-indigo-500"></i></div>}>
            {activeTab === 'dashboard' && <Dashboard language={language} onStart={() => setActiveTab('live')} onViewHelp={() => setActiveTab('help')} stats={stats} />}
            {activeTab === 'live' && <LiveChat language={language} onSessionEnd={recordActivity} />}
            {activeTab === 'pronunciation' && <PronunciationLab language={language} onActivity={recordActivity} />}
            {activeTab === 'writing' && <GrammarLab language={language} onActivity={recordActivity} />}
            {activeTab === 'scan' && <VisualScan language={language} onActivity={recordActivity} />}
            {activeTab === 'culture' && <CultureHub language={language} />}
            {activeTab === 'help' && <Tutorial />}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;
