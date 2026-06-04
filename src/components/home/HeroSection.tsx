"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/shared/Button";
import type { GraphData } from "@/lib/types";

const Competency3D = dynamic(
  () => import("@/components/charts/Competency3D"),
  { ssr: false }
);

export default function HeroSection() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    fetch("/data/graph.json")
      .then((r) => r.json())
      .then(setGraphData)
      .catch(() => {});
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
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

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen px-6 max-w-7xl mx-auto">
        {/* Left — text & CTA */}
        <div className="flex flex-col justify-center py-16 lg:py-24">
          <p className="text-sm text-bridge-muted tracking-widest mb-2">
            千殊教育 · TrillionSage
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-bridge-blue tracking-wide leading-tight">
            桥梁计划
          </h1>
          <p className="mt-4 text-lg md:text-xl text-bridge-muted max-w-xl leading-relaxed">
            以数理思维为桥，连接天赋与未来
          </p>
          <p className="mt-3 text-sm text-bridge-muted/70 max-w-md leading-relaxed">
            14 项素质维度以三维空间立体呈现。四层能力结构，44 条关联路径——
            直观看到你的数理能力全貌。
          </p>
          <hr className="w-48 mt-6 border-0 h-px bg-gradient-to-r from-transparent via-bridge-gold to-transparent" />
          <div className="flex gap-4 mt-8">
            <Button href="/quiz" variant="primary">
              开始测评
            </Button>
            <Button href="/#values" variant="secondary">
              了解更多
            </Button>
          </div>
        </div>

        {/* Right — 3D visualization */}
        <div className="h-[450px] lg:h-[650px] w-full flex items-center justify-center">
          {graphData ? (
            <Competency3D graphData={graphData} className="h-full w-full" />
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
