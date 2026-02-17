import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/95 backdrop-blur-lg border-b border-border/30' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Crown className="w-6 h-6 text-secondary-foreground" />
          </div>
          <span className="text-xl font-bold">
            TUTOR 360 <span className="text-primary">IA</span>
          </span>
        </div>
        
        <Button 
          variant="heroPrimary" 
          size="sm" 
          className={`group transition-all duration-300 ${
            scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
          asChild
        >
          <a href="https://api.whatsapp.com/send?phone=5511914146879&text=Quero%20testar" target="_blank" rel="noopener noreferrer">
            Seja parceiro
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </Button>
      </div>
    </header>
  );
};

export default Header;