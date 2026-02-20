
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  usage: number;
}

const MAX_USAGE = 15;

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, usage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: 'fa-house' },
    { id: 'live', label: 'Chat de Voz', icon: 'fa-microphone-lines' },
    { id: 'pronunciation', label: 'Pronúncia', icon: 'fa-volume-high' },
    { id: 'writing', label: 'Laboratório Escrita', icon: 'fa-pen-nib' },
    { id: 'scan', label: 'Visão IA', icon: 'fa-eye' },
    { id: 'culture', label: 'Cultura & Viagem', icon: 'fa-earth-americas' },
    { id: 'help', label: 'Tutorial & Ajuda', icon: 'fa-circle-question' },
  ];

  const usagePercent = Math.min((usage / MAX_USAGE) * 100, 100);

  return (
    <aside className="hidden md:flex w-72 glass-panel border-r border-white/10 flex-col h-full z-30">
      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Menu de Estudo</p>
        <nav className="space-y-1.5 mb-10">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AppTab)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-inner'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="w-8 flex justify-center">
                <i className={`fas ${item.icon} text-lg`}></i>
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-8 border-t border-white/5">
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900/50 rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Uso do Plano</span>
            <span className="text-xs text-slate-400">{usage}/{MAX_USAGE}</span>
          </div>
          <p className="text-[10px] text-indigo-400 font-black mb-3 uppercase tracking-[0.3em]">TESTE</p>
          
          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed italic text-center">PLANO DE ACESSO ATIVO</p>
        </div>
      </div>
    </aside>
  );
};
