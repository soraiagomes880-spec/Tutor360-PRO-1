const StudentInsightSection = () => {
    return (
        <section className="py-20 bg-secondary/5 border-y border-secondary/10">
            <div className="container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                        Confiança não vem só da teoria. <br />
                        <span className="text-gradient-gold">Confiança vem da repetição.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Você só se sente seguro quando: <br />
                        <span className="block mt-4 text-foreground">já tentou antes,</span>
                        <span className="block mt-2 text-foreground">já errou antes,</span>
                        <span className="block mt-2 text-foreground">já ajustou antes.</span>
                        <br />
                        <strong className="text-primary block mt-4 text-2xl">
                            Errar faz parte do processo. <br />
                            Não praticar é que mantém você travado.
                        </strong>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default StudentInsightSection;
