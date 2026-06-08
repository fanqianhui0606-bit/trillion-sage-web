import HeroSection from "@/components/home/HeroSection";
import ValuesSection from "@/components/home/ValuesSection";
import ChatTeaserSection from "@/components/home/ChatTeaserSection";
import QuizTeaserSection from "@/components/home/QuizTeaserSection";
import ConsultationSection from "@/components/home/ConsultationSection";
import ProgramsPreviewSection from "@/components/home/ProgramsPreviewSection";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ValuesSection />
      <ChatTeaserSection />
      <QuizTeaserSection />
      <ConsultationSection />
      <ProgramsPreviewSection />
      <CTASection />
    </>
  );
}
