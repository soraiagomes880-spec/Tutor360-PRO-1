import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const languages = [
    { code: "US", flag: <img src="https://flagcdn.com/w40/us.png" alt="US Flag" className="w-5 h-auto rounded-sm" />, delay: "0s" },
    { code: "ES", flag: <img src="https://flagcdn.com/w40/es.png" alt="ES Flag" className="w-5 h-auto rounded-sm" />, delay: "0.2s" },
    { code: "FR", flag: <img src="https://flagcdn.com/w40/fr.png" alt="FR Flag" className="w-5 h-auto rounded-sm" />, delay: "0.4s" },
    { code: "DE", flag: <img src="https://flagcdn.com/w40/de.png" alt="DE Flag" className="w-5 h-auto rounded-sm" />, delay: "0.6s" },
    { code: "IT", flag: <img src="https://flagcdn.com/w40/it.png" alt="IT Flag" className="w-5 h-auto rounded-sm" />, delay: "0.8s" },
    { code: "JP", flag: <img src="https://flagcdn.com/w40/jp.png" alt="JP Flag" className="w-5 h-auto rounded-sm" />, delay: "1s" },
    { code: "CN", flag: <img src="https://flagcdn.com/w40/cn.png" alt="CN Flag" className="w-5 h-auto rounded-sm" />, delay: "1.2s" },
    { code: "KR", flag: <img src="https://flagcdn.com/w40/kr.png" alt="KR Flag" className="w-5 h-auto rounded-sm" />, delay: "1.4s" },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-background/75" />

      {/* Floating language badges */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {/* Left side badges */}
        <div
          className="absolute top-[20%] right-[8%] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 animate-fade-in"
          style={{ animationDelay: languages[0].delay }}
        >
          <span className="text-lg mr-2">{languages[0].flag}</span>
          <span className="text-sm font-medium">{languages[0].code}</span>
        </div>
        <div
          className="absolute top-[35%] right-[5%] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 animate-fade-in"
          style={{ animationDelay: languages[1].delay }}
        >
          <span className="text-lg mr-2">{languages[1].flag}</span>
          <span className="text-sm font-medium">{languages[1].code}</span>
        </div>
        <div
          className="absolute top-[50%] right-[10%] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 animate-fade-in"
          style={{ animationDelay: languages[2].delay }}
        >
          <span className="text-lg mr-2">{languages[2].flag}</span>
          <span className="text-sm font-medium">{languages[2].code}</span>
        </div>
        <div
          className="absolute top-[65%] right-[6%] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 animate-fade-in"
          style={{ animationDelay: languages[3].delay }}
        >
          <span className="text-lg mr-2">{languages[3].flag}</span>
          <span className="text-sm font-medium">{languages[3].code}</span>
        </div>

        {/* Right side badges */}
        <div
          className="absolute top-[25%] right-[18%] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 animate-fade-in"
          style={{ animationDelay: languages[4].delay }}
        >
          <span className="text-lg mr-2">{languages[4].flag}</span>
          <span className="text-sm font-medium">{languages[4].code}</span>
        </div>
        <div
          className="absolute top-[42%] right-[22%] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 animate-fade-in"
          style={{ animationDelay: languages[5].delay }}
        >
          <span className="text-lg mr-2">{languages[5].flag}</span>
          <span className="text-sm font-medium">{languages[5].code}</span>
        </div>
        <div
          className="absolute top-[58%] right-[16%] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 animate-fade-in"
          style={{ animationDelay: languages[6].delay }}
        >
          <span className="text-lg mr-2">{languages[6].flag}</span>
          <span className="text-sm font-medium">{languages[6].code}</span>
        </div>
        <div
          className="absolute top-[75%] right-[12%] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 animate-fade-in"
          style={{ animationDelay: languages[7].delay }}
        >
          <span className="text-lg mr-2">{languages[7].flag}</span>
          <span className="text-sm font-medium">{languages[7].code}</span>
        </div>
      </div>
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-3xl">
          {/* Badge - Exclusividade */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
            <span className="text-secondary">★</span>
            <span className="text-sm text-secondary font-medium tracking-wide uppercase">
              Programa exclusivo para escolas selecionadas
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] mb-6">
            Enquanto muitas escolas disputam preço, a sua lidera com{" "}
            <span className="text-gradient-gold">prática, tecnologia e resultado.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            Uma solução prática que engaja alunos, fortalece sua escola e cria uma nova fonte de{" "}
            <span className="text-secondary font-medium">renda recorrente.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center sm:items-start">
              <Button variant="heroPrimary" size="xl" className="group uppercase tracking-wide w-full" asChild>
                <a href="https://api.whatsapp.com/send?phone=5511914146879&text=Quero%20testar" target="_blank" rel="noopener noreferrer">
                  Escola Parceira
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <span className="text-xs text-muted-foreground mt-2">
                Parceria sem custo inicial • Sujeita à análise e aprovação
              </span>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <Button variant="heroSecondary" size="xl" className="uppercase tracking-wide" asChild>
                <a href="https://teste-para-escola-jkjv.vercel.app" target="_blank" rel="noopener noreferrer">
                  Testar Aplicativo
                </a>
              </Button>
              <span className="text-xs text-muted-foreground mt-2">
                Demonstração exclusiva para escolas • Uso limitado
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;