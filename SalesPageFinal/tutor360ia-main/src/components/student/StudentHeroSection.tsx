import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const StudentHeroSection = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 md:pt-0 overflow-hidden bg-background">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 select-none">
                <img
                    src="/student/hero-new.png"
                    alt="App Tutor 360 IA - Interface"
                    className="w-full h-full object-cover object-center md:object-right opacity-40 md:opacity-50"
                />
                {/* Gradient Overlays for Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent sm:via-background/70" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Background gradients effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-2xl">
                    <div className="text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
                            <span className="text-secondary text-xs">★</span>
                            <span className="text-sm text-secondary font-medium tracking-wide uppercase">
                                PRIMEIRA DOBRA — HERO
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 text-foreground tracking-tight">
                            Falar bem exige prática.{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 block mt-2">
                                E não só em sala de aula.
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-muted-foreground/90 mb-8 leading-relaxed max-w-xl">
                            Pratique o idioma fora da aula e ganhe confiança para se comunicar com{" "}
                            <span className="text-foreground font-semibold">mais segurança.</span>
                        </p>

                        {/* Microcopy */}
                        <div className="flex items-center gap-3 mb-8 text-sm text-muted-foreground/80 font-medium bg-background/50 backdrop-blur-md p-3 rounded-xl border border-white/5 inline-flex">
                            <div className="w-1 h-12 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                            <p>
                                O Tutor 360 IA complementa suas aulas,<br />
                                ajudando você a praticar no dia a dia.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="bg-secondary hover:bg-secondary/90 text-background font-bold text-lg px-8 h-14 rounded-xl shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)] transition-all hover:scale-105"
                                asChild
                            >
                                <a href="#planos">
                                    Começar a praticar agora
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentHeroSection;
