import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const StudentFinalCTASection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/10"></div>
            <div className="container mx-auto px-6 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-8">
                    Você não trava porque não sabe. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Você trava porque pratica pouco.
                    </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                    Comece a praticar hoje e evolua com mais confiança.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
                    <Button variant="heroPrimary" size="xl" className="group uppercase tracking-wide px-12 h-16 text-lg shadow-2xl shadow-blue-500/20" asChild>
                        <a href="#planos">
                            Começar a praticar agora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default StudentFinalCTASection;
