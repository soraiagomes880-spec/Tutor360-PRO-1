import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const StudentPlansSection = () => {
    const plans = [
        {
            name: "Essencial",
            description: "Base sólida de vocabulário e gramática para manter constância e ganhar segurança.",
            price: "49,90",
            features: [
                "8 idiomas disponíveis",
                "Prática de vocabulário contextual",
                "Exercícios de gramática inicial",
                "Leitura de imagem com IA básico",
                "Aprendizado visual cotidiano",
                "Trilhas personalizadas"
            ],
            highlight: false,
            cta: "Assinar Essencial",
            link: "https://pay.kiwify.com.br/ESSENCIAL" // Placeholder link
        },
        {
            name: "Pro",
            description: "Correções mais profundas, melhoria de escrita e treino de pronúncia para quem quer evoluir mais rápido.",
            price: "89,90",
            features: [
                "8 idiomas disponíveis",
                "Tudo do plano Essencial",
                "Laboratório de Escrita & Estilo",
                "Correção avançada de textos",
                "Laboratório de pronúncia",
                "Comunicação mais nativa"
            ],
            highlight: true, // "Mais popular"
            cta: "Assinar Pro",
            link: "https://pay.kiwify.com.br/PRO" // Placeholder link
        },
        {
            name: "Elite",
            description: "Conversação por voz, prática avançada e imersão completa para quem busca fluência com mais intensidade.",
            price: "129,90",
            features: [
                "8 idiomas disponíveis",
                "Tudo do plano Pro",
                "Conversação por voz em tempo real",
                "Cultura e exploração",
                "Leitura da imagem por foto e upload",
                // "Acesso prioritário aos servidores" REMOVED per user request
            ],
            highlight: false, // "Mais completo"
            cta: "Assinar Elite",
            link: "https://pay.kiwify.com.br/ELITE" // Placeholder link
        }
    ];

    return (
        <section id="planos" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1 rounded-full bg-secondary/10 border border-secondary/30">
                        <span className="text-secondary text-sm font-medium">PLANOS</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Escolha o nível de prática que combina com seu momento.
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Todos os planos foram pensados para complementar suas aulas e acelerar sua evolução.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`relative flex flex-col ${plan.highlight
                                ? "border-secondary shadow-lg shadow-secondary/10 lg:scale-105 z-10 bg-card"
                                : "border-border/50 bg-card/50"
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Mais popular
                                </div>
                            )}
                            {/* Elite Tag */}
                            {plan.name === "Elite" && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-background px-4 py-1 rounded-full text-sm font-bold">
                                    Mais completo
                                </div>
                            )}

                            <CardHeader className="text-center pb-8 pt-12">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-sm text-muted-foreground">R$</span>
                                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                                    <span className="text-sm text-muted-foreground">/mês</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-muted-foreground text-left">
                                            <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight || plan.name === "Elite" ? "text-secondary" : "text-primary"}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-8">
                                <Button
                                    className={`w-full h-12 text-base font-semibold ${plan.name === "Elite"
                                        ? "bg-secondary hover:bg-secondary/90 text-background"
                                        : plan.highlight
                                            ? "bg-primary hover:bg-primary/90 text-white"
                                            : "bg-white/10 hover:bg-white/20 text-white"
                                        }`}
                                    asChild
                                >
                                    <a href={plan.link} target="_blank" rel="noopener noreferrer">
                                        {plan.cta}
                                        <Check className="ml-2 w-4 h-4" />
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StudentPlansSection;
