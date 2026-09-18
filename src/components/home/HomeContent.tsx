"use client";

import Image from "next/image";
import HeroSection from "@/components/home/HeroSection";
import CollapsibleSectionGroup from "@/components/shared/CollapsibleSectionGroup";
import ValuesSection from "@/components/home/ValuesSection";
import PromiseSection from "@/components/home/PromiseSection";
import QuizTeaserSection from "@/components/home/QuizTeaserSection";
import ChatTeaserSection from "@/components/home/ChatTeaserSection";
import ConsultationSection from "@/components/home/ConsultationSection";
import ProgramsPreviewSection from "@/components/home/ProgramsPreviewSection";
import CTASection from "@/components/home/CTASection";

export default function HomeContent() {
  return (
    <>
      <HeroSection />

      <CollapsibleSectionGroup
        sectionKey="who"
        title="我们是谁？"
        anchors={["values", "values-content", "promise"]}
        headerAbove={
          <div className="max-w-5xl mx-auto px-6 pt-10">
            <div className="rounded-xl overflow-hidden border border-white/70 shadow-glass">
              <Image
                src="/images/team-badge-wall.png"
                alt="千殊团队讲师皆来自北京大学、清华大学、中科院、兰州大学、武汉大学、中山大学、同济大学、南京大学、中国农业大学等顶级学府"
                width={1024}
                height={568}
                className="w-full h-auto object-contain"
                priority={false}
              />
            </div>
          </div>
        }
      >
        <ValuesSection hideBadgeWall />
        <PromiseSection />
      </CollapsibleSectionGroup>

      <CollapsibleSectionGroup
        sectionKey="fit"
        title="最适合你的专业是什么？"
        anchors={["quiz-teaser", "chat-teaser"]}
      >
        <QuizTeaserSection />
        <ChatTeaserSection />
      </CollapsibleSectionGroup>

      <CollapsibleSectionGroup
        sectionKey="path"
        title="如何规划你的大学路径？"
        anchors={["consultation"]}
      >
        <ConsultationSection />
      </CollapsibleSectionGroup>

      <CollapsibleSectionGroup
        sectionKey="camp"
        title="顾不过来？我们推荐——"
        anchors={["programs-preview"]}
      >
        <ProgramsPreviewSection />
      </CollapsibleSectionGroup>

      <CTASection />
    </>
  );
}
