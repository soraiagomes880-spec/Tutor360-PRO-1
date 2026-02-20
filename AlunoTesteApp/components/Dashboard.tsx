
import React from 'react';
import { Language, AppTab } from '../types';

interface DashboardProps {
  language: Language;
  setActiveTab: (tab: AppTab) => void;
  usage: number;
  limit: number;
  planName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ language, setActiveTab, usage, limit, planName }) => {
  const usagePercentage = Math.round((usage / limit) * 100);
  const strokeDashoffset = 502 - (502 * usagePercentage) / 100;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Praticar {language}</h2>
          <p className="text-slate-400 text-base md:text-lg">Foco de hoje: <span className="text-indigo-400 font-semibold">Conversação Natural</span></p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Plano {planName} Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-transparent">
          <div className="relative z-10 flex flex-col items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full border-8 border-indigo-500/20 flex items-center justify-center relative shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-500" strokeDasharray="502" strokeDashoffset={strokeDashoffset} style={{ r: '38%' }} />
              </svg>
              <div className="text-center">
                <span className="text-2xl font-black text-white">{usagePercentage}%</span>
                <p className="text-[8px] text-slate-400 uppercase font-bold">Uso</p>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-2">Progresso no Plano</h3>
              <p className="text-slate-400 text-sm mb-4 italic">Você ainda tem {limit - usage} créditos disponíveis este mês.</p>
              <button onClick={() => setActiveTab('live')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-900/40">Continuar Prática de Voz</button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/10 bg-slate-900/40 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20 shadow-xl shadow-indigo-950/40 animate-pulse">
            <i className="fas fa-rocket text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Todas as Funções Liberadas</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
            Você está usando a versão **ELITE**. Aproveite todos os recursos avançados sem restrições durante o teste.
          </p>
        </div>
      </div>
    </div>
  );
};
