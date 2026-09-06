import type { Metadata } from "next";
import SectionTitle from "@/components/shared/SectionTitle";
import ProgramsInteractive from "@/components/programs/ProgramsInteractive";

export const metadata: Metadata = {
  title: "咨询产品与数理线上营 — 千殊教育",
  description:
    "桥梁计划咨询产品、教育规划套餐与数理学科线上营完整信息。由 985 理工硕博团队提供 1v1 深度咨询与专业规划。",
};

export default function ProgramsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center text-bridge-text">
          <div className="relative flex items-center justify-center p-2 rounded-full bg-white/40 border border-white/[0.95] backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.7)] w-16 h-16 mb-4 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="千殊教育" className="w-full h-full object-contain rounded-full" />
          </div>
          <SectionTitle
            title="咨询产品与数理线上营"
            subtitle="响应国家号召，培养未来高科技人才 —— 985 数理工科硕博学长团队，为高中生及家长提供科学、专业的数理教育咨询与规划服务。"
          />
        </div>

        <ProgramsInteractive />
      </div>
    </div>
  );
}
