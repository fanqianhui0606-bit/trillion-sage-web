import type { Metadata } from "next";
import SectionTitle from "@/components/shared/SectionTitle";
import ProgramsInteractive from "@/components/programs/ProgramsInteractive";

export const metadata: Metadata = {
  title: "服务项目与高阶学术营 — 千殊教育",
  description: "桥梁计划 · 1v1 深度专业咨询服务及 8 周数理前沿衔接营流程。由 985/双一流理科硕博团队为学生未来的拔尖科研提供引航。",
};

export default function ProgramsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-6 text-bridge-text">
          <div className="relative flex items-center justify-center p-2 rounded-full bg-white/40 border border-white/[0.95] backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.7)] w-16 h-16 mb-4 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <SectionTitle
            title="服务项目与学术衔接营"
            subtitle="响应拔尖计划号召，以专业硕博力量培养未来的科学探险家"
          />
        </div>

        <div className="mt-8">
          <ProgramsInteractive />
        </div>
      </div>
    </div>
  );
}
