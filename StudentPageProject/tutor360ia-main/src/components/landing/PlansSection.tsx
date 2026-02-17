import { Check, Sparkles, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Essencial",
    subtitle: "Base do Aprendizado",
    price: "49,90",
    credits: "50 interações/mês",
    colorClasses: {
      bg: "bg-primary/20",
      text: "text-primary",
      border: "border-primary/30",
      bgGlow: "bg-primary/5",
      dot: "bg-primary",
    },
    icon: Sparkles,
    features: [
      "8 idiomas disponíveis",
      "Prática de vocabulário contextual",
      "Exercícios de gramática inicial",
      "Leitura de imagem com IA básico",
      "Aprendizado visual cotidiano",
      "Trilhas personalizadas"
    ]
  },
  {
    name: "Pro",
    subtitle: "Evolução Linguística",
    price: "89,90",
    credits: "80 interações/mês",
    colorClasses: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
      bgGlow: "bg-blue-500/5",
      dot: "bg-blue-500",
    },
    icon: Zap,
    popular: true,
    features: [
      "8 idiomas disponíveis",
      "Tudo do plano Essencial",
      "Laboratório de Escrita & Estilo",
      "Correção avançada de textos",
      "Laboratório de pronúncia",
      "Comunicação mais nativa"
    ]
  },
  {
    name: "Elite",
    subtitle: "Imersão Total",
    price: "129,90",
    credits: "100 interações/mês",
    colorClasses: {
      bg: "bg-secondary/20",
      text: "text-secondary",
      border: "border-secondary/50",
      bgGlow: "bg-secondary/10",
      dot: "bg-secondary",
    },
    icon: Crown,
    highlight: true,
    features: [
      "8 idiomas disponíveis",
      "Tudo do plano Pro",
      "Conversação por voz em tempo real",
      "Cultura e exploração",
      "Leitura da imagem por foto e upload",
      "Acesso prioritário aos servidores"
    ]
  }
];

const PlansSection = () => {
  // Cálculo da comissão líquida considerando taxas Kiwify
  const calculateNetCommission = (priceStr: string) => {
    const price = parseFloat(priceStr.replace(',', '.'));
    const grossCommission = price * 0.40;
    const kiwifyFee = (price * 0.0899) + 2.49;
    const proportionalFee = kiwifyFee * 0.40;
    return (grossCommission - proportionalFee).toFixed(2).replace('.', ',');
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Planos disponíveis
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Conheça o produto que você vai{" "}
            <span className="text-gradient-gold">oferecer</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Estes são os planos que seus alunos poderão assinar. Cada assinatura 
            gera comissão recorrente para sua escola.
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto border-t border-border/30 pt-4">
            Os planos são contratados pelos alunos. A escola atua como parceira oficial e recebe comissão recorrente por cada assinatura ativa.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-6 rounded-3xl border ${plan.colorClasses.border} ${plan.colorClasses.bgGlow} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group opacity-0 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
                  Mais popular
                </div>
              )}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold animate-glow-pulse">
                  Mais completo
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-flex w-14 h-14 rounded-2xl ${plan.colorClasses.bg} items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <plan.icon className={`w-7 h-7 ${plan.colorClasses.text}`} />
                </div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.subtitle}</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className={`text-sm mt-2 ${plan.colorClasses.text}`}>{plan.credits}</p>
                <p className="text-xs text-secondary mt-1">
                  Sua comissão: R$ {calculateNetCommission(plan.price)}/mês
                </p>
              </div>
              
              <div className="border-t border-border/50 pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 text-sm">
                      <Check className={`w-4 h-4 ${plan.colorClasses.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
