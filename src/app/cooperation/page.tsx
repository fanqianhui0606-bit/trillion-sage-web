import type { Metadata } from "next";
import GlassCard from "@/components/shared/GlassCard";
import SectionTitle from "@/components/shared/SectionTitle";
import Button from "@/components/shared/Button";

export const metadata: Metadata = {
  title: "合作方 — 千殊教育",
  description: "千殊教育合作机构与伙伴",
};

const COOP_TYPES = [
  { title: "生源合作", desc: "与中学合作，为优秀学生提供学术规划与测评服务" },
  { title: "学术合作", desc: "与高校院系合作，邀请教授参与课程设计与审核" },
  { title: "奖学金合作", desc: "与基金会合作，为经济困难学生提供资助" },
  { title: "技术合作", desc: "与科技公司合作，优化在线测评与教学平台" },
];

export default function CooperationPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionTitle
          title="合作伙伴"
          subtitle="与优质机构携手，共同推动数理教育创新"
        />

        <GlassCard className="mb-8">
          <h3 className="text-xl font-bold text-bridge-blue mb-4 text-center">合作方式</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COOP_TYPES.map((c) => (
              <div key={c.title} className="p-3 rounded-lg bg-white/20">
                <h4 className="font-semibold text-bridge-text">{c.title}</h4>
                <p className="text-sm text-bridge-muted mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="text-center">
          <Button href="/contact" variant="primary">
            成为合作伙伴
          </Button>
        </div>
      </div>
    </div>
  );
}
