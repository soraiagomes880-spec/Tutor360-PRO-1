import React from 'react';

interface UsageLimitModalProps {
    partnerLink: string;
    title?: string;
    description?: string;
    onClose?: () => void;
}

export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
    partnerLink,
    title = "Sua evolução está apenas começando!",
    description = "Você completou sua jornada de demonstração de 15 créditos. O Tutor 360 IA é o parceiro ideal para acelerar seu aprendizado e complementar suas aulas, garantindo prática real 24 horas por dia.",
    onClose
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-300">

                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                )}

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-50/10 blur-[60px] pointer-events-none"></div>

                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                    <i className="fas fa-graduation-cap text-3xl text-indigo-400"></i>
                </div>

                <h2 className="text-3xl font-black text-white mb-4">{title}</h2>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    {description} <br /><br />
                    Para continuar sua jornada de fluência e desbloquear o <b>Acesso Ilimitado</b>, escolha seu plano ideal:
                </p>

                <a
                    href={partnerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Fazer Upgrade Agora
                    <i className="fas fa-arrow-right ml-2 text-xs"></i>
                </a>

                <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    Tutor 360 IA • Premium Learning
                </p>
            </div>
        </div>
    );
};
