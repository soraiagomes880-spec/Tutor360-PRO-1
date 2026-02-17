import { Shield, RefreshCcw, TrendingUp, Settings, Calculator, Info } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const advantages = [
  {
    icon: Shield,
    title: "Segurança total",
    description: "Modelo testado e validado. Você oferece uma solução já pronta e em funcionamento."
  },
  {
    icon: RefreshCcw,
    title: "Receita recorrente",
    description: "Comissão de 40% sobre cada assinatura ativa, mês após mês, enquanto o aluno permanecer."
  },
  {
    icon: TrendingUp,
    title: "Ganho escalável",
    description: "Quanto mais alunos adotarem, maior sua receita — sem limite de crescimento."
  },
  {
    icon: Settings,
    title: "Zero complexidade",
    description: "Sem custos de desenvolvimento, sem manutenção técnica. Tudo pronto para você indicar."
  }
];

const PartnershipModelSection = () => {
  const [students, setStudents] = useState(50);
  const averageTicket = 89.90; // Plano Pro como média
  const commission = 0.40;
  
  // Taxas Kiwify
  const kiwifyPercentage = 0.0899; // 8,99%
  const kiwifyFixedFee = 2.49; // R$ 2,49 por transação
  
  // Cálculos transparentes
  const grossRevenuePerStudent = averageTicket * commission;
  const kiwifyFeePerSale = (averageTicket * kiwifyPercentage) + kiwifyFixedFee;
  const kiwifyFeePerStudent = kiwifyFeePerSale * commission; // Taxa proporcional à comissão
  const netRevenuePerStudent = grossRevenuePerStudent - kiwifyFeePerStudent;
  
  const monthlyGrossRevenue = students * grossRevenuePerStudent;
  const monthlyKiwifyFees = students * kiwifyFeePerStudent;
  const monthlyNetRevenue = students * netRevenuePerStudent;
  const yearlyNetRevenue = monthlyNetRevenue * 12;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Modelo de parceria
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sua escola como{" "}
              <span className="text-gradient-gold">parceira oficial</span>{" "}
              do Tutor 360 IA
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ao se tornar escola parceira, você oferece o Tutor 360 IA aos seus alunos 
              e recebe <span className="text-foreground font-semibold">40% de comissão recorrente</span> sobre 
              cada assinatura ativa. Uma nova fonte de receita que cresce junto com sua escola.
            </p>
          </div>
          
          {/* Highlight box with animation */}
          <div className="p-8 rounded-3xl bg-gradient-card border border-primary/20 shadow-glow-purple mb-12 hover:shadow-[0_0_80px_-15px_hsl(262_83%_58%_/_0.5)] transition-shadow duration-500">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-6 animate-glow-pulse">
                <span className="text-4xl font-bold text-primary">40%</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Comissão recorrente</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                A cada assinatura realizada através da sua escola, você recebe 40% do valor 
                de forma recorrente. Enquanto o aluno continuar assinante, você continua ganhando.
              </p>
            </div>
          </div>

          {/* Earnings Simulator - Transparent Version */}
          <div className="p-8 rounded-3xl bg-gradient-card border border-secondary/30 mb-12">
            {/* Neuromarketing headline - Reciprocidade + Facilidade */}
            <p className="text-center text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              <span className="text-foreground font-semibold">Nós criamos. Nós mantemos. Nós entregamos pronto.</span>
              <br />
              <span className="text-secondary">Você só indica — e recebe.</span>
            </p>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Simulador de Ganhos</h3>
                <p className="text-sm text-muted-foreground">Valores reais, sem surpresas</p>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Slider */}
              <div>
                <label className="block text-sm text-muted-foreground mb-3">
                  Quantos alunos podem assinar?
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={students}
                  onChange={(e) => setStudents(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>10</span>
                  <span className="text-secondary font-bold text-lg">{students} alunos</span>
                  <span>500</span>
                </div>
              </div>

              {/* Breakdown transparente */}
              <div className="p-5 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">Detalhamento mensal</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Utilizamos a plataforma Kiwify para processar pagamentos. 
                          Taxa: 8,99% + R$ 2,49 por venda. Sem mensalidade ou taxa de adesão.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Comissão bruta (40%)</span>
                    <span className="font-medium">
                      R$ {monthlyGrossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Taxa de processamento*</span>
                    <span className="text-destructive">
                      - R$ {monthlyKiwifyFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                    <span className="font-semibold">Você recebe (líquido)</span>
                    <span className="text-xl font-bold text-secondary">
                      R$ {monthlyNetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cards de resultado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-muted/30 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Por mês (líquido)</p>
                  <p className="text-2xl font-bold text-secondary">
                    R$ {monthlyNetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ~R$ {netRevenuePerStudent.toFixed(2).replace('.', ',')} por aluno
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-secondary/10 border border-secondary/30 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Por ano (líquido)</p>
                  <p className="text-2xl font-bold text-secondary">
                    R$ {yearlyNetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receita recorrente garantida
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                *Baseado no plano Pro (R$ 89,90/mês). Taxa Kiwify: 8,99% + R$ 2,49 por venda. Sem mensalidade.
              </p>
            </div>
          </div>
          
          {/* Advantages grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((advantage, index) => (
              <div 
                key={index}
                className="flex gap-4 p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-secondary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                  <advantage.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{advantage.title}</h3>
                  <p className="text-muted-foreground text-sm">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnershipModelSection;
