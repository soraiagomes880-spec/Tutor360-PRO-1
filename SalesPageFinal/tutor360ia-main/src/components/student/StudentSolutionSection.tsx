import { ShieldCheck, Clock, HeartHandshake } from "lucide-react";

const StudentSolutionSection = () => {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-secondary font-bold uppercase tracking-wider text-sm mb-4 block">
                        A SOLUÇÃO
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Um tutor inteligente para praticar no seu ritmo
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        O Tutor 360 IA foi criado para ser seu apoio fora da sala de aula.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                            <Clock className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Tudo no seu tempo</h3>
                        <p className="text-muted-foreground">
                            Você erra. Ajusta. E evolui.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-500">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Praticar sem medo</h3>
                        <p className="text-muted-foreground">
                            Sem julgamento. Teste frases antes de usar na vida real.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500">
                            <HeartHandshake className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Aqui você pode:</h3>
                        <ul className="text-muted-foreground text-sm space-y-2">
                            <li>Escrever e receber correções claras</li>
                            <li>Treinar pronúncia</li>
                            <li>Explorar vocabulário de forma prática</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentSolutionSection;
