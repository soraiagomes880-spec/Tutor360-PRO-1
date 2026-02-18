import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalModalsProps {
    isOpen: boolean;
    onClose: () => void;
    type: "terms" | "privacy" | "partnership" | null;
}

const LegalModals = ({ isOpen, onClose, type }: LegalModalsProps) => {
    const content = {
        terms: {
            title: "Termos de Uso",
            text: (
                <div className="space-y-4 text-sm leading-relaxed">
                    <p><strong>1. Aceitação dos Termos:</strong> Ao acessar o Tutor 360 IA, você concorda em cumprir estes termos de serviço e todas as leis aplicáveis.</p>
                    <p><strong>2. Natureza do Serviço:</strong> O Tutor 360 IA é uma ferramenta de inteligência artificial projetada para complementar o aprendizado de idiomas. Ele não substitui o ensino acadêmico formal provido por escolas licenciadas.</p>
                    <p><strong>3. Assinatura e Cobrança:</strong> O acesso é liberado mediante pagamento mensal. O cancelamento pode ser feito a qualquer momento, sem taxas de fidelidade, interrompendo a renovação para o mês seguinte.</p>
                    <p><strong>4. Uso da Conta:</strong> A conta é pessoal e intransferível. O uso indevido ou compartilhamento de acessos pode resultar na suspensão do serviço.</p>
                    <p><strong>5. Limitação de Responsabilidade:</strong> Embora busquemos a máxima precisão, a tecnologia de IA pode apresentar imprecisões gramaticais ou contextuais ocasionais.</p>
                </div>
            ),
        },
        privacy: {
            title: "Política de Privacidade",
            text: (
                <div className="space-y-4 text-sm leading-relaxed">
                    <p><strong>1. Coleta de Dados:</strong> Coletamos informações básicas como nome, e-mail e dados de progresso no estudo para personalizar sua experiência.</p>
                    <p><strong>2. Uso da Inteligência Artificial:</strong> Suas interações de voz e texto são processadas via API do Google Gemini para fins de aprendizado. Não vendemos seus dados para terceiros.</p>
                    <p><strong>3. Armazenamento:</strong> Utilizamos servidores seguros (Supabase) para armazenar seu histórico de sessões e garantir que você possa retomar seus estudos de qualquer dispositivo.</p>
                    <p><strong>4. Direitos do Usuário (LGPD):</strong> Você tem o direito de solicitar o acesso, correção ou exclusão de seus dados pessoais a qualquer momento através do nosso suporte.</p>
                    <p><strong>5. Cookies:</strong> Utilizamos apenas cookies estritamente necessários para manter sua sessão ativa e garantir a segurança da plataforma.</p>
                </div>
            ),
        },
        partnership: {
            title: "Contrato de Parceria (Escolas)",
            text: (
                <div className="space-y-4 text-sm leading-relaxed">
                    <p><strong>1. Objeto:</strong> Esta parceria visa oferecer o Tutor 360 IA como um complemento tecnológico oficial para escolas de idiomas.</p>
                    <p><strong>2. Modelo de Remuneração:</strong> A escola parceira recebe uma comissão de 40% sobre o valor da mensalidade de cada aluno que assinar através do seu link exclusivo.</p>
                    <p><strong>3. Suporte Pedagógico:</strong> O app é posicionado como um reforço extraclasse. A escola mantém total autoridade sobre o currículo e o ensino presencial/online.</p>
                    <p><strong>4. Transparência:</strong> O parceiro terá acesso a um painel de acompanhamento (conforme disponibilidade do plano) para verificar o desempenho e as conversões de sua base de alunos.</p>
                    <p><strong>5. Rescisão:</strong> A parceria pode ser encerrada por qualquer uma das partes com aviso prévio de 30 dias, respeitando-se os pagamentos recorrentes dos alunos já ativos.</p>
                </div>
            ),
        },
    };

    const currentContent = type ? content[type] : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground">
                        {currentContent?.title}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="pr-4 mt-4">
                    <div className="text-muted-foreground">
                        {currentContent?.text}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default LegalModals;
