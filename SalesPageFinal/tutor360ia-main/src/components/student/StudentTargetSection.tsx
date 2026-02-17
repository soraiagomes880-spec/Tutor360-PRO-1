import { Zap, TrendingUp, Award } from "lucide-react";

const StudentTargetSection = () => {
    return (
        <section className="py-24 bg-secondary/5">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Para quem é o Tutor 360 IA?</h2>
                    <p className="text-xl text-muted-foreground">
                        O Tutor 360 IA é ideal para você se:
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Using the grid to show the list items visually as cards or check items. 
                         The user provided a list of 5 items. 3 cards might not fit perfectly.
                         Let's adapt to a centralized list or 3 cards with grouped items?
                         User input: 
                         - Quer falar com mais confiança
                         - Sente que pratica pouco fora da aula
                         - Quer evoluir mais rápido
                         - Quer usar tecnologia a seu favor
                         - Quer destravar o idioma sem pressão
                         
                         I will group them or display them in a 2-3 grid layout.
                         Let's use a 3-column grid for the first 3 and maybe center the others? 
                         Or just change the layout to a list. 
                         The previous layout was "Iniciantes", "Intermediários", "Avançados".
                         The new copy implies a single target audience with multiple needs.
                         I'll change the layout to a list of benefits/checks.
                     */}

                    <div className="md:col-span-3 flex flex-wrap justify-center gap-6">
                        {[
                            "Quer falar com mais confiança",
                            "Sente que pratica pouco fora da aula",
                            "Quer evoluir mais rápido",
                            "Quer usar tecnologia a seu favor",
                            "Quer destravar o idioma sem pressão"
                        ].map((item, index) => (
                            <div key={index} className="bg-background p-6 rounded-2xl border border-border/50 flex items-center gap-4 min-w-[300px]">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <p className="font-medium">{item}</p>
                            </div>
                        ))}
                    </div>

                    <div className="md:col-span-3 text-center mt-8">
                        <p className="text-lg font-bold text-foreground">
                            Não importa seu nível. <br />
                            <span className="text-muted-foreground font-normal">Quanto mais você pratica, mais você evolui.</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentTargetSection;
