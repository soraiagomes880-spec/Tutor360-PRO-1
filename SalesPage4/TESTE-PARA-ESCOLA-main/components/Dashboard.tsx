
import React from 'react';
import { Language } from '../types';

interface DashboardProps {
  language: Language;
  onStart: () => void;
  onViewHelp?: () => void;
  stats: {
    lessons: number;
    hours: number;
    days: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ language, onStart, onViewHelp, stats }) => {
  const progressPercent = Math.min(Math.round((stats.lessons / 100) * 100), 100);
  const dashArray = 502;
  const dashOffset = dashArray - (dashArray * progressPercent) / 100;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-1">Aprender {language}</h2>
          <p className="text-slate-400 text-sm md:text-lg">Seu objetivo: <span className="text-indigo-400 font-semibold">Fluência Profissional</span></p>
        </div>

        {/* Botão de Ajuda exclusivo para Mobile - Aparece apenas em celulares */}
        <button 
          onClick={onViewHelp}
          className="md:hidden flex items-center justify-center gap-3 w-full py-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all active:scale-95 shadow-lg shadow-indigo-950/20"
        >
          <i className="fas fa-circle-question text-lg"></i>
          Tutorial e Ajuda
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-6">
        <div className="glass-panel p-3 md:p-6 rounded-xl md:rounded-3xl border-white/10 flex flex-col items-center text-center">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-2 md:mb-4">
            <i className="fas fa-check-double text-sm md:text-xl"></i>
          </div>
          <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1">Aulas</p>
          <h3 className="text-sm md:text-2xl font-bold text-white">{stats.lessons}</h3>
        </div>
        <div className="glass-panel p-3 md:p-6 rounded-xl md:rounded-3xl border-white/10 flex flex-col items-center text-center">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-2 md:mb-4">
            <i className="fas fa-clock text-sm md:text-xl"></i>
          </div>
          <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1">Horas</p>
          <h3 className="text-sm md:text-2xl font-bold text-white">{stats.hours}</h3>
        </div>
        <div className="glass-panel p-3 md:p-6 rounded-xl md:rounded-3xl border-white/10 flex flex-col items-center text-center">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400 mb-2 md:mb-4">
            <i className="fas fa-fire text-sm md:text-xl"></i>
          </div>
          <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1">Ofensiva</p>
          <h3 className="text-sm md:text-2xl font-bold text-white">{stats.days}</h3>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/10 relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-transparent">
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 md:gap-10 text-center lg:text-left">
          <div className="w-32 h-32 md:w-56 md:h-56 rounded-full border-8 border-indigo-500/10 flex items-center justify-center relative shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="40%" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  className="text-white/5" 
                />
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="40%" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  className="text-indigo-500 transition-all duration-1000" 
                  strokeDasharray={dashArray} 
                  strokeDashoffset={dashOffset} 
                />
            </svg>
            <div className="text-center">
                <span className="text-3xl md:text-5xl font-black text-white">{progressPercent}%</span>
                <p className="text-[8px] md:text-[10px] text-slate-400 uppercase font-bold tracking-widest">Geral</p>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-5">Inicie sua jornada de {language}</h3>
            <p className="text-slate-400 leading-relaxed mb-6 md:mb-8 text-xs md:text-base">
              Tudo pronto! Recomendamos começar pelo <b>Chat ao Vivo</b> para praticar sua conversação e quebrar o gelo.
            </p>
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fas fa-rocket"></i>
              Começar Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
