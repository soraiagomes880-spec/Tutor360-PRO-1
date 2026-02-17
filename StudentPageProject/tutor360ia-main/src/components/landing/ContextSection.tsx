import { TrendingDown, Users, Target, AlertTriangle } from "lucide-react";

const painPoints = [
  {
    icon: TrendingDown,
    title: "Margens cada vez menores",
    description: "A guerra de preços corrói a rentabilidade e impede investimentos em qualidade."
  },
  {
    icon: Users,
    title: "Retenção em queda",
    description: "Sem diferenciais claros, alunos migram facilmente para concorrentes ou apps gratuitos."
  },
  {
    icon: Target,
    title: "Expectativas elevadas",
    description: "Alunos exigem tecnologia, prática constante e experiências personalizadas."
  },
  {
    icon: AlertTriangle,
    title: "Relevância em risco",
    description: "Quem não evolui perde espaço para escolas que lideram com inovação."
  }
];

const ContextSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              O cenário atual
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Enquanto muitas escolas disputam{" "}
              <span className="text-gradient-gold">preço</span>, a sua pode liderar com{" "}
              <span className="text-gradient-purple">valor</span>.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              O mercado de idiomas está saturado. Competir apenas por mensalidade 
              é uma corrida para o fundo. A diferenciação vem de entregar mais valor 
              percebido — e tecnologia é o caminho.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {painPoints.map((point, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                <p className="text-muted-foreground">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContextSection;
