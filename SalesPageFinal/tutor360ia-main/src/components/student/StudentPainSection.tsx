import { Brain, MessageCircle, XCircle } from "lucide-react";

const StudentPainSection = () => {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Você estuda. <br />
                        Você entende a explicação. <br />
                        Você até consegue acompanhar a aula.
                    </h2>
                    <p className="text-2xl font-bold text-red-500 mb-8">
                        Mas na hora de falar… trava.
                    </p>
                    <p className="text-lg text-muted-foreground">
                        Na hora de escrever… hesita. <br />
                        Na hora de usar o idioma de verdade… a insegurança aparece.
                    </p>
                    <div className="mt-8 p-6 bg-card border border-border rounded-xl">
                        <p className="text-lg font-medium text-foreground">
                            O problema não é falta de capacidade. E nem falta de professor.
                        </p>
                        <p className="text-xl font-bold text-primary mt-2">
                            O problema é simples: você pratica pouco entre uma aula e outra.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            E sem prática frequente, a confiança não cresce.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Items removed as the new copy doesn't strictly follow the 3-card structure of the previous design, 
                        but I will keep 3 cards to represent the "Trava", "Hesita", "Insegurança" points visually if desired, 
                        or just simplify. The user prompt had a list. Let's adapt to 3 cards for visual consistency. */}
                    <div className="bg-card p-8 rounded-2xl border border-border/50 hover:border-red-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Na hora de falar...</h3>
                        <p className="text-muted-foreground">
                            Trava. Mesmo sabendo a teoria, as palavras não saem com naturalidade.
                        </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-border/50 hover:border-red-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform">
                            <Brain className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Na hora de escrever...</h3>
                        <p className="text-muted-foreground">
                            Hesita. Fica pensando demais na gramática e perde a fluidez.
                        </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-border/50 hover:border-red-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Na hora de usar...</h3>
                        <p className="text-muted-foreground">
                            A insegurança aparece. O medo de errar te impede de tentar.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentPainSection;
