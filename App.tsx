
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveChat } from './components/LiveChat';
import { PronunciationLab } from './components/PronunciationLab';
import { GrammarLab } from './components/GrammarLab';
import { VisualScan } from './components/VisualScan';
import { CultureHub } from './components/CultureHub';
import { Tutorial } from './components/Tutorial';
import { Auth } from './components/Auth';
import { AppTab, Language, LANGUAGES } from './types';
import { supabase } from './lib/supabase';

export type PlanLevel = 'Essencial' | 'Pro' | 'Elite';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [language, setLanguage] = useState<Language>('Inglês');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [plan, setPlan] = useState<PlanLevel>('Essencial');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [setupClickCount, setSetupClickCount] = useState(0);
  const [recoveryMode, setRecoveryMode] = useState(false);

  // States for Inline Setup
  const [showSetup, setShowSetup] = useState(false);
  const [setupUrl, setSetupUrl] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [setupGeminiKey, setSetupGeminiKey] = useState('');
  const [isSavingSetup, setIsSavingSetup] = useState(false);

  useEffect(() => {
    if (showSetup) {
      setSetupUrl(localStorage.getItem('supabase_url') || '');
      setSetupKey(localStorage.getItem('supabase_key') || '');
      setSetupGeminiKey(localStorage.getItem('gemini_api_key') || '');
    }
  }, [showSetup]);

  const handleSaveSetup = () => {
    if (!setupUrl || !setupKey || !setupGeminiKey) {
      alert("Preencha URL, Chave Supabase e Chave Gemini");
      return;
    }
    setIsSavingSetup(true);
    try {
      localStorage.setItem('supabase_url', setupUrl);
      localStorage.setItem('supabase_key', setupKey);
      localStorage.setItem('gemini_api_key', setupGeminiKey);
      window.location.reload();
    } catch (e) {
      alert("Erro ao salvar");
      setIsSavingSetup(false);
    }
  };

  const planLimits: Record<PlanLevel, number> = {
    'Essencial': 50,
    'Pro': 80,
    'Elite': 100
  };

  const usageLimit = planLimits[plan];

  useEffect(() => {
    if (!supabase) {
      setIsLoadingData(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);

      if (supabase && session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('usage_count, plan_level')
            .eq('id', session.user.id)
            .single();

          if (data) {
            setUsageCount(data.usage_count || 0);
            setPlan(data.plan_level || 'Essencial');
          } else if (error && error.code === 'PGRST116') {
            // Cria perfil inicial ZERADO para o novo aluno
            await supabase.from('profiles').insert([
              { id: session.user.id, usage_count: 0, plan_level: 'Essencial' }
            ]);
            setUsageCount(0);
            setPlan('Essencial');
          }
        } catch (e) {
          console.error("Erro na sincronização:", e);
        }
      } else {
        const localUsage = localStorage.getItem('tutor_usage');
        setUsageCount(localUsage ? parseInt(localUsage) : 0);
      }

      setIsLoadingData(false);
    };

    loadData();
  }, [session]);

  const trackUsage = async (): Promise<boolean> => {
    if (usageCount >= usageLimit) {
      alert("Você atingiu o limite do seu Plano Essencial (50/50). Faça o upgrade para continuar aprendendo!");
      return false;
    }

    const nextCount = usageCount + 1;
    setUsageCount(nextCount);

    if (supabase && session?.user) {
      await supabase
        .from('profiles')
        .update({ usage_count: nextCount })
        .eq('id', session.user.id);
    } else {
      localStorage.setItem('tutor_usage', nextCount.toString());
    }
    return true;
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    else {
      setSession(null);
      setUsageCount(0); // Reseta visualmente para visitantes
    }
  };

  if (supabase && (!session || recoveryMode)) {
    return <Auth forceRecovery={recoveryMode} onComplete={() => setRecoveryMode(false)} />;
  }

  if (isLoadingData) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">Preparando sua aula...</p>
        </div>
      </div>
    );
  }

  const currentLang = LANGUAGES.find(l => l.name === language) || LANGUAGES[0];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative">

      {/* Inline Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowSetup(false)} className="absolute top-3 right-3 text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
            <h3 className="text-lg font-bold text-white mb-2 text-center">Configuração de IA</h3>

            <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] space-y-1">
              <p className="font-bold text-slate-500 uppercase tracking-widest">Status da Conexão Global (Vercel):</p>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 italic">Variável VITE_API_KEY:</span>
                {import.meta.env.VITE_API_KEY ? <span className="text-emerald-400 font-black">CONECTADO</span> : <span className="text-amber-500 font-black">PENDENTE</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 italic">Variável VITE_SUPABASE_URL:</span>
                {import.meta.env.VITE_SUPABASE_URL ? <span className="text-emerald-400 font-black">CONECTADO</span> : <span className="text-amber-500 font-black">PENDENTE</span>}
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest text-center">Ajuste Manual (Local)</h3>


            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Supabase Project URL</label>
                <input value={setupUrl} onChange={e => setSetupUrl(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Supabase Anon Key</label>
                <input value={setupKey} onChange={e => setSetupKey(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm" type="password" placeholder="Key..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-emerald-500">Google Gemini API Key</label>
                <input value={setupGeminiKey} onChange={e => setSetupGeminiKey(e.target.value)} className="w-full bg-black/50 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm" type="password" placeholder="AlzaSy..." />
              </div>
              <button onClick={handleSaveSetup} disabled={isSavingSetup} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl mt-2 transition-all">
                {isSavingSetup ? 'Salvando...' : 'Salvar e Conectar TUDO'}
              </button>
            </div>
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10"
            >
              <i className="fas fa-bars text-white"></i>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <div
              className="cursor-pointer select-none"
              onClick={() => {
                setSetupClickCount(prev => {
                  if (prev + 1 >= 5) {
                    setShowSetup(true);
                    return 0;
                  }
                  return prev + 1;
                });
              }}
            >
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-none">Tutor 360</h1>
              <span className="text-[8px] md:text-[9px] bg-indigo-500/10 text-indigo-400/70 px-1.5 py-0.5 rounded border border-indigo-500/10 font-black uppercase mt-1 inline-block tracking-widest">{plan}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">

            {/* O botão "Configurar IA" foi removido da visão do aluno. Acesso via 5 cliques no logo. */}

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

            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
              title="Sair"
            >
              <i className="fas fa-right-from-bracket"></i>
            </button>
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
