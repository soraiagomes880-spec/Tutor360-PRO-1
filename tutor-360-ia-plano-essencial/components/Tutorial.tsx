
import React from 'react';
import { AppTab } from '../types';

interface TutorialProps {
  setActiveTab: (tab: AppTab) => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ setActiveTab }) => {
  const steps = [
    {
      icon: 'fa-microphone',
      color: 'blue',
      title: 'Chat ao Vivo',
      desc: 'Converse por voz em tempo real. A IA ouve você, transcreve e responde como um nativo. Ideal para quebrar o gelo.',
    },
    {
      icon: 'fa-volume-high',
      color: 'purple',
      title: 'Laboratório de Fala',
      desc: 'Escreva qualquer frase difícil e ouça a pronúncia perfeita. Grave sua voz para receber feedback fonético detalhado.',
    },
    {
      icon: 'fa-pen-nib',
      color: 'pink',
      title: 'Laboratório de Escrita',
      desc: 'Aprimore sua gramática e estilo. Escreva livremente e receba correções inteligentes e sugestões para soar mais natural.',
    },
    {
      icon: 'fa-eye',
      color: 'indigo',
      title: 'Varredura Visual',
      desc: 'Tire uma foto do que está à sua volta. A IA identifica os objetos e ensina como descrevê-los no idioma que você escolheu.',
    },
    {
      icon: 'fa-earth-americas',
      color: 'green',
      title: 'Cultura & Viagem',
      desc: 'Explore costumes, expressões locais e até mapas de outros países para se preparar para viagens reais.',
    },
  ];

  const UI_ELEMENTS = [
    { icon: 'fa-comments', label: 'Chat ao Vivo', desc: 'Sessão de prática oral e escrita imersiva.' },
    { icon: 'fa-clock-rotate-left', label: 'Histórico', desc: 'Revise sessões passadas e pratique a pronúncia novamente.' },
    { icon: 'fa-volume-high', label: 'Ouvir Pronúncia', desc: 'Acione a voz da IA para ouvir a cadência perfeita.' },
    { icon: 'fa-language', label: 'Tradução', desc: 'Traduza feedbacks complexos para entender seus erros profundamente.' },
    { icon: 'fa-keyboard', label: 'Resposta de Texto', desc: 'Prefere digitar? O tutor entende e mantém o ritmo.' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Tutor 360 IA</h2>
        <p className="text-slate-400 text-lg">Seu guia rápido para dominar o aprendizado com IA.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {steps.map((step, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-[2rem] border-white/10 hover:border-white/20 transition-all flex items-start gap-6 group">
            <div className={`w-16 h-16 rounded-2xl bg-${step.color === 'pink' ? 'rose' : step.color}-500/10 flex items-center justify-center shrink-0 border border-${step.color === 'pink' ? 'rose' : step.color}-500/20 group-hover:scale-110 transition-transform`}>
              <i className={`fas ${step.icon} text-2xl text-${step.color === 'pink' ? 'rose' : step.color}-400`}></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-10 rounded-[3rem] border-white/10 relative overflow-hidden bg-slate-900/40">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <i className="fas fa-graduation-cap text-[120px] -rotate-12"></i>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-8">Dicas de Estudo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {UI_ELEMENTS.map((ui, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-white/10">
                <i className={`fas ${ui.icon} text-indigo-400`}></i>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{ui.label}</h4>
                <p className="text-[11px] text-slate-500">{ui.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 text-center">
        <h4 className="text-indigo-400 font-bold mb-2">Pronto para começar?</h4>
        <p className="text-slate-400 text-sm mb-6">Explore qualquer uma das abas no menu lateral para iniciar sua prática.</p>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
        >
          Entendi, vamos lá!
        </button>
      </div>
    </div>
  );
};
