
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveChat } from './components/LiveChat';
import { PronunciationLab } from './components/PronunciationLab';
import { GrammarLab } from './components/GrammarLab';
import { VisualScan } from './components/VisualScan';
import { CultureHub } from './components/CultureHub';
import { Tutorial } from './components/Tutorial';
import { AppTab, Language, LANGUAGES } from './types';
import { getGeminiKey, saveGeminiKey } from './lib/gemini';

const SetupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(getGeminiKey() || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg glass-panel p-8 rounded-[2.5rem] border-white/10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-900/40">
            <i className="fas fa-cog text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Configurações Avançadas</h2>
          <p className="text-slate-400 text-xs mt-1 lowercase">Ambiente de Controle do Administrador</p>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Google Gemini API Key</label>
              {getGeminiKey() && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-black uppercase">Ativo</span>}
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 outline-none focus:border-indigo-500/50 transition-all font-mono text-xs"
            />
          </div>
          <button
            onClick={() => { saveGeminiKey(apiKey); window.location.reload(); }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40 active:scale-95 text-xs uppercase"
          >
            Salvar e Ativar Chave
          </button>

          <button
            onClick={() => { localStorage.removeItem('tutor_usage'); window.location.reload(); }}
            className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold rounded-xl transition-all border border-red-500/20 active:scale-95 text-xs uppercase"
          >
            Resetar Limite de Uso
          </button>
        </div>

        <div className="pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] text-slate-600 leading-relaxed max-w-xs mx-auto italic uppercase tracking-wider font-medium">As chaves são salvas localmente e priorizam as variáveis de ambiente da Vercel.</p>
        </div>
      </div>
    </div>
  );
};

export type PlanLevel = 'Essencial' | 'Pro' | 'Elite';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [language, setLanguage] = useState<Language>('Inglês');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownExitPopup, setHasShownExitPopup] = useState(false);

  // Robustness & Config States
  const [setupClickCount, setSetupClickCount] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => getGeminiKey() || '');

  // Usage State (15 uses for Essential)
  const [usageCount, setUsageCount] = useState(() => {
    const saved = localStorage.getItem('tutor_usage');
    return saved ? parseInt(saved) : 0;
  });
  const [plan] = useState<PlanLevel>('Elite'); // Unlocking all features for test
  const usageLimit = 15; // Set to 15 globally

  // Exit Popup trigger
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

  // Key Shortcut for Setup (Shift+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
        setShowSetup(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConfigTrigger = () => {
    setSetupClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowSetup(true);
        return 0;
      }
      return next;
    });
  };

  const trackUsage = () => {
    if (usageCount >= usageLimit) return;
    const nextCount = usageCount + 1;
    setUsageCount(nextCount);
    localStorage.setItem('tutor_usage', nextCount.toString());
  };

  const currentLang = LANGUAGES.find(l => l.name === language) || LANGUAGES[0];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative">

      {/* POPUP DE INTENÇÃO DE SAÍDA */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowExitPopup(false)}></div>
          <div className="relative w-full max-w-lg glass-panel p-8 md:p-14 rounded-[2.5rem] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center animate-in zoom-in duration-300">
            <button onClick={() => setShowExitPopup(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
            <div className="w-24 h-24 bg-[#1e293b]/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
              <i className="fas fa-graduation-cap text-indigo-500 text-4xl"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Acelere sua Fluência Agora!</h2>
            <p className="text-slate-200 text-base md:text-lg mb-10 leading-relaxed px-4 font-medium">
              O Tutor 360 IA é o seu passaporte para falar com confiança. Não pare seus estudos agora! Escolha um plano de aceleração e turbine seu aprendizado 24h por dia.
            </p>
            <button
              onClick={() => {
                setShowExitPopup(false);
                window.open('https://practice-360-buddy.lovable.app', '_blank');
              }}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-950/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-lg mb-8 uppercase tracking-wider"
            >
              Escolher meu Plano de Estudos
              <i className="fas fa-arrow-right"></i>
            </button>
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em]">
              TUTOR 360 IA • PREMIUM LEARNING
            </p>
          </div>
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
        usage={usageCount}
        limit={usageLimit}
        planName={plan}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="sticky top-0 z-20 glass-panel border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10"
            >
              <i className="fas fa-bars text-white"></i>
            </button>
            <div
              onClick={handleConfigTrigger}
              className="cursor-pointer hidden xs:flex w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg items-center justify-center shadow-lg shadow-indigo-500/20"
            >
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-none">Tutor 360 <span className="text-indigo-400">IA</span></h1>
              <span className="text-[8px] md:text-[9px] bg-indigo-500/10 text-indigo-400/70 px-1.5 py-0.5 rounded border border-indigo-500/10 font-black uppercase mt-1 inline-block tracking-widest">{plan}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10 transition-all">
                <span className="text-lg">{currentLang.flag}</span>
                <i className={`fas fa-chevron-down text-[10px] text-slate-500 transition-transform ${showLangMenu ? 'rotate-180' : ''}`}></i>
              </button>
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-2xl border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {LANGUAGES.map((lang) => (
                    <button key={lang.name} onClick={() => { setLanguage(lang.name); setShowLangMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-300 transition-colors">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          <Suspense fallback={<div className="flex items-center justify-center py-20"><i className="fas fa-circle-notch fa-spin text-3xl text-indigo-500"></i></div>}>
            {activeTab === 'dashboard' && <Dashboard language={language} setActiveTab={setActiveTab} usage={usageCount} limit={usageLimit} planName={plan} />}
            {activeTab === 'live' && <LiveChat language={language} onAction={trackUsage} apiKey={customApiKey} />}
            {activeTab === 'pronunciation' && <PronunciationLab language={language} onAction={trackUsage} apiKey={customApiKey} />}
            {activeTab === 'writing' && <GrammarLab language={language} onAction={trackUsage} apiKey={customApiKey} />}
            {activeTab === 'scan' && <VisualScan language={language} onAction={trackUsage} apiKey={customApiKey} />}
            {activeTab === 'culture' && <CultureHub language={language} onAction={trackUsage} apiKey={customApiKey} />}
            {activeTab === 'tutorial' && <Tutorial setActiveTab={setActiveTab} />}
          </Suspense>
        </div>
        <SetupModal isOpen={showSetup} onClose={() => setShowSetup(false)} />
      </main>
    </div>
  );
};

export default App;
