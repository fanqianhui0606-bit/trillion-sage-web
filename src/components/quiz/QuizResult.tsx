"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import Button from "@/components/shared/Button";
import GlassCard from "@/components/shared/GlassCard";
import ScoreBarChart from "@/components/quiz/ScoreBarChart";
import { FULL_DIMENSION_ORDER } from "@/lib/constants";
import type { UserScores, MajorMatchResult, GraphData, CatalogReference } from "@/lib/types";

const Competency3D = dynamic(
  () => import("@/components/charts/Competency3D"),
  { ssr: false }
);

function ValueOrientationBar({ scores }: { scores: UserScores["subjective"] }) {
  const pct = Math.round(scores.practicalShare * 100);
  const tierNames = ["", "理想导向", "偏理想", "均衡", "偏实际", "实际导向"];

  return (
    <GlassCard className="mb-6">
      <h3 className="text-lg font-bold text-bridge-blue mb-3">价值导向</h3>
      <div className="h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 h-full bg-white/60 rounded-r-full transition-all duration-700"
          style={{ width: `${100 - pct}%` }}
        />
        <div
          className="absolute -top-1 w-0.5 h-5 bg-white shadow-md transition-all duration-700"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-bridge-muted mt-1">
        <span>理想/抱负</span>
        <span>实际/利益</span>
      </div>
      <p className="text-center text-sm text-bridge-blue font-semibold mt-2">
        第 {scores.valueTier} 档 · {tierNames[scores.valueTier] ?? "-"}
      </p>
    </GlassCard>
  );
}

const PRO_EDITION_PITCH =
  "专业版在体验版 8 维测验基础上，提供 14 维全面数理素养评估（含记忆、整理、联想、好奇、自学、构建等），并支持查看全部理工科专业的匹配程度。";

