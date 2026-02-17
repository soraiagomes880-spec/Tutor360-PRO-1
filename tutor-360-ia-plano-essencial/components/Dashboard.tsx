
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
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Aprender {language}</h2>
          <p className="text-slate-400 text-base md:text-lg">Seu objetivo: <span className="text-indigo-400 font-semibold">Fluência Profissional</span></p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Plano {planName} Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-panel p-6 rounded-3xl border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-4">
            <i className="fas fa-check-double text-xl"></i>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Ações Realizadas</p>
          <h3 className="text-xl md:text-2xl font-bold text-white">{usage} Itens</h3>
        </div>
        <div className="glass-panel p-6 rounded-3xl border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4">
            <i className="fas fa-bolt text-xl"></i>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Capacidade Mensal</p>
          <h3 className="text-xl md:text-2xl font-bold text-white">{limit} Créditos</h3>
        </div>
        <div className="glass-panel p-6 rounded-3xl border-white/10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400 mb-4">
            <i className="fas fa-award text-xl"></i>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Vantagem Escola</p>
          <h3 className="text-xl md:text-2xl font-bold text-white">VIP</h3>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-transparent">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-8 border-indigo-500/20 flex items-center justify-center relative shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="40%" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  className="text-indigo-500 transition-all duration-1000" 
                  strokeDasharray="502" 
                  strokeDashoffset={strokeDashoffset} 
                  style={{ r: '38%' }}
                />
            </svg>
            <div className="text-center">
                <span className="text-3xl md:text-4xl font-black text-white">{usagePercentage}%</span>
                <p className="text-[9px] md:text-[10px] text-slate-400 uppercase font-bold tracking-widest">Utilizado</p>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Sua evolução em {language}</h3>
            <p className="text-slate-400 leading-relaxed mb-6 text-sm md:text-base">
              Você está utilizando o plano <b>{planName}</b>. Continue praticando para esgotar seus créditos e acelerar sua fluência! Cada interação com a IA conta para o seu progresso.
            </p>
            <button 
              onClick={() => setActiveTab('live')}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
            >
              Começar Prática de Hoje
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
