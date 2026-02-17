const StudentReinforcementSection = () => {
    return (
        <section className="py-20 bg-card border-y border-border/50">
            <div className="container mx-auto px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <span className="text-secondary font-bold uppercase tracking-wider text-sm mb-6 block">
                        REFORÇO PEDAGÓGICO
                    </span>
                    <p className="text-2xl md:text-3xl font-medium text-muted-foreground/80 leading-relaxed mb-8">
                        "O Tutor 360 IA <strong className="text-foreground">não substitui sua escola</strong> e nem o seu professor.
                        Ele <strong className="text-primary">reforça</strong> o que você aprende em sala, criando mais oportunidades de prática no seu dia a dia."
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 mt-12 text-lg font-bold">
                        <div className="p-4 rounded-xl bg-background border border-border/50">
                            A aula ensina.
                        </div>
                        <div className="p-4 rounded-xl bg-background border border-border/50">
                            A prática consolida.
                        </div>
                        <div className="p-4 rounded-xl bg-background border border-border/50 text-secondary">
                            A constância transforma.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentReinforcementSection;
