import { UserPlus, Smartphone, Presentation, Coins, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Solicite a parceria",
    description: "Preencha o formulário e nossa equipe entrará em contato para análise de perfil."
  },
  {
    icon: Smartphone,
    number: "02",
    title: "Conheça o Tutor 360 IA",
    description: "Após aprovação, você recebe acesso para explorar a ferramenta como parceiro."
  },
  {
    icon: Presentation,
    number: "03",
    title: "Apresente aos seus alunos",
    description: "Ofereça o app como extensão do seu método de ensino com seu link exclusivo."
  },
  {
    icon: Coins,
    number: "04",
    title: "Receba comissões",
    description: "A cada assinatura realizada, sua comissão é creditada automaticamente."
  },
  {
    icon: Rocket,
    number: "05",
    title: "Cresça junto conosco",
    description: "Participe do desenvolvimento do produto e expanda sua receita recorrente."
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
              Como funciona
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Simples, transparente e{" "}
              <span className="text-gradient-purple">profissional</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Em poucos passos, sua escola se torna parceira e começa a gerar nova receita.
            </p>
          </div>
          
          {/* Steps */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent hidden md:block" />
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`relative flex items-start gap-6 opacity-0 animate-fade-in-up ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
                >
                  {/* Connector dot for desktop */}
                  <div className="hidden md:block absolute left-1/2 top-6 w-5 h-5 rounded-full bg-primary -translate-x-1/2 shadow-glow-purple animate-glow-pulse" />
                  
                  {/* Content card */}
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                    <div className={`inline-flex flex-col p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 group ${
                      index % 2 === 0 ? "md:items-end" : "md:items-start"
                    }`}>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          <step.icon className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-3xl font-black text-primary/40 group-hover:text-primary/60 transition-colors">{step.number}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Spacer for desktop */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
