
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [language, setLanguage] = useState<Language>('Inglês');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [apiKeyDetected, setApiKeyDetected] = useState(false);
  
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('tutor360_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { lessons: 0, hours: 0, days: 0, usage: 0, lastActiveDate: null };
  });

  useEffect(() => {
    const key = process.env.API_KEY;
    const isDetected = !!key && key.length > 10;
    setApiKeyDetected(isDetected);
    
    localStorage.setItem('tutor360_stats', JSON.stringify(stats));
  }, [stats]);

  const recordActivity = (durationMinutes: number = 5) => {
    setStats(prev => ({
      ...prev,
      lessons: prev.lessons + 1,
      hours: Number((prev.hours + durationMinutes / 60).toFixed(1)),
      usage: Math.min(prev.usage + 1, 15)
    }));
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  const currentLang = LANGUAGES.find(l => l.name === language) || LANGUAGES[0];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar Desktop - Não modificada conforme solicitado */}
      <div className="hidden md:flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} usage={stats.usage} />
      </div>

      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0 custom-scrollbar">
        <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Tutor 360 <span className="text-indigo-400">IA</span></h1>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)} 
              className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-all shadow-lg active:scale-95"
            >
              <span className="text-xl">{currentLang.flag}</span>
              <span className="text-sm font-medium hidden sm:inline">{currentLang.name}</span>
              <i className={`fas fa-chevron-down text-[10px] ml-1 opacity-50 transition-transform ${showLangMenu ? 'rotate-180' : ''}`}></i>
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}></div>
                <div className="absolute right-0 mt-3 w-64 glass-panel border border-white/10 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 grid grid-cols-1 gap-1">
                    <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Escolha o Idioma</p>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.name}
                        onClick={() => handleLanguageSelect(lang.name)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left group ${
                          language === lang.name 
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{lang.name}</span>
                          <span className="text-[10px] opacity-40 uppercase tracking-tighter">{lang.region}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {!apiKeyDetected && (
            <div className="glass-panel p-8 rounded-[2rem] border-red-500/30 bg-red-500/5 mb-8 text-center animate-in zoom-in duration-500">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-triangle-exclamation text-red-400 text-2xl"></i>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Aguardando Redesploy</h3>
                <p className="text-slate-400 text-sm mb-4">A chave <b>API_KEY</b> foi configurada, mas você precisa clicar em <b>Redeploy</b> para ativar.</p>
              </div>
            </div>
          )}

          <Suspense fallback={<div className="flex items-center justify-center h-full py-20"><i className="fas fa-circle-notch fa-spin text-3xl text-indigo-500"></i></div>}>
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

      {/* Navegação Mobile com suporte a scroll lateral e botão de Ajuda sempre presente */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 z-50 bg-slate-950/90 backdrop-blur-xl">
        <div className="flex items-center overflow-x-auto py-3 px-4 no-scrollbar gap-5 sm:gap-8">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 min-w-[56px] transition-all flex-shrink-0 ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}>
            <i className="fas fa-house text-lg"></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Início</span>
          </button>
          
          <button onClick={() => setActiveTab('live')} className={`flex flex-col items-center gap-1 min-w-[56px] transition-all flex-shrink-0 ${activeTab === 'live' ? 'text-indigo-400' : 'text-slate-500'}`}>
            <i className="fas fa-microphone-lines text-lg"></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Voz</span>
          </button>

          <button onClick={() => setActiveTab('pronunciation')} className={`flex flex-col items-center gap-1 min-w-[56px] transition-all flex-shrink-0 ${activeTab === 'pronunciation' ? 'text-indigo-400' : 'text-slate-500'}`}>
            <i className="fas fa-volume-high text-lg"></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Fala</span>
          </button>

          <button onClick={() => setActiveTab('writing')} className={`flex flex-col items-center gap-1 min-w-[56px] transition-all flex-shrink-0 ${activeTab === 'writing' ? 'text-indigo-400' : 'text-slate-500'}`}>
            <i className="fas fa-pen-nib text-lg"></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Escrita</span>
          </button>

          <button onClick={() => setActiveTab('scan')} className={`flex flex-col items-center gap-1 min-w-[56px] transition-all flex-shrink-0 ${activeTab === 'scan' ? 'text-indigo-400' : 'text-slate-500'}`}>
            <i className="fas fa-eye text-lg"></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Olhar</span>
          </button>

          <button onClick={() => setActiveTab('culture')} className={`flex flex-col items-center gap-1 min-w-[56px] transition-all flex-shrink-0 ${activeTab === 'culture' ? 'text-indigo-400' : 'text-slate-500'}`}>
            <i className="fas fa-earth-americas text-lg"></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Cultura</span>
          </button>

          <button onClick={() => setActiveTab('help')} className={`flex flex-col items-center gap-1 min-w-[56px] pr-4 transition-all flex-shrink-0 ${activeTab === 'help' ? 'text-indigo-400' : 'text-slate-500'}`}>
            <i className="fas fa-circle-question text-lg"></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Ajuda</span>
          </button>
        </div>
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
