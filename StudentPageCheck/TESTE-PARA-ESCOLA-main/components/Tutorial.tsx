
import React from 'react';

export const Tutorial: React.FC = () => {
  const steps = [
    {
      icon: 'fa-microphone-lines',
      color: 'indigo',
      title: 'Chat ao Vivo',
      desc: 'Converse por voz em tempo real. A IA ouve você, transcreve e responde como um nativo. Ideal para quebrar o gelo.',
    },
    {
      icon: 'fa-volume-high',
      color: 'blue',
      title: 'Laboratório de Fala',
      desc: 'Escreva qualquer frase difícil e ouça a pronúncia perfeita. Grave sua voz para receber feedback fonético detalhado.',
    },
    {
      icon: 'fa-pen-nib',
      color: 'rose',
      title: 'Laboratório de Escrita',
      desc: 'Aprimore sua gramática e estilo. Escreva livremente e receba correções inteligentes e sugestões para soar mais natural.',
    },
    {
      icon: 'fa-eye',
      color: 'purple',
      title: 'Varredura Visual',
      desc: 'Tire uma foto do que está à sua volta. A IA identifica os objetos e ensina como descrevê-los no idioma que você escolheu.',
    },
    {
      icon: 'fa-earth-americas',
      color: 'emerald',
      title: 'Cultura & Viagem',
      desc: 'Explore costumes, expressões locais e até mapas de outros países para se preparar para viagens reais.',
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto py-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Como usar o Tutor 360</h2>
        <p className="text-slate-400 text-lg">Seu guia rápido para dominar o aprendizado com IA.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {steps.map((step, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-3xl border-white/10 hover:border-white/20 transition-all flex items-start gap-6 group">
            <div className={`w-16 h-16 rounded-2xl bg-${step.color}-500/10 flex items-center justify-center shrink-0 border border-${step.color}-500/20 group-hover:scale-110 transition-transform`}>
              <i className={`fas ${step.icon} text-2xl text-${step.color}-400`}></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-10 rounded-[3rem] border-white/10 relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-transparent">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <i className="fas fa-graduation-cap text-[120px] -rotate-12"></i>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-8">Dicas de Estudo</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-white/10 text-indigo-400 font-bold">1</div>
            <p className="text-sm text-slate-300"><b>Mude o idioma</b> no topo da tela a qualquer momento para praticar línguas diferentes.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-white/10 text-indigo-400 font-bold">2</div>
            <p className="text-sm text-slate-300">Use o <b>Modo Visão</b> em museus, parques ou restaurantes para aprender vocabulário técnico.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-white/10 text-indigo-400 font-bold">3</div>
            <p className="text-sm text-slate-300"><b>Revise suas estatísticas</b> no Início para manter sua ofensiva ativa e não perder o ritmo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
