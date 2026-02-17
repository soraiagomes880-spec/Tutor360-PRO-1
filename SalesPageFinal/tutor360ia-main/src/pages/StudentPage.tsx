import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StudentHeroSection from "@/components/student/StudentHeroSection";
import StudentPainSection from "@/components/student/StudentPainSection";
import StudentInsightSection from "@/components/student/StudentInsightSection";
import StudentSolutionSection from "@/components/student/StudentSolutionSection";
import StudentHowItWorksSection from "@/components/student/StudentHowItWorksSection";
import StudentBenefitsSection from "@/components/student/StudentBenefitsSection";
import StudentTargetSection from "@/components/student/StudentTargetSection";
import StudentPlansSection from "@/components/student/StudentPlansSection";
import StudentReinforcementSection from "@/components/student/StudentReinforcementSection";
import StudentFinalCTASection from "@/components/student/StudentFinalCTASection";

const StudentPage = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Reusing existing Header but assuming it links to home or has relevant nav items */}
            <Header />

            <main>
                <StudentHeroSection />
                <StudentPainSection />
                <StudentInsightSection />
                <StudentSolutionSection />
                <StudentHowItWorksSection />
                <StudentBenefitsSection />
                <StudentTargetSection />
                <StudentPlansSection />
                <StudentReinforcementSection />
                <StudentFinalCTASection />
            </main>

            <Footer />
            {/* Reusing floating WhatsApp button */}
            <WhatsAppButton />
        </div>
    );
};

export default StudentPage;
