import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, TrendingUp, Handshake } from "lucide-react";

const FinalCTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-glow-pulse">
              <Rocket className="w-7 h-7 text-primary" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center animate-glow-pulse" style={{ animationDelay: "0.5s" }}>
              <TrendingUp className="w-7 h-7 text-secondary" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-glow-pulse" style={{ animationDelay: "1s" }}>
              <Handshake className="w-7 h-7 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Escolas líderes{" "}
            <span className="text-gradient-purple">criam</span> novas fontes de{" "}
            <span className="text-gradient-gold">receita</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Tecnologia não é mais diferencial — é pré-requisito.
            O Tutor 360 IA é seu parceiro estratégico para liderar com inovação
            e gerar crescimento recorrente.
          </p>

          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Junte-se às escolas que estão transformando prática em resultado
            e posicionamento em receita.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex flex-col items-center">
              <Button variant="heroPrimary" size="xl" className="group" asChild>
                <a href="https://api.whatsapp.com/send?phone=5511914146879&text=Quero%20testar" target="_blank" rel="noopener noreferrer">
                  Quero ser escola parceira
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <span className="text-xs text-muted-foreground mt-2">
                Parceria sem custo inicial • Sujeita à análise e aprovação
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="heroSecondary" size="xl" asChild>
                <a href="https://teste-para-escola-jkjv.vercel.app" target="_blank" rel="noopener noreferrer">
                  Testar o app
                </a>
              </Button>
              <span className="text-xs text-muted-foreground mt-2">
                Demonstração exclusiva para escolas • Uso limitado
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground/70 mt-8 max-w-md mx-auto">
            Clique para conversar com nossa equipe e entender se sua escola se encaixa no modelo de parceria.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
