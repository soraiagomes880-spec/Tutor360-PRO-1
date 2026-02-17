import { CheckCircle2 } from "lucide-react";

const StudentBenefitsSection = () => {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">
                            O QUE MUDA NA SUA ROTINA <br />
                            <span className="text-lg font-normal text-muted-foreground">Quando você pratica com frequência:</span>
                        </h2>


                        <div className="space-y-6">
                            {[
                                "Fica mais confiante para falar",
                                "Escreve com mais segurança",
                                "Comete menos erros repetidos",
                                "Usa o idioma com mais naturalidade",
                                "Percebe sua própria evolução"
                            ].map((benefit, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="mt-1 bg-green-500/10 p-1 rounded-full text-green-500">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <p className="text-lg font-medium">{benefit}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xl font-bold text-primary mt-8">
                            E isso transforma a forma como você participa das aulas.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-2xl">
                            <p className="text-2xl font-medium italic text-muted-foreground mb-6">
                                "Eu entendia tudo na aula, mas na hora de falar as palavras sumiam.
                                Depois que comecei a treinar 10 minutos por dia no app, perdi o medo."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center font-bold text-background text-xl">
                                    M
                                </div>
                                <div>
                                    <p className="font-bold">Mariana S.</p>
                                    <p className="text-sm text-secondary">Aluna de Inglês - Nível B1</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentBenefitsSection;
