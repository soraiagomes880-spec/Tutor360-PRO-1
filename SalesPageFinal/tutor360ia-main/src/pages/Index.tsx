import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ContextSection from "@/components/landing/ContextSection";
import SolutionSection from "@/components/landing/SolutionSection";
import PartnershipModelSection from "@/components/landing/PartnershipModelSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PlansSection from "@/components/landing/PlansSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ContextSection />
        <SolutionSection />
        <PartnershipModelSection />
        <HowItWorksSection />
        <PlansSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;