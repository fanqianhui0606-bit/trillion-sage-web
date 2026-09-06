import type { Metadata } from "next";
import SectionTitle from "@/components/shared/SectionTitle";
import GlassCard from "@/components/shared/GlassCard";
import TeamInteractive from "@/components/team/TeamInteractive";

export const metadata: Metadata = {
  title: "1v1咨询引航 — 千殊教育",
  description: "985硕博学长1v1深度咨询，精准规划你的大学路径。",
};

const FEATURES = [
  {
    title: "专业资深",
    desc: "四十余名985硕博学长，从北京大学、清华大学、中科院到中大、南大，各个985及具国外留学经历的硕博生千殊都有。",
  },
  {
    title: "核导覆盖",
    desc: "覆盖涵盖数学、物理、生物、计算机等多个理工大类学科，从深空探测、电子科技到人工智能、自动化等专业具备核弹打击范围的专业覆盖。",
  },
  {
    title: "1v1定制",
    desc: "针对学生1对1定制化咨询方案，从兴趣导向到职业方向，每位导师深度咨询后推荐一份定制化发展路线。",
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          title="1v1咨询引航"
          subtitle="我们不做低端教学，而是成为你的人生导师——985硕博学长1v1深度咨询，精准规划你的大学路径。"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {FEATURES.map((item) => (
            <GlassCard key={item.title} className="text-center">
              <h3 className="text-lg font-bold text-bridge-blue mb-3">{item.title}</h3>
              <p className="text-bridge-muted text-sm leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>

        <TeamInteractive />
      </div>
    </div>
  );
}
