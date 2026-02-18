import { Crown } from "lucide-react";
import { useState } from "react";
import LegalModals from "./LegalModals";

const Footer = () => {
  const [modalType, setModalType] = useState<"terms" | "privacy" | "partnership" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (type: "terms" | "privacy" | "partnership") => {
    setModalType(type);
    setIsModalOpen(true);
  };

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
              <button
                onClick={() => openModal("terms")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors text-left"
              >
                Termos de Uso
              </button>
              <button
                onClick={() => openModal("privacy")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors text-left"
              >
                Política de Privacidade
              </button>
              <button
                onClick={() => openModal("partnership")}
                className="text-sm text-foreground/80 hover:text-primary transition-colors text-left"
              >
                Contrato de Parceria
              </button>
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

      <LegalModals
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
      />
    </footer>
  );
};

export default Footer;
