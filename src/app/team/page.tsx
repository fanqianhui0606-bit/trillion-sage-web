import type { Metadata } from "next";
import SectionTitle from "@/components/shared/SectionTitle";
import TeamInteractive from "@/components/team/TeamInteractive";

export const metadata: Metadata = {
  title: "学术引路人与一对一导航 — 千殊教育",
  description: "桥梁计划一线硕博科研导师团，提供定制的理科学术衔接与 1v1 生涯规划服务。",
};

export default function TeamPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          title="星光引航 · 理科导师阵营"
          subtitle="所有导师均来自 985 或中科院系统，以最真实的前沿视野，破除中学与大学的学术信息差"
        />

        <div className="mt-12">
          <TeamInteractive />
        </div>
      </div>
    </div>
  );
}
