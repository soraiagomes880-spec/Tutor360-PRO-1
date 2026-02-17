
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveChat } from './components/LiveChat';
import { PronunciationLab } from './components/PronunciationLab';
import { GrammarLab } from './components/GrammarLab';
import { VisualScan } from './components/VisualScan';
import { CultureHub } from './components/CultureHub';
import { Tutorial } from './components/Tutorial';
import { AppTab, Language, LANGUAGES } from './types';

export type PlanLevel = 'Essencial' | 'Pro' | 'Elite';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [language, setLanguage] = useState<Language>('Inglês');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  
  // Alterado para 'Essencial' para refletir o limite de 50 créditos solicitado
  const [plan, setPlan] = useState<PlanLevel>('Essencial');

  const planLimits: Record<PlanLevel, number> = {
    'Essencial': 50,
    'Pro': 80,
    'Elite': 100
  };

  const usageLimit = planLimits[plan];
  const currentLang = LANGUAGES.find(l => l.name === language) || LANGUAGES[0];

  const trackUsage = () => {
    setUsageCount(prev => Math.min(prev + 1, usageLimit));
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        usage={usageCount} 
        limit={usageLimit} 
        planName={plan}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="sticky top-0 z-20 glass-panel border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10"
            >
              <i className="fas fa-bars text-white"></i>
            </button>
            <div className="hidden xs:flex w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-none truncate">
                Tutor 360 <span className="text-indigo-400">IA</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Premium Learning</span>
                <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-black uppercase">{plan}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 px-3 md:px-4 py-2 rounded-xl hover:bg-white/10 transition-all group"
              >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="hidden sm:inline text-sm font-medium text-slate-300 group-hover:text-white">{currentLang.name}</span>
                <i className={`fas fa-chevron-down text-[10px] text-slate-500 transition-transform ${showLangMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {showLangMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-2xl border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Escolha o Idioma</p>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.name}
                      onClick={() => {
                        setLanguage(lang.name);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${language === lang.name ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-300'}`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-white/10 text-xs text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Escola Parceira
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard language={language} setActiveTab={setActiveTab} usage={usageCount} limit={usageLimit} planName={plan} />}
          {activeTab === 'live' && <LiveChat language={language} onAction={trackUsage} />}
          {activeTab === 'pronunciation' && <PronunciationLab language={language} onAction={trackUsage} />}
          {activeTab === 'writing' && <GrammarLab language={language} onAction={trackUsage} />}
          {activeTab === 'scan' && <VisualScan language={language} onAction={trackUsage} />}
          {activeTab === 'culture' && <CultureHub language={language} onAction={trackUsage} />}
          {activeTab === 'tutorial' && <Tutorial setActiveTab={setActiveTab} />}
        </div>
      </main>
    </div>
  );
};

export default App;
