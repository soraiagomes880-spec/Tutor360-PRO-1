import { Crown } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Crown className="w-6 h-6 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold">
                TUTOR 360 <span className="text-primary">IA</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Tecnologia educacional para escolas que querem liderar.
            </p>
          </div>
          
          {/* Links */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Links</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Contrato de Parceria
              </a>
            </nav>
          </div>
          
          {/* Contact */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contato</h4>
            <nav className="flex flex-col gap-2">
              <a href="mailto:contato@tutor360ia.com" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                contato@tutor360ia.com
              </a>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                WhatsApp
              </a>
            </nav>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/30 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Tutor 360 IA. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
