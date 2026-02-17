import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Import 3D phones image
import phones3D from "@/assets/tutor360-phones-3d.png";

const benefits = [
  {
    icon: BookOpen,
    title: "Complementa o ensino",
    description: "O app reforça o que é ensinado em sala, criando uma extensão natural do método da escola."
  },
  {
    icon: Users,
    title: "Não substitui o professor",
    description: "A tecnologia potencializa o trabalho docente, oferecendo prática adicional sem sobrecarregar a equipe."
  },
  {
    icon: Sparkles,
    title: "Aumenta engajamento",
    description: "Alunos praticam mais fora da sala, aceleram resultados e valorizam ainda mais a escola."
  },
  {
    icon: Zap,
    title: "Eleva a permanência",
    description: "Com mais resultado e satisfação, a taxa de renovação aumenta naturalmente."
  }
];

const SolutionSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-8 relative overflow-visible" ref={sectionRef}>
      <div className="container mx-auto px-6 relative z-10">
        {/* Section title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            O App que transforma <span className="text-primary">prática em resultado</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            um tutor inteligente que acompanha o aluno fora da sala de aula
          </p>
        </div>

        {/* Phone mockups - 3D image static */}
        <div
          className={`max-w-5xl mx-auto -mt-8 -mb-8 relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          {/* Fade gradients */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* 3D Phones Image - static */}
          <div className="flex justify-center items-center py-8">
            <img
              src={phones3D}
              alt="Tutor360 App - 8 telas do aplicativo em perspectiva 3D"
              className="w-full max-w-4xl h-auto object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 25px 50px rgba(139, 92, 246, 0.3))',
              }}
            />
          </div>
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12 mt-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="heroPrimary" size="xl" className="group" asChild>
            <a href="https://api.whatsapp.com/send?phone=5511914146879&text=Quero%20testar" target="_blank" rel="noopener noreferrer">
              Quero ser escola parceira
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <Button variant="heroSecondary" size="xl" asChild>
            <a href="https://teste-para-escola-jkjv.vercel.app" target="_blank" rel="noopener noreferrer">
              Testar o app
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