export default function QuizResult({
  scores,
  matches,
  isSimple = false,
  lockedDimensions = [],
  fullDimensionOrder,
  catalogReference,
  contactText = "请联系「桥梁计划」团队购买参与",
  onRetry,
}: {
  scores: UserScores;
  matches: MajorMatchResult[];
  isSimple?: boolean;
  lockedDimensions?: string[];
  fullDimensionOrder?: string[];
  catalogReference?: CatalogReference;
  contactText?: string;
  onRetry: () => void;
}) {
  const [expandedMajor, setExpandedMajor] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showProOverlay, setShowProOverlay] = useState(false);
  const top5 = matches.slice(0, 5);

  const lockedSet = new Set(lockedDimensions);
  const displayDims =
    isSimple && fullDimensionOrder && fullDimensionOrder.length > 0
      ? fullDimensionOrder
      : FULL_DIMENSION_ORDER;

  useEffect(() => {
    fetch("/data/graph.json")
      .then((r) => r.json())
      .then(setGraphData)
      .catch(() => {}); // 3D graph optional
  }, []);

  const escHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowProOverlay(false);
    },
    [],
  );

  useEffect(() => {
    if (showProOverlay) {
      document.addEventListener("keydown", escHandler);
      return () => document.removeEventListener("keydown", escHandler);
    }
  }, [showProOverlay, escHandler]);

  // Build scores for 3D: locked dims get null
  const scores3d: Record<string, number | null> = {};
  for (const d of displayDims) {
    if (lockedSet.has(d)) {
      scores3d[d] = null;
    } else {
      scores3d[d] = scores.objective[d] ?? 0;
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-bridge-blue text-center mb-10">
          {isSimple ? "体验版测验结果" : "测评结果"}
        </h2>

        {/* Value orientation — hidden in simple */}
        {!isSimple && <ValueOrientationBar scores={scores.subjective} />}

        {/* Dimension scores */}
        <GlassCard className="mb-6">
          <h3 className="text-lg font-bold text-bridge-blue mb-4">
            {isSimple ? "一、数理素质" : "二、数理素质"}
          </h3>

          {isSimple && (
            <div className="mb-3 p-2.5 rounded-lg bg-bridge-blue/5 border border-bridge-blue/20 text-sm text-bridge-muted leading-relaxed">
              当前为 <strong>体验版 · 8 维</strong> 测验结果；记忆、整理、联想、好奇、自学、构建共 6 维未纳入本版测验。
            </div>
          )}

          <ScoreBarChart
            scores={scores.objective}
            displayDimensions={displayDims}
            lockedDimensions={lockedDimensions}
            lockedPlaceholder="专业版测验中查看"
          />
        </GlassCard>

        {/* 3D visualization */}
        {graphData && (
          <GlassCard className="mb-6 p-3">
            <Competency3D
              graphData={graphData}
              profileScores={scores3d as Record<string, number>}
              lockedDimensions={lockedDimensions}
              lockedHint={`${contactText}，开通专业版后可查看该素质维度结果。`}
              className="h-[400px]"
            />
          </GlassCard>
        )}

        {/* Top 5 recommendations */}
        <GlassCard className="mb-6">
          <h3 className="text-lg font-bold text-bridge-blue mb-4">
            {isSimple ? "二、推荐专业" : "三、推荐专业"}
          </h3>

          {isSimple && (
            <p className="mb-2 text-sm text-bridge-muted leading-relaxed">
              以下 Top5 依据体验版 <strong>8 维</strong> 客观素质，与全部 17 个二级专业画像中对应维度计算匹配。
            </p>
          )}

          <p className="text-xs text-bridge-muted mb-2">
            Top5 二级专业 · 仅依据数理素质匹配
          </p>

          <div className="space-y-3">
            {top5.map((m, i) => (
              <div key={m.majorId}>
                <button
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/20 hover:bg-white/40 transition-colors text-left"
                  onClick={() =>
                    setExpandedMajor(expandedMajor === m.majorId ? null : m.majorId)
                  }
                >
                  <span className="w-7 h-7 rounded-full bg-bridge-blue text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 font-semibold text-bridge-text">
                    {m.majorName}
                  </span>
                  <span className="text-xs text-bridge-blue font-mono">
                    {(m.score * 100).toFixed(1)}%
                  </span>
                </button>

                {expandedMajor === m.majorId && (
                  <div className="mt-1 ml-10 p-3 rounded-lg bg-white/30 text-sm text-bridge-muted leading-relaxed animate-fade-in">
                    {m.officialIntro}
                    {m.parents.length > 0 && (
                      <p className="mt-2 text-xs text-bridge-blue">
                        所属学科：{m.parents.join("、")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Catalog footer — simple edition only */}
          {isSimple && catalogReference && (
            <div className="mt-4 p-3 rounded-lg bg-white/35 border border-white/90 text-xs text-bridge-muted leading-relaxed">
              <div>{catalogReference.label}</div>
              {catalogReference.links.length > 0 && (
                <ul className="mt-1 pl-3 space-y-0.5">
                  {catalogReference.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-bridge-blue underline break-all"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </GlassCard>

        {/* Pro edition upsell — simple edition only */}
        {isSimple && (
          <GlassCard className="mb-8 text-center border border-dashed border-bridge-blue/35">
            <button
              onClick={() => setShowProOverlay(true)}
              className="inline-block px-5 py-2.5 text-base font-bold text-white rounded-xl shadow-md
                bg-gradient-to-r from-bridge-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-colors"
            >
              数理素质检测【专业版】
            </button>
            <p
              className="mt-3 text-sm text-bridge-muted leading-relaxed text-left"
              dangerouslySetInnerHTML={{ __html: PRO_EDITION_PITCH }}
            />
          </GlassCard>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={onRetry}>
            重新测验
          </Button>
          {isSimple ? (
            <button
              onClick={() => setShowProOverlay(true)}
              className="inline-block px-5 py-2.5 text-base font-bold text-white rounded-xl shadow-md
                bg-gradient-to-r from-bridge-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-colors cursor-pointer"
              style={{ border: "none" }}
            >
              查看专业版
            </button>
          ) : (
            <Button href="/contact" variant="primary">
              咨询学长学姐
            </Button>
          )}
        </div>
      </div>

      {/* Pro edition overlay */}
      {showProOverlay && (
        <div
          className="fixed inset-0 z-50 bg-[#eef2f7] overflow-auto"
          role="dialog"
          aria-modal="true"
          aria-label="专业版预览"
        >
          {/* Blur layer */}
          <div
            className="fixed inset-0 z-[51] pointer-events-none"
            style={{
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              maskImage:
                "radial-gradient(circle at 50% 50%, black 0%, black 28%, rgba(0,0,0,0.55) 52%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 50%, black 0%, black 28%, rgba(0,0,0,0.55) 52%, transparent 78%)",
              background:
                "radial-gradient(circle at 50% 50%, rgba(238,242,247,0.45) 0%, rgba(238,242,247,0.28) 35%, rgba(238,242,247,0.08) 62%, rgba(238,242,247,0) 85%)",
            }}
          />

          {/* Purchase message */}
          <p className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[52] m-0 px-3 py-2 text-sm md:text-base font-bold text-gray-900 tracking-wide whitespace-nowrap text-center">
            -----------请联系「桥梁计划」团队购买-----------
          </p>

          {/* Close button */}
          <button
            onClick={() => setShowProOverlay(false)}
            className="fixed top-4 right-4 z-[53] px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 cursor-pointer text-sm"
          >
            返回
          </button>

          {/* Mock professional edition content */}
          <div className="pointer-events-none select-none">
            <div className="text-center pt-8 pb-4">
              <p className="text-sm text-bridge-blue">— 千殊教育 TrillionSage —</p>
              <h2 className="text-2xl font-bold text-bridge-blue mt-1">桥梁计划</h2>
              <p className="text-base text-bridge-muted mt-1">
                数理素质测验 <span className="text-xs px-1.5 py-0.5 rounded bg-bridge-blue/10 text-bridge-blue">用户版</span>
              </p>
              <p className="text-sm text-bridge-muted mt-3">
                完成作答后将展示客观数理素质、价值导向 5 档简评（仅供参考），以及基于数理素质的 Top5 二级专业推荐。
              </p>
            </div>
            <div className="max-w-2xl mx-auto px-6">
              <GlassCard className="text-center py-4">
                <p className="text-bridge-muted">正在加载…</p>
              </GlassCard>
              <div className="text-center mt-4">
                <button
                  disabled
                  className="px-6 py-2 rounded-lg bg-bridge-blue/50 text-white cursor-not-allowed"
                >
                  开始测验
                </button>
              </div>
            </div>
          </div>

          {/* Click backdrop to close */}
          <div
            className="fixed inset-0 z-[49]"
            onClick={() => setShowProOverlay(false)}
          />
        </div>
      )}
    </div>
  );
}
