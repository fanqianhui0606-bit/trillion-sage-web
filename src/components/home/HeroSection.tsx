"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/shared/Button";
import type { GraphData, CompetencyVector } from "@/lib/types";
import SubjectWheel from "@/components/home/SubjectWheel";

const Competency3D = dynamic(
  () => import("@/components/charts/Competency3D"),
  { ssr: false }
);

export default function HeroSection() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [hoveredProfile, setHoveredProfile] = useState<CompetencyVector | null>(null);

  useEffect(() => {
    fetch("/data/graph.json")
      .then((r) => r.json())
      .then(setGraphData)
      .catch(() => {});
  }, []);

  const handleHoverMajor = (profile: CompetencyVector | null) => {
    setHoveredProfile(profile);
  };

  return (
    <section className="relative min-h-screen overflow-hidden py-12">
      {/* Watermark background */}
      <div
        className="bridge-watermark flex flex-wrap content-start gap-20 p-8"
        aria-hidden="true"
      >
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className="text-base font-semibold tracking-wider text-bridge-blue/[0.07] whitespace-nowrap select-none"
          >
            桥梁计划 · 千殊教育
          </span>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-6rem)] px-6 max-w-7xl mx-auto">
        {/* Left — text & CTA (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-center py-6">
          <p className="text-sm text-bridge-muted tracking-widest mb-2 font-serif">
            千殊教育 · TrillionSage
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-bridge-blue tracking-wide leading-tight font-serif">
            桥梁计划
          </h1>
          <p className="mt-4 text-lg md:text-xl text-bridge-muted max-w-xl leading-relaxed font-serif">
            以数理思维为桥，连接天赋与未来
          </p>
          <p className="mt-3 text-sm text-bridge-muted/70 max-w-md leading-relaxed">
            14 项素质维度以三维空间立体呈现。四层能力结构，44 条关联路径——
            直观看到你的数理能力全貌。
          </p>
          <hr className="w-48 mt-6 border-0 h-px bg-gradient-to-r from-transparent via-bridge-gold to-transparent" />
          <div className="flex gap-4 mt-8">
            <Button href="/quiz" variant="primary">
              开始测验
            </Button>
            <Button href="/programs" variant="secondary">
              服务项目
            </Button>
          </div>
        </div>

        {/* Middle — Subject Wheel (4 cols) */}
        <div className="lg:col-span-4 flex items-center justify-center py-6">
          <SubjectWheel onHoverMajor={handleHoverMajor} />
        </div>

        {/* Right — 3D visualization (4 cols) */}
        <div className="lg:col-span-4 h-[450px] lg:h-[550px] w-full flex items-center justify-center py-6">
          {graphData ? (
            <Competency3D
              graphData={graphData}
              profileScores={hoveredProfile}
              className="h-full w-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64 rounded-xl bg-bridge-3d-bg text-white/30 text-sm">
              3D 图景加载中...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

