const StudentHowItWorksSection = () => {
    const steps = [
        {
            number: "01",
            title: "Escolha o idioma",
            description: "Selecione o idioma que deseja praticar.",
        },
        {
            number: "02",
            title: "Escolha o tipo de prática",
            description: "Defina como quer treinar hoje: texto, áudio ou imagem.",
        },
        {
            number: "03",
            title: "Envie texto, áudio ou imagem",
            description: "Interaja com a IA de forma natural.",
        },
        {
            number: "04",
            title: "Receba explicações e ajustes",
            description: "Entenda seus erros e melhore a cada interação.",
        },
        {
            number: "05",
            title: "Continue praticando",
            description: "A consistência é o segredo da evolução.",
        }
    ];

    return (
        <section className="py-24 bg-card/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-secondary font-bold uppercase tracking-wider text-sm mb-4 block">
                        COMO FUNCIONA
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold">Simples e direto:</h2>
                    <p className="text-xl text-muted-foreground mt-4">
                        Sem pressão. Sem constrangimento. Sem depender apenas do próximo dia de aula.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            <div className="text-6xl font-black text-secondary/10 mb-[-20px] relative z-0">
                                {step.number}
                            </div>
                            <div className="relative z-10 pt-4">
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 right-[-20%] w-[40%] h-[2px] bg-border/50" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StudentHowItWorksSection;
