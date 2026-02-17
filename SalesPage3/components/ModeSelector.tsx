
import React from 'react';
import { StudyMode } from '../types';

interface ModeSelectorProps {
  activeMode: StudyMode;
  setActiveMode: (mode: StudyMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, setActiveMode }) => {
  const modes: { id: StudyMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      id: 'voice', 
      label: 'Live Chat', 
      desc: 'Voice fluency',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-3m4-12V5a3 3 0 00-6 0v6a3 3 0 006 0z" />
        </svg>
      )
    },
    { 
      id: 'writing', 
      label: 'Writing', 
      desc: 'Grammar lab',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    { 
      id: 'visual', 
      label: 'Visual Scan', 
      desc: 'Real-world reading',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        </svg>
      )
    },
    { 
      id: 'culture', 
      label: 'Culture', 
      desc: 'News & Trends',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setActiveMode(mode.id)}
          className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center group ${
            activeMode === mode.id 
              ? 'border-indigo-600 bg-white shadow-lg ring-1 ring-indigo-600' 
              : 'border-transparent bg-white hover:border-slate-200 shadow-sm'
          }`}
        >
          <div className={`p-3 rounded-xl transition-colors ${activeMode === mode.id ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
            {mode.icon}
          </div>
          <div>
            <div className={`font-bold text-sm ${activeMode === mode.id ? 'text-slate-900' : 'text-slate-600'}`}>{mode.label}</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">{mode.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
