"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/shared/Button";
import type { GraphData, CompetencyVector } from "@/lib/types";
import SubjectWheel from "@/components/home/SubjectWheel";
import { navigateHomeSection } from "@/lib/home-sections";

const Competency3D = dynamic(
  () => import("@/components/charts/Competency3D"),
  { ssr: false }
);

export default function HeroSection() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [hoveredProfile, setHoveredProfile] = useState<CompetencyVector | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  useEffect(() => {
    fetch("/data/graph.json")
      .then((r) => r.json())
      .then(setGraphData)
      .catch(() => {});
  }, []);

  const handleHoverMajor = (profile: CompetencyVector | null, title?: string) => {
    setHoveredProfile(profile);
    if (title) setSelectedTitle(title);
  };

  const top3 = useMemo(() => {
    if (!hoveredProfile) return [];
    return Object.entries(hoveredProfile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, score]) => ({
        id,
        score,
        title: graphData?.nodes.find((n) => n.id === id)?.title || id,
      }));
  }, [hoveredProfile, graphData]);

  return (
    <section className="relative min-h-screen overflow-hidden py-12">
      <div
        className="bridge-watermark flex flex-wrap content-start gap-20 p-8"
        aria-hidden="true"
      >
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className="text-lg font-semibold tracking-wider text-bridge-blue/[0.07] whitespace-nowrap select-none font-brand"
          >
            桥梁计划 · 千殊教育
          </span>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-6rem)] px-6 max-w-7xl mx-auto">
        <div className="lg:col-span-4 flex flex-col justify-center py-6">
          <p className="text-sm text-bridge-muted tracking-widest mb-2 font-brand">
            千殊教育 · TrillionSage
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-bridge-blue tracking-wide leading-tight font-brand">
            桥梁计划
          </h1>
          <p className="mt-4 text-base md:text-lg text-bridge-muted max-w-xl leading-relaxed font-sans">
            专业985理工硕博团队助力千万学子
          </p>
          <hr className="w-48 mt-6 border-0 h-px bg-gradient-to-r from-transparent via-bridge-gold to-transparent" />
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-md">
            <Button
              href="/#quiz-teaser"
              variant="primary"
              onClick={() => navigateHomeSection("quiz-teaser")}
            >
              数理素质测验
            </Button>
            <Button
              href="/#chat-teaser"
              variant="secondary"
              onClick={() => navigateHomeSection("chat-teaser")}
            >
              灵魂聊天共振
            </Button>
            <Button
              href="/#consultation"
              variant="accent"
              onClick={() => navigateHomeSection("consultation")}
            >
              1v1咨询引航
            </Button>
            <Button
              href="/#programs-preview"
              variant="accent"
              onClick={() => navigateHomeSection("programs-preview")}
            >
              数理线上营
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4 flex items-center justify-center py-6">
          <SubjectWheel onHoverMajor={handleHoverMajor} />
        </div>

        <div className="hidden lg:flex lg:flex-col lg:col-span-4 w-full items-stretch justify-center gap-3 py-6">
          {graphData ? (
            <Competency3D
              graphData={graphData}
              profileScores={hoveredProfile}
              className="w-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-[500px] rounded-xl bg-bridge-3d-bg text-white/30 text-sm">
              3D 图景加载中...
            </div>
          )}

          {top3.length > 0 && (
            <div className="w-full rounded-xl border border-white/50 bg-white/50 backdrop-blur-md px-4 py-3 shadow-glass">
              <p className="text-[11px] text-bridge-muted mb-2 truncate">
                {selectedTitle || "学科画像"} · 最需要的三项素质
              </p>
              <div className="flex gap-2">
                {top3.map((t, i) => (
                  <div
                    key={t.id}
                    className="flex-1 rounded-lg bg-bridge-gold/10 border border-bridge-gold/30 px-2 py-2 text-center"
                  >
                    <p className="text-[10px] text-bridge-gold font-semibold">TOP {i + 1}</p>
                    <p className="text-sm font-bold text-bridge-text leading-tight mt-0.5">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-bridge-muted mt-0.5">
                      {t.score.toFixed(1)} / 5
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
