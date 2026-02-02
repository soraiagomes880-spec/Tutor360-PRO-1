
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  usage: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, usage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
    { id: 'live', label: 'Chat ao Vivo', icon: 'fa-microphone-lines' },
    { id: 'pronunciation', label: 'Pronúncia', icon: 'fa-volume-high' },
    { id: 'writing', label: 'Escrita', icon: 'fa-pen-nib' },
    { id: 'scan', label: 'Varredura Visual', icon: 'fa-eye' },
    { id: 'culture', label: 'Cultura', icon: 'fa-earth-americas' },
    { id: 'tutorial', label: 'Ajuda & Tutorial', icon: 'fa-circle-question' },
  ];

  const usagePercent = (usage / 15) * 100;

  return (
    <aside className="w-72 glass-panel border-r border-white/10 flex flex-col h-full z-30">
      <div className="p-8 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Aprendizado</p>

        {/* System Check Warning */}
        {/* System Check Warning */}
        {!import.meta.env.VITE_GEMINI_API_KEY && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <i className="fas fa-triangle-exclamation"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">Ação Necessária</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              A chave não foi detectada. A Vercel exige o prefixo <b>VITE_</b> para funcionar.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crie uma variável chamada <code className="bg-red-500/20 px-1 rounded text-red-300 font-bold">VITE_GEMINI_API_KEY</code> com sua chave.
            </p>
          </div>
        )}

        <nav className="space-y-1.5 mb-10">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AppTab)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-inner shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <i className={`fas ${item.icon} text-lg w-6 text-center ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`}></i>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-8 border-t border-white/5">
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900/50 rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Uso do Plano</span>
            <span className="text-xs text-slate-400">{usage}/15</span>
          </div>
          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-1000"
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed text-center italic">Renova em 30 dias</p>
        </div>
      </div>
    </aside>
  );
};
