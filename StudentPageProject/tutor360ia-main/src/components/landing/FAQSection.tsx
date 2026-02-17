import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

const faqCategories = [
  {
    title: "Sobre o produto",
    faqs: [
      {
        question: "O Tutor 360 IA substitui o professor da escola?",
        answer: "Não. O Tutor 360 IA atua como um suporte pedagógico inteligente, ampliando a prática do aluno fora da sala de aula. O professor continua sendo o centro do ensino. O app reforça a metodologia da escola, aumenta o engajamento e melhora os resultados."
      },
      {
        question: "Minha escola precisa mudar o método de ensino?",
        answer: "Não. O Tutor 360 IA foi criado para se adaptar à metodologia da escola, e não o contrário. Ele funciona como um complemento prático que acompanha o aluno no dia a dia, sem interferir nas aulas ou no currículo."
      },
      {
        question: "O Tutor 360 IA pode ser usado com diferentes idiomas?",
        answer: "Sim. O aplicativo foi desenvolvido para funcionar com múltiplos idiomas, acompanhando a diversidade de cursos oferecidos pela escola."
      }
    ]
  },
  {
    title: "Sobre a parceria",
    faqs: [
      {
        question: "Como funciona a parceria com a escola?",
        answer: "A escola se cadastra como parceira oficial do Tutor 360 IA e passa a oferecer o aplicativo como um recurso complementar aos seus alunos. A cada assinatura ativa realizada por indicação da escola, ela recebe 40% de comissão recorrente, enquanto o aluno permanecer assinante."
      },
      {
        question: "Existe custo para a escola participar da parceria?",
        answer: "Não. A parceria não exige investimento inicial, taxas de adesão ou custos técnicos. A escola pode testar o aplicativo antes de decidir oferecer aos alunos."
      },
      {
        question: "Minha escola perde autonomia ao se tornar parceira?",
        answer: "Não. A escola mantém total autonomia pedagógica, comercial e institucional. O Tutor 360 IA entra como um aliado estratégico, não como um substituto ou controlador do processo."
      },
      {
        question: "Para que tipo de escola essa parceria é indicada?",
        answer: "Para escolas que: querem se diferenciar no mercado, buscam novas fontes de receita recorrente, valorizam tecnologia aplicada ao ensino e desejam aumentar engajamento e retenção."
      }
    ]
  },
  {
    title: "Suporte e operação",
    faqs: [
      {
        question: "Quem é responsável pelo suporte técnico do aplicativo?",
        answer: "Todo o suporte técnico, infraestrutura e evolução da plataforma são de responsabilidade do Tutor 360 IA. A escola foca no ensino e no relacionamento com os alunos, sem sobrecarga operacional."
      },
      {
        question: "É possível testar o Tutor 360 IA antes de firmar a parceria?",
        answer: "Sim. A escola pode testar o aplicativo na prática, entender a experiência do aluno e avaliar o valor antes de se tornar parceira oficial."
      },
      {
        question: "Como a escola acompanha os resultados da parceria?",
        answer: "A parceria é baseada em transparência e recorrência. A escola acompanha suas indicações e comissões de forma clara, enquanto o aplicativo gera mais engajamento e valor percebido para os alunos."
      }
    ]
  }
];

const FAQSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Perguntas Frequentes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ainda tem dúvidas? Vamos esclarecer os{" "}
            <span className="text-gradient-gold">principais pontos</span> da parceria
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex}>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {category.title}
              </h3>
              <Accordion type="single" collapsible className="space-y-3">
                {category.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${catIndex}-${index}`}
                    className="border border-border/50 rounded-2xl px-6 bg-card/30 backdrop-blur-sm data-[state=open]:border-primary/30 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5 text-base md:text-lg font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Strategic Closing CTA */}
        <div className="mt-20 text-center">
          <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto para levar sua escola para o{" "}
              <span className="text-gradient-gold">próximo nível</span>?
            </h3>
            <p className="text-muted-foreground mb-8">
              Teste o Tutor 360 IA ou faça parte do nosso modelo de parceria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base rounded-full"
              >
                Quero ser escola parceira
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-border/50 hover:bg-muted/50 font-semibold px-8 py-6 text-base rounded-full"
              >
                Testar o app
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
