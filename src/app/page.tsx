import HeroSection from "@/components/home/HeroSection";
import SectionGroupTitle from "@/components/shared/SectionGroupTitle";
import ValuesSection from "@/components/home/ValuesSection";
import PromiseSection from "@/components/home/PromiseSection";
import QuizTeaserSection from "@/components/home/QuizTeaserSection";
import ChatTeaserSection from "@/components/home/ChatTeaserSection";
import ConsultationSection from "@/components/home/ConsultationSection";
import ProgramsPreviewSection from "@/components/home/ProgramsPreviewSection";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />

      <SectionGroupTitle title="我们是谁？" />
      <ValuesSection />
      <PromiseSection />

      <SectionGroupTitle title="最适合你的理工专业是什么？" />
      <QuizTeaserSection />
      <ChatTeaserSection />

      <SectionGroupTitle title="如何选择和规划你的大学路径？" />
      <ConsultationSection />

      <SectionGroupTitle title="专业太多，顾不过来？我们推荐——" />
      <ProgramsPreviewSection />

      <CTASection />
    </>
  );
}
