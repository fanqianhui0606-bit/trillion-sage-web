"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import Button from "@/components/shared/Button";
import ScoreBarChart from "@/components/quiz/ScoreBarChart";
import { formatSummaryParagraphs } from "@/lib/quiz-summary";
import { FULL_DIMENSION_ORDER, computeLayerAverages } from "@/lib/constants";
import { BrandText, withBrandFonts } from "@/components/shared/BrandText";
import type { UserScores, MajorMatchResult, GraphData, CatalogReference, WheelData, GraphNode, CompetencyVector } from "@/lib/types";
import { writeQuizExportForTracker } from "@/lib/quiz-export-bridge";

export interface ValueOrientationTier {
  tier: number;
  practicalScoreShareMin: number;
  practicalScoreShareMax: number;
  label: string;
  brief: string;
}

export interface ValueOrientationTiers {
  version: string;
  description: string;
  dimension: string;
  tierBasis: string;
  tierWidthShare: number;
  tiers: ValueOrientationTier[];
}

export interface MajorIntroItem {
  officialName: string;
  level2Category: string;
  topDiscipline: string;
  degreeTypes: string;
  yearAdded: string;
  intro: string;
  sources: { title: string; url: string }[];
}

export type MajorsIntroMap = Record<string, MajorIntroItem>;


const Competency3D = dynamic(
  () => import("@/components/charts/Competency3D"),
  { ssr: false }
);

// Fallback dimensions definition map in case graphData is not loaded
const DIMENSIONS_MAP: Record<string, { title: string; level: number; definition: string }> = {
  "操作": { title: "动手操作能力", level: 1, definition: "对工具的使用能力，强调试验、玩耍与技术开发。" },
  "好奇": { title: "好奇心", level: 1, definition: "对世界探索的内在驱动，主动追问“为什么/还能怎样”，影响探索深度与持续性。" },
  "执行": { title: "执行力", level: 1, definition: "按目标推进并完成任务的能力，体现节奏控制与落实效率。" },
  "抽象": { title: "抽象概念理解", level: 1, definition: "对抽象概念的理解能力，亦可将具体现象转化、提炼为概念、符号与模型的能力，是理解数理语言与建立统一框架的基础。" },
  "整理": { title: "整理归纳", level: 1, definition: "对信息进行分类、提炼与结构化表达的能力，帮助形成可复用知识单元。" },
  "观察": { title: "观察力", level: 1, definition: "捕捉细节、识别变化与发现异常的能力，是提出问题与验证判断的起点。" },
  "记忆": { title: "记忆力", level: 1, definition: "纯粹记忆事物的能力，用于支撑计算、推理与迁移。" },
  "空间": { title: "空间想象", level: 2, definition: "在脑内进行几何形态、位置与关系变换的能力，用于图形与结构理解。" },
  "联想": { title: "联想能力", level: 2, definition: "在不同知识域之间建立类比与映射的能力，帮助迁移与创新表达。" },
  "计算": { title: "计算能力", level: 2, definition: "基于规则与数量关系进行运算、估算与结果判断的能力。" },
  "推导": { title: "逻辑推导能力", level: 2, definition: "依据前提进行有步骤论证并得到结论的能力，强调链条清晰与可解释。" },
  "构建": { title: "构建框架", level: 3, definition: "组织为系统框架的能力，用于统筹策略与长期学习路径。" },
  "自主": { title: "自主探索能力", level: 3, definition: "能够自主设定小目标或探索路径的能力。" },
  "自学": { title: "自学能力", level: 4, definition: "在缺少外部指令时，仍可自我驱动完成“目标设定—资源筛选—实践验证—复盘迭代”的综合能力。" }
};

// ============================================================
// Sub-components
// ============================================================

// Canvas Interest Radar Chart
function InterestRadarChart({ scores }: { scores?: Record<string, number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scores) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 380;
    canvas.width = size;
    canvas.height = size;
    const w = size;
    const h = size;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.36;
    const subjects = ["数学", "物理", "化学", "生物", "计算机"];
    const n = subjects.length;

    ctx.clearRect(0, 0, w, h);
    const angles = subjects.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / n);

    // Radial grids
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let level = 2; level <= 10; level += 2) {
      const r = (level / 10) * maxR;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = cx + Math.cos(angles[i]) * r;
        const y = cy + Math.sin(angles[i]) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Web spokes
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angles[i]) * maxR, cy + Math.sin(angles[i]) * maxR);
      ctx.stroke();
    }

    // Data polygon
    ctx.fillStyle = "rgba(46, 117, 182, 0.22)";
    ctx.strokeStyle = "#2E75B6";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    subjects.forEach((sub, i) => {
      const v = Math.max(1, Math.min(10, Number(scores[sub] || 5)));
      const r = (v / 10) * maxR;
      const x = cx + Math.cos(angles[i]) * r;
      const y = cy + Math.sin(angles[i]) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Axis labels
    subjects.forEach((sub, i) => {
      const lx = cx + Math.cos(angles[i]) * (maxR + 24);
      const ly = cy + Math.sin(angles[i]) * (maxR + 24);
      ctx.fillStyle = "#A0aec0";
      ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sub, lx, ly);
    });
  }, [scores]);

  return (
    <div className="flex justify-center my-6">
      <canvas ref={canvasRef} className="max-w-[280px] md:max-w-[340px] aspect-square" />
    </div>
  );
}

function drawSubjectRadarToDataUrl(scores: Record<string, number>, size = 380) {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const w = size;
  const h = size;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.36;
  const subjects = ["数学", "物理", "化学", "生物", "计算机"];
  const n = subjects.length;
  
  ctx.clearRect(0, 0, w, h);
  const angles = subjects.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / n);
  
  ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
  ctx.lineWidth = 1;
  for (let level = 2; level <= 10; level += 2) {
    const r = (level / 10) * maxR;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = cx + Math.cos(angles[i]) * r;
      const y = cy + Math.sin(angles[i]) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angles[i]) * maxR, cy + Math.sin(angles[i]) * maxR);
    ctx.stroke();
  }
  
  ctx.fillStyle = "rgba(37, 99, 235, 0.22)";
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  subjects.forEach((sub, i) => {
    const v = Math.max(1, Math.min(10, Number(scores[sub] || 5)));
    const r = (v / 10) * maxR;
    const x = cx + Math.cos(angles[i]) * r;
    const y = cy + Math.sin(angles[i]) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  subjects.forEach((sub, i) => {
    const lx = cx + Math.cos(angles[i]) * (maxR + 22);
    const ly = cy + Math.sin(angles[i]) * (maxR + 22);
    ctx.fillStyle = "#334155";
    ctx.font = "600 14px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sub, lx, ly);
  });
  return canvas.toDataURL("image/png");
}

// Value Orientation Component
function ValueOrientationBar({ 
  scores, 
  tierData 
}: { 
  scores: UserScores["subjective"];
  tierData: ValueOrientationTiers | null;
}) {
  const pct = Math.round(scores.practicalShare * 100);
  const idealPct = 100 - pct;
  
  // Find current tier from loaded config
  const currentTier = tierData?.tiers?.find((t) => t.tier === scores.valueTier);
  const label = currentTier?.label || "升学与应用并重";
  const brief = currentTier?.brief || "你的作答显示，你在理想/抱负与实际/利益方向的考量比较均衡。";

  return (
    <div className="glass-panel p-4 md:p-5 mb-4">
      <h3 className="text-lg md:text-xl font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-serif">
        二、价值导向
      </h3>
      <p className="text-sm text-bridge-muted leading-relaxed mb-4 text-justify">
        价值导向部分显示你关于理想/抱负与实际/利益方向的考量比较。按照你对两个方向不同程度的侧重，共分为 5 档。
      </p>

      <div className="value-orient-wrap mb-4">
        <div className="h-3.5 rounded-full overflow-hidden bg-gradient-to-r from-green-500 via-yellow-400 to-orange-500 flex shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <div className="h-full bg-green-500/35 border-r-2 border-white/85" style={{ width: `${idealPct}%` }} />
          <div className="h-full bg-orange-500/35" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-sm">
          <span className="text-green-700 font-semibold">理想/抱负 {idealPct}%</span>
          <span className="text-orange-700 font-semibold text-right">实际/利益 {pct}%</span>
        </div>
      </div>

      <div className="text-sm text-slate-500 mb-2">
        价值导向第 <strong className="text-slate-800">{scores.valueTier}</strong> 档 / 共 5 档
      </div>
      <strong className="block mb-1 text-slate-800 text-base">{label}</strong>
      <div className="text-sm text-slate-600 leading-relaxed text-justify">
        {brief}
      </div>
    </div>
  );
}

// Bubble Word Cloud Component (Fibonacci Spiral)
function BubbleWordCloud({
  matches,
  onSelectMajor,
  activeMajorId,
}: {
  matches: MajorMatchResult[];
  onSelectMajor: (majorId: string) => void;
  activeMajorId: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 520 });


  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: Math.max(containerRef.current.clientWidth, 320),
          height: 520,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const n = matches.length;
  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;
  const maxR = Math.min(dimensions.width, dimensions.height) * 0.42;

  const scoresList = matches.map((m) => m.score);
  const minScore = Math.min(...scoresList);
  const maxScore = Math.max(...scoresList);
  const span = maxScore - minScore || 1;
  const GOLDEN_ANGLE = 2.39996; // 137.5 degrees in radians

  const bubbleElements = matches.map((item, i) => {
    // Optimizing placement Fermat's spiral with higher radius expansion and minimized random jitter to avoid overlapping (Problem 5)
    const randVal = Math.abs(Math.sin(i * 98765.4321)); 
    const rankNorm = (i + 0.5) / n;
    const rBase = maxR * Math.pow(rankNorm, 0.65);
    const dist = rBase * (0.96 + 0.08 * randVal);
    const ang = i * GOLDEN_ANGLE + (randVal - 0.5) * 0.12;
    
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist;

    const t = (item.score - minScore) / span;
    const size = 13 + t * 16; // Font sizes ~13px to 29px（全站字号上调后同步加大）

    // 参考设计（full-flow.html）：浅色舞台配深色字阶，匹配度越高颜色越深
    const color = ["#0b1220", "#1e293b", "#334155", "#475569", "#64748b"][
      Math.min(4, Math.floor((1 - t) * 4.99))
    ] || "#0b1220";

    const isActive = activeMajorId === item.majorId;
    // 必须把 translate 与 scale 写在同一 transform 里：Tailwind 的 scale-* 会覆盖定位
    const baseTransform = `translate(-50%, -50%) scale(${isActive ? 1.12 : 1})`;
    const baseZ = isActive ? 20 : Math.max(1, Math.round(t * 12));

    return (
      <button
        key={item.majorId}
        type="button"
        onClick={() => onSelectMajor(item.majorId)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.12)";
          e.currentTarget.style.zIndex = "30";
          e.currentTarget.style.color = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = baseTransform;
          e.currentTarget.style.zIndex = String(baseZ);
          e.currentTarget.style.color = isActive ? "#2563eb" : color;
        }}
        className="absolute select-none transition-[color,text-shadow] duration-200 font-sans cursor-pointer whitespace-nowrap px-2 py-0.5 border-none bg-transparent pointer-events-auto"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: baseTransform,
          zIndex: baseZ,
          fontSize: `${size}px`,
          fontWeight: isActive ? 800 : t > 0.55 ? 700 : 600,
          color: isActive ? "#2563eb" : color,
          textShadow: isActive
            ? "0 0 12px rgba(37,99,235,0.35), 0 1px 0 rgba(255,255,255,0.85)"
            : "0 1px 0 rgba(255,255,255,0.7)",
        }}
        title={`${item.majorId} · 匹配度 ${(item.score * 100).toFixed(2)}%`}
      >
        {item.majorName}
        <span className="ml-1 text-[0.82em] font-semibold opacity-90">
          {(item.score * 100).toFixed(2)}%
        </span>
      </button>
    );
  });

  return (
    <div
      ref={containerRef}
      id="floatStageAllMatch"
      className="relative min-h-[520px] w-full border border-white/95 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at 50% 42%, #ffffff 0%, #f1f5f9 55%, #dbe3ee 100%)",
      }}
    >
      {bubbleElements}
    </div>
  );
}



// ============================================================
// PDF Export script constants & styles
// ============================================================
const PDF_REPORT_WIDTH = 800;
const BRAND_LOGO_SRC = "/images/logo.jpg";
const PDF_PAGE_BG = "#ebebef";
const PDF_PAGE_GRADIENT = "linear-gradient(180deg, #a5a8c7 0%, #ebebef 72%, #f4f4f7 100%)";

const PDF_STYLES = `
  .pdf-root {
    box-sizing: border-box;
    width: ${PDF_REPORT_WIDTH}px;
    background: ${PDF_PAGE_GRADIENT};
    color: #1a1a1a;
    padding: 18px 22px 28px;
    font-family: "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif;
    font-weight: 500; /* Medium font weight globally for better legibility (Problem 10) */
  }
  .pdf-page-unit { width: 100%; box-sizing: border-box; }
  .pdf-cover { text-align: center; padding: 28px 16px 36px; margin-bottom: 22px; }
  .pdf-cover .pdf-logo { width: 72px; height: 72px; object-fit: contain; display: block; margin: 0 auto 14px; }
  .pdf-cover .co {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 10px;
    text-align: center;
    letter-spacing: 0.04em;
    width: 100%;
  }
  .pdf-cover h1 {
    margin: 0;
    font-size: 26px;
    color: #2e75b6;
    letter-spacing: 0.06em;
    text-align: center;
    width: 100%;
  }
  .pdf-cover .sub { margin: 10px 0 0; font-size: 15px; color: #334155; }
  .pdf-cover .name { margin: 18px 0 6px; font-size: 20px; font-weight: 700; color: #0f172a; }
  .pdf-cover .date { font-size: 12px; color: #64748b; }
  .pdf-block { background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.95); border-radius: 12px; padding: 14px 16px; margin: 0 0 22px; box-shadow: 0 4px 16px rgba(46,117,182,0.08); }
  .pdf-preface h2 { font-size: 16px; }
  .pdf-block h2 { margin: 0 0 8px; font-size: 17px; font-weight: 700; color: #2e75b6; border-bottom: 2px solid rgba(46,117,182,0.25); padding-bottom: 6px; }
  .pdf-intro { margin: 0 0 12px; font-size: 12px; line-height: 1.65; color: #475569; }
  .pdf-interest-scores { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 12px; color: #475569; margin-bottom: 10px; }
  .pdf-interest-scores strong { color: #2e75b6; }
  /* Centering radar chart in PDF exports (Problem 6) */
  .pdf-radar-wrap { display: flex; justify-content: center; align-items: center; width: 100%; margin: 12px 0; }
  .pdf-radar-wrap img { width: 280px; height: 280px; object-fit: contain; display: block; margin: 0 auto; }
  .pdf-value-bar { height: 12px; border-radius: 999px; overflow: hidden; display: flex; background: linear-gradient(90deg,#22c55e,#eab308,#f97316); margin: 8px 0 4px; }
  .pdf-value-bar .ideal { background: rgba(34,197,94,0.35); border-right: 2px solid rgba(255,255,255,0.85); height: 100%; }
  .pdf-value-bar .prac { background: rgba(249,115,22,0.35); height: 100%; }
  .pdf-value-labels { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 10px; }
  .pdf-tier-label { font-weight: 700; color: #1e293b; margin: 8px 0 6px; font-size: 13px; }
  .pdf-tier-brief { font-size: 11.5px; line-height: 1.75; color: #334155; text-align: justify; }
  .pdf-dim-row { margin: 10px 0; }
  .pdf-dim-head { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px; }
  .pdf-dim-name { font-weight: 700; color: #2e75b6; }
  .pdf-dim-score { color: #64748b; font-size: 11px; }
  .pdf-dim-def { font-size: 10.5px; color: #64748b; line-height: 1.5; margin-bottom: 4px; }
  .pdf-track { height: 7px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
  .pdf-fill { height: 100%; background: linear-gradient(90deg,#38bdf8,#2563eb); border-radius: 999px; }
  .pdf-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 8px; }
  .pdf-table th, .pdf-table td { border: 1px solid #e2e8f0; padding: 5px 4px; text-align: left; vertical-align: top; }
  .pdf-table th { background: rgba(248,250,252,0.95); color: #475569; font-weight: 600; }
  .pdf-table .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .pdf-table .rank { text-align: center; width: 28px; }
  .pdf-tail { margin-top: 8px; }
  .pdf-foot { margin: 0 0 12px; font-size: 10px; color: #94a3b8; text-align: center; }
  .pdf-catalog { margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(226,232,240,0.9); font-size: 10px; color: #64748b; line-height: 1.55; }
  .pdf-catalog-links { margin: 6px 0 0; padding-left: 1.1rem; }
  .pdf-catalog-links li { margin: 4px 0; word-break: break-all; }
  .pdf-promo { margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(148,163,184,0.55); font-size: 9px; color: #94a3b8; line-height: 1.6; }
  .pdf-promo-h { font-size: 9.5px; font-weight: 600; color: #64748b; margin-bottom: 5px; }
  .pdf-promo ul { margin: 0; padding-left: 1rem; }
  .pdf-promo li { margin: 2px 0; }
  .pdf-qr-grid { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px 14px; margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(226,232,240,0.8); }
  .pdf-qr-item { text-align: center; width: 88px; }
  .pdf-qr-item img { width: 72px; height: 72px; object-fit: contain; display: block; margin: 0 auto 4px; }
  .pdf-qr-item span { font-size: 8px; color: #64748b; line-height: 1.3; display: block; }
  .pdf-export-page {
    box-sizing: border-box;
    width: ${PDF_REPORT_WIDTH}px;
    min-height: 1131px; /* A4 aspect ratio height for 800px width */
    position: relative;
    padding: 28px 22px 44px;
    background: ${PDF_PAGE_GRADIENT};
    font-family: "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif;
  }
  .pdf-export-page--no-header { padding-top: 32px; }
  .pdf-export-page--no-header .pdf-page-header { display: none; }
  .pdf-export-page .pdf-page-watermark {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    opacity: 0.08;
    filter: grayscale(1) brightness(1.25);
    pointer-events: none;
    z-index: 0;
  }
  .pdf-export-page .pdf-page-header {
    position: relative;
    z-index: 1;
    text-align: center;
    font-size: 11px;
    color: #64748b;
    letter-spacing: 0.06em;
    margin: 0 0 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.35);
  }
  .pdf-export-page .pdf-page-body {
    position: relative;
    z-index: 1;
  }
  .pdf-export-page .pdf-page-body .pdf-block,
  .pdf-export-page .pdf-page-body .pdf-cover,
  .pdf-export-page .pdf-page-body .pdf-tail {
    margin-bottom: 18px;
  }
  .pdf-export-page .pdf-page-body .pdf-block:last-child,
  .pdf-export-page .pdf-page-body .pdf-tail:last-child {
    margin-bottom: 0;
  }
  .pdf-export-page .pdf-page-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 14px;
    z-index: 1;
    text-align: center;
    font-size: 10px;
    color: #94a3b8;
  }
  .pdf-l3-item { margin: 0 0 10px; padding: 10px 12px; background: rgba(255,255,255,0.55); border: 1px solid rgba(226,232,240,0.95); border-radius: 8px; }
  .pdf-l3-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 4px; }
  .pdf-l3-name { font-size: 13px; font-weight: 700; color: #0f172a; flex: 1; }
  .pdf-l3-code { font-size: 10px; font-family: ui-monospace, monospace; color: #2e75b6; white-space: nowrap; }
  .pdf-l3-degree { font-size: 10px; color: #64748b; margin-bottom: 4px; }
  .pdf-l3-intro { font-size: 10.5px; line-height: 1.65; color: #475569; text-align: justify; margin: 0; }
  .pdf-summary-body, .pdf-summary-para { font-family: "SimHei", "黑体", "Heiti SC", "Noto Sans SC", "Microsoft YaHei", sans-serif; }
`;

// ============================================================
// Main Component
// ============================================================

// ============================================================
// AI Summary Section
// ============================================================
const TIER_LABEL_FALLBACK: Record<number, string> = {
  1: "更偏向科研与升学探索",
  2: "理想导向略强，兼顾现实",
  3: "升学与应用并重",
  4: "应用导向略强，保留深造可能",
  5: "更偏向就业与应用落地",
};

/** 去掉三级专业简介中的重复高校/标签套话（统一放在「专业匹配」末尾说明） */
function cleanMajorIntro(intro: string | undefined | null): string {
  if (!intro) return "";
  return intro
    .replace(
      /不同高校的培养方案与课程侧重可能存在差异，建议结合当年招生简章与院系介绍进一步了解。?/g,
      "",
    )
    .replace(/与本项目素质标签相关的常见侧重包括：[^。]*。?/g, "")
    .trim();
}

/** 分层均分 — 按一/二/三层能力对各维度得分取平均（对齐参考设计 full-flow.html） */
function LayerAverageRows({
  objective,
  lockedDimensions = [],
}: {
  objective: CompetencyVector;
  lockedDimensions?: string[];
}) {
  const layers = computeLayerAverages(objective as Record<string, number>, lockedDimensions);
  if (!layers.some((l) => l.average != null)) return null;

  return (
    <div className="mt-6 pt-4 border-t border-slate-900/10">
      <p className="text-base font-bold text-bridge-blue mb-1">分层均分 · 一 / 二 / 三层能力</p>
      <p className="text-sm text-bridge-muted leading-relaxed mb-3">
        按一级基础、二级进阶、三级高级三层能力对各维度得分取平均，帮助你快速看清自身偏向哪一层。
      </p>
      <div className="space-y-3">
        {layers.map((l) => {
          const hasVal = l.average != null;
          const scoreText = hasVal ? `${(l.average as number).toFixed(2)}/5` : "专业版测验中查看";
          const widthPct = hasVal ? ((l.average as number) / 5) * 100 : 0;
          return (
            <div key={l.level} className="flex flex-col w-full">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-sm" style={{ color: l.color }}>
                  {l.name}
                </span>
                <span className={`text-sm font-semibold ${hasVal ? "font-mono text-slate-500" : "text-slate-400"}`}>
                  {scoreText}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${widthPct}%`, background: hasVal ? l.color : "#94a3b8" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuizSummarySection({
  userName,
  scores,
  matches,
  valueTiers,
  wheelData,
  onSummaryReady,
}: {
  userName: string;
  scores: UserScores;
  matches: MajorMatchResult[];
  valueTiers: ValueOrientationTiers | null;
  wheelData: WheelData | null;
  onSummaryReady?: (summary: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [compare, setCompare] = useState<{ pro: string; flash: string } | null>(null);
  const isInspect = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("edition") === "inspect";

  const loadSummary = useCallback(async () => {
    // 等档位配置与轮盘数据就绪，避免总评出现「第 3 档「」」和空三级专业列表
    if (!valueTiers || !wheelData) return;

    try {
      setLoading(true);
      setError(null);

      const [graphRes, matchConfigRes] = await Promise.all([
        fetch("/data/graph.json"),
        fetch("/data/match-config-four-factor.json"),
      ]);

      const graphData = await graphRes.json();
      const graphNodes: GraphNode[] = graphData.nodes || [];

      const matchConfig = await matchConfigRes.json().catch(() => ({}));
      const rawWeights = (matchConfig as { factorWeights?: Record<string, number> }).factorWeights || {};
      const factorWeights = {
        value: Number(rawWeights.valueOrientation ?? 1),
        interest: Number(rawWeights.interestOrientation ?? 2),
        habits: Number(rawWeights.thinkingHabits ?? 1),
        ability: Number(rawWeights.qualityAbility ?? 4),
      };

      const tierNo = scores.subjective.valueTier ?? 3;
      const currentTier = valueTiers.tiers?.find((t) => t.tier === tierNo);
      const valueLabel =
        (currentTier?.label || "").trim() || TIER_LABEL_FALLBACK[tierNo] || "升学与应用并重";

      const level2Catalog: Record<string, { code: string; name: string }[]> = {};
      for (const l2 of wheelData.level2 || []) {
        level2Catalog[l2.id] = (l2.level3 || []).map((x) => ({ code: x.code, name: x.name }));
      }

      const payload = {
        studentName: userName,
        objectiveUser: scores.objective || {},
        subjectInterest: scores.subjectInterest || {},
        interestAmbition: scores.subjective.interestAmbition ?? 0,
        practicalBenefit: scores.subjective.practicalBenefit ?? 0,
        valueTier: tierNo,
        valueLabel,
        valueBrief: currentTier?.brief ?? "",
        rankedMajors: matches || [],
        factorWeights,
        graphNodes,
        level2Catalog,
        compareBoth: isInspect,
      };

      const res = await fetch("/api/quiz-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "请求失败");

      setSummary(data.summary);
      onSummaryReady?.(data.summary || "");
      setSource(data.source || "fallback");
      setSourceLabel(data.sourceLabel || "本地规则模板");
      if (isInspect && data.compare) setCompare(data.compare);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      onSummaryReady?.("");
    } finally {
      setLoading(false);
    }
  }, [userName, isInspect, scores, matches, valueTiers, wheelData, onSummaryReady]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <div className="glass-panel p-4 md:p-5 mb-4">
      <h3 className="text-lg md:text-xl font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-sans">
        五、测验总评
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block w-6 h-6 border-2 border-bridge-blue border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm text-bridge-muted">正在生成总评...</p>
          </div>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-4">{error}</p>
      ) : isInspect && compare ? (
        // Inspect mode: side-by-side comparison
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border-2 ${source === "deepseek-v4-pro" ? "border-bridge-blue ring-2 ring-bridge-blue/30" : "border-white/10"} bg-white/20`}>
            <div className="text-sm font-bold text-bridge-blue mb-2">DeepSeek V4 Pro</div>
            <div className="space-y-3 text-sm text-bridge-text leading-relaxed font-sans" style={{ fontFamily: '"SimHei", "黑体", "Heiti SC", "Noto Sans SC", sans-serif' }}>
              {formatSummaryParagraphs(compare.pro).map((p, i) => (
                <p key={i}>{withBrandFonts(p)}</p>
              ))}
            </div>
          </div>
          <div className={`p-4 rounded-xl border-2 ${source === "deepseek-v4-flash" ? "border-bridge-gold ring-2 ring-bridge-gold/30" : "border-white/10"} bg-white/20`}>
            <div className="text-sm font-bold text-bridge-gold mb-2">DeepSeek V4 Flash</div>
            <div className="space-y-3 text-sm text-bridge-text leading-relaxed font-sans" style={{ fontFamily: '"SimHei", "黑体", "Heiti SC", "Noto Sans SC", sans-serif' }}>
              {formatSummaryParagraphs(compare.flash).map((p, i) => (
                <p key={i}>{withBrandFonts(p)}</p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-bridge-text leading-relaxed font-sans" style={{ fontFamily: '"SimHei", "黑体", "Heiti SC", "Noto Sans SC", sans-serif' }}>
          {formatSummaryParagraphs(summary).map((p, i) => (
            <p key={i} className="text-justify">{withBrandFonts(p)}</p>
          ))}
        </div>
      )}

      {sourceLabel && !loading && !error && (
        <p className="text-xs text-slate-400 text-right mt-3">
          当前正文来源：{sourceLabel}
        </p>
      )}
    </div>
  );
}

export default function QuizResult({
  scores,
  matches,
  isSimple = false,
  userName = "用户",
  activationCode = "体验版",
  lockedDimensions = [],
  fullDimensionOrder,
  catalogReference,
  contactText = "请联系「桥梁计划」团队购买参与",
  returnTo,
  onRetry,
  onBackToQuiz,
}: {
  scores: UserScores;
  matches: MajorMatchResult[];
  isSimple?: boolean;
  userName?: string;
  activationCode?: string;
  lockedDimensions?: string[];
  fullDimensionOrder?: string[];
  catalogReference?: CatalogReference;
  contactText?: string;
  /** 来自咨询流程时的返回地址，存在则展示「返回咨询流程」按钮 */
  returnTo?: string;
  onRetry: () => void;
  onBackToQuiz?: () => void;
}) {
  const [activeMajorId, setActiveMajorId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showProOverlay, setShowProOverlay] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingL3, setIsExportingL3] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summaryForPdf, setSummaryForPdf] = useState("");

  // Loaded metadata
  const [valueTiers, setValueTiers] = useState<ValueOrientationTiers | null>(null);
  const [wheelData, setWheelData] = useState<WheelData | null>(null);
  const [majorsIntro, setMajorsIntro] = useState<MajorsIntroMap | null>(null);

  const handleSummaryReady = useCallback((text: string) => {
    setSummaryForPdf(text);
  }, []);

  const top5 = matches.slice(0, 5);
  const lockedSet = new Set(lockedDimensions);
  const displayDims =
    isSimple && fullDimensionOrder && fullDimensionOrder.length > 0
      ? fullDimensionOrder
      : FULL_DIMENSION_ORDER;

  // Save paid quiz scores for AI chat comparison feature
  useEffect(() => {
    if (!isSimple && scores?.objective) {
      try {
        localStorage.setItem("tsg_paid_quiz_scores", JSON.stringify(scores.objective));
      } catch { /* ignore */ }
    }
  }, [isSimple, scores]);

  useEffect(() => {
    // Load local config resources
    Promise.all([
      fetch("/data/graph.json").then((r) => r.json()),
      fetch("/data/value-orientation-tiers.json").then((r) => r.json()),
      fetch("/data/wheel-data.json").then((r) => r.json()),
      fetch("/data/majors-intro.json").then((r) => r.json()),
    ])
      .then(([graph, tiers, wheel, intro]) => {
        setGraphData(graph);
        setValueTiers(tiers);
        setWheelData(wheel);
        setMajorsIntro(intro.majors || {});
      })
      .catch((e) => console.error("加载测评元数据失败", e));
  }, []);

  const escHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setShowProOverlay(false);
  }, []);

  useEffect(() => {
    if (showProOverlay) {
      document.addEventListener("keydown", escHandler);
      return () => document.removeEventListener("keydown", escHandler);
    }
  }, [showProOverlay, escHandler]);

  // Build scores for 3D
  const scores3d: Record<string, number | null> = {};
  for (const d of displayDims) {
    if (lockedSet.has(d)) {
      scores3d[d] = null;
    } else {
      scores3d[d] = scores.objective[d] ?? 0;
    }
  }

  // Find the currently active level 2 major with level 3 list
  const activeMajorObj = matches.find((m) => m.majorId === activeMajorId);
  const activeMajorWithL3 = activeMajorObj
    ? {
        ...activeMajorObj,
        level3: wheelData?.level2?.find((l2) => l2.id === activeMajorId)?.level3 || [],
      }
    : null;

  // --- Dynamic Script Loader Helper ---
  const loadScript = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  // --- PDF Export Core Function ---
  const handlePdfExport = async () => {
    if (!isSimple && !summaryForPdf.trim()) {
      alert("测验总评仍在生成中，请稍候再导出，以便 PDF 包含「五、测验总评」。");
      return;
    }
    try {
      setIsExporting(true);
      
      // 1. Dynamic import library via CDN
      await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvas = (window as any).html2canvas;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { jsPDF } = (window as any).jspdf;

      if (!html2canvas || !jsPDF) {
        throw new Error("PDF components load failed.");
      }

      // 2. Prepare context details
      const radarDataUrl = !isSimple && scores.subjectInterest
        ? drawSubjectRadarToDataUrl(scores.subjectInterest)
        : "";

      const currentTier = valueTiers?.tiers?.find((t) => t.tier === scores.subjective.valueTier);
      const generatedAt = new Date().toLocaleString("zh-CN", { hour12: false });
      
      // Objective rows matching graph definition descriptions
      const objectiveRows = displayDims.map((d) => {
        const fallback = DIMENSIONS_MAP[d] || { title: d, level: 1, definition: "" };
        const node = graphData?.nodes?.find((n) => n.id === d);
        return {
          id: d,
          title: node?.title || fallback.title,
          definition: node?.definition || fallback.definition,
          score: scores.objective[d] ?? 0,
          locked: lockedSet.has(d),
        };
      });

      // 3. Setup export document building blocks
      const esc = (s: string | number | undefined | null) => String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const buildPrefaceHtml = () => {
        const paragraphs = !isSimple
          ? [
              "本报告由千殊教育「桥梁计划」985 理工硕博学长团设计与解读。团队长期深耕数理工学科学习路径、素养框架与专业画像研究，致力于将一线学习与科研经验转化为可自检、可参照的测评工具。",
              "「数理素质测验 · 专业版」从兴趣导向、价值导向、14 维数理素质与专业匹配四个方向，对你的理工素养进行全景呈现；测验共 42 题，覆盖思维习惯、能力自检与价值取向，并参考 2026 年教育部最新本科专业目录，对全部 17 个理工类二级专业给出匹配参考。",
              "以下分板块展示你的自评与测算结果，供你了解自己的优势方向与可深入探索的专业领域。报告内容仅供参考，不构成唯一志愿或选科建议。"
            ]
          : [
              "本报告由千殊教育「桥梁计划」985 理工硕博学长团设计与解读，依据体验版测验的 8 维核心数理素质结果生成，并参考 2026 年教育部最新本科专业目录给出专业方向参考。",
              "体验版为快速自检入口；如需 14 维全面制造与四向专业匹配，可了解「数理素质测验 · 专业版」。"
            ];

        return `
          <div class="pdf-page-unit pdf-block pdf-preface" data-section="preface">
            <h2>报告说明</h2>
            ${paragraphs.map((p) => `<p class="pdf-intro">${esc(p)}</p>`).join("")}
          </div>
        `;
      };

      const buildInterestHtml = () => {
        if (isSimple || !scores.subjectInterest) return "";
        return `
          <div class="pdf-page-unit pdf-block" data-section="interest">
            <h2>一、兴趣导向</h2>
            <p class="pdf-intro">兴趣导向部分来自你在数学、物理、化学、生物、计算机五门学科上的兴趣自评。雷达图帮助你看清此刻更被哪些学科吸引。</p>
            ${radarDataUrl ? `<div class="pdf-radar-wrap"><img src="${radarDataUrl}" alt="兴趣导向雷达图" /></div>` : ""}
          </div>
        `;
      };

      const buildValueHtml = () => {
        if (isSimple) return "";
        const pctVal = Math.round(scores.subjective.practicalShare * 100);
        return `
          <div class="pdf-page-unit pdf-block" data-section="value">
            <h2>二、价值导向</h2>
            <p class="pdf-intro">价值导向部分显示你关于理想/抱负与实际/利益方向的考量比较。按照你对两个方向不同程度的侧重，共分为 5 档。</p>
            <div class="pdf-value-bar">
              <div class="ideal" style="width:${100 - pctVal}%"></div>
              <div class="prac" style="width:${pctVal}%"></div>
            </div>
            <div class="pdf-value-labels">
              <span style="color:#15803d;font-weight:600">理想/抱负 ${(100 - pctVal)}%</span>
              <span style="color:#c2410c;font-weight:600 font-size:11px">实际/利益 ${pctVal}%</span>
            </div>
            <div style="font-size:11px;color:#475569;margin-bottom:6px">价值导向第 <strong>${scores.subjective.valueTier}</strong> 档 / 共 5 档</div>
            <div class="pdf-tier-label">${esc(currentTier?.label || "")}</div>
            <div class="pdf-tier-brief">${esc(currentTier?.brief || "")}</div>
          </div>
        `;
      };

      const buildObjectiveHtml = () => {
        const title = !isSimple ? "三、数理素质" : "一、数理素质";
        const intro = !isSimple 
          ? "数理素质部分从 14 维数理素质出发对你从“思维习惯”和“素质能力”两方面综合检验后的结果进行呈现。14维数理素质由“桥梁计划”学长团从所有数理工学科的学习和实践中需要的基本素养中提炼而来，按照自低至高分为4层。"
          : "数理素质部分从 14 维数理素质出发对你从“思维习惯”和“能力程度”两方面综合检验后的结果进行呈现。14维数理素质由“桥梁计划”学长团从所有数理工学科的学习和实践中需要的基本素养中提炼而来，按照自低至高分为4层。体验版从中选取了核心 8 项数理素质呈现，未纳入的 6 维可在专业版测验中查看。";
        
        const rows = objectiveRows.map((row) => {
          const w = row.locked ? 0 : Math.max(0, Math.min(100, (row.score / 5) * 100));
          const scoreText = row.locked ? "专业版测验中查看" : `${row.score.toFixed(1)}/5`;
          return `
            <div class="pdf-dim-row">
              <div class="pdf-dim-head">
                <span class="pdf-dim-name">${esc(row.title || row.id)}</span>
                <span class="pdf-dim-score">${esc(scoreText)}</span>
              </div>
              ${row.definition ? `<div class="pdf-dim-def">${esc(row.definition)}</div>` : ""}
              <div class="pdf-track"><div class="pdf-fill" style="width:${w}%"></div></div>
            </div>
          `;
        }).join("");

        // 分层均分（与结果页 LayerAverageRows 一致）
        const layerRows = computeLayerAverages(
          scores.objective as Record<string, number>,
          lockedDimensions
        )
          .map((l) => {
            const hasVal = l.average != null;
            const scoreText = hasVal ? `${(l.average as number).toFixed(2)}/5` : "专业版测验中查看";
            const w = hasVal ? ((l.average as number) / 5) * 100 : 0;
            return `
              <div class="pdf-dim-row">
                <div class="pdf-dim-head">
                  <span class="pdf-dim-name" style="color:${l.color}">${esc(l.name)}</span>
                  <span class="pdf-dim-score">${esc(scoreText)}</span>
                </div>
                <div class="pdf-track"><div class="pdf-fill" style="width:${w}%;background:${hasVal ? l.color : "#94a3b8"}"></div></div>
              </div>
            `;
          })
          .join("");

        return `
          <div class="pdf-page-unit pdf-block" data-section="objective">
            <h2>${esc(title)}</h2>
            <p class="pdf-intro">${esc(intro)}</p>
            ${rows}
            <div style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(148,163,184,0.35)">
              <p class="pdf-tier-label">分层均分 · 一 / 二 / 三层能力</p>
              <p class="pdf-intro" style="margin-bottom:6px">按一级基础、二级进阶、三级高级三层能力对各维度得分取平均，帮助你快速看清自身偏向哪一层。</p>
              ${layerRows}
            </div>
          </div>
        `;
      };

      const buildSummaryHtml = () => {
        if (isSimple || !summaryForPdf) return "";
        const paras = formatSummaryParagraphs(summaryForPdf)
          .map((p) => `<p class="pdf-summary-para">${esc(p)}</p>`)
          .join("");
        return `
          <div class="pdf-page-unit pdf-block" data-section="summary">
            <h2>五、测验总评</h2>
            <div class="pdf-summary-body">${paras || `<p class="pdf-summary-para">${esc(summaryForPdf)}</p>`}</div>
          </div>
        `;
      };

      const buildMatchHtml = () => {
        const title = !isSimple ? "四、专业匹配" : "二、推荐专业";
        const intro = !isSimple
          ? "专业匹配部分参考最新教育部本科专业目录，从价值导向、兴趣导向、思维习惯与素质能力四方向全面与全部理工专业画像比对，显示你对于这些专业的大学学习、工作实践中的综合匹配程度。匹配程度越高，表示与当前画像越接近。结果仅供参考，不代表唯一正确答案。"
          : "该部分依据 8 维数理素质与全部 17 个理工专业画像计算匹配程度，展示以下 Top5 的专业，点击可查看介绍与三级专业列表。结果仅供参考，不代表唯一正确答案。";

        const rankedList = matches || [];
        const isFour = !isSimple && rankedList[0] && rankedList[0].valueSim != null;
        
        const head = isFour
          ? `<tr><th class="rank">#</th><th>二级专业</th><th class="num">综合</th><th class="num">价值</th><th class="num">兴趣</th><th class="num">习惯</th><th class="num">能力</th></tr>`
          : `<tr><th class="rank">#</th><th>二级专业</th><th class="num">匹配</th></tr>`;

        const pct = (s: number) => `${(s * 100).toFixed(2)}%`;
        
        const body = rankedList.map((item, i) => {
          const name = `${item.majorName}（${item.majorId}）`;
          if (isFour) {
            return `
              <tr>
                <td class="rank">${i + 1}</td>
                <td>${esc(name)}</td>
                <td class="num">${pct(item.score)}</td>
                <td class="num">${pct(item.valueSim ?? 0)}</td>
                <td class="num">${pct(item.interestSim ?? 0)}</td>
                <td class="num">${pct(item.habitsSim ?? 0)}</td>
                <td class="num">${pct(item.abilitySim ?? 0)}</td>
              </tr>
            `;
          }
          return `
            <tr>
              <td class="rank">${i + 1}</td>
              <td>${esc(name)}</td>
              <td class="num">${pct(item.score)}</td>
            </tr>
          `;
        }).join("");

        const catalogLabel = catalogReference?.label || "本专业推荐参考2026年最新教育部本科专业目录名单";
        const catalogLinks = catalogReference?.links?.map((l) => `<li>${esc(l.text || "参考")}链接：${esc(l.url || "")}</li>`).join("") || "";
        
        const catalogHtml = isSimple
          ? `<div class="pdf-catalog"><div>${esc(catalogLabel)}</div>${catalogLinks ? `<ul class="pdf-catalog-links">${catalogLinks}</ul>` : ""}</div>`
          : "";

        return `
          <div class="pdf-page-unit pdf-block" data-section="match">
            <h2>${esc(title)}</h2>
            <p class="pdf-intro">${esc(intro)}</p>
            <table class="pdf-table"><thead>${head}</thead><tbody>${body}</tbody></table>
            ${catalogHtml}
          </div>
        `;
      };

      const buildTailHtml = () => {
        const promoPlatforms = [
          { label: "官方网站", value: "trillionsage.com", url: "https://trillionsage.com" },
          { label: "官方微信公众号", value: "桥梁计划Bridge" },
          { label: "官方小红书1", value: "TrillionSage千殊窗口" },
          { label: "官方小红书2", value: "桥梁计划BridgePlan" },
          { label: "官方bilibili", value: "TrillionSage千殊" },
        ];
        const qrList = [
          { label: "微信公众号", src: "/images/wechat-qr.png" },
          { label: "千殊窗口小红书", src: "/images/xhs-qr-window.png" },
          { label: "桥梁计划小红书", src: "/images/xhs-qr-bridge.png" },
          { label: "bilibili", src: "/images/bilibili-qr.png" },
        ];

        return `
          <div class="pdf-page-unit pdf-tail">
            <p class="pdf-foot">本报告由桥梁计划数理素质测验生成，仅供参考，不构成唯一志愿建议。</p>
            <div class="pdf-promo">
              <div class="pdf-promo-h">桥梁计划 · 宣传平台</div>
              <ul>
                ${promoPlatforms.map((p) => p.url ? `<li>${esc(p.label)}：${esc(p.value)} · ${esc(p.label)}链接：${esc(p.url)}</li>` : `<li>${esc(p.label)}：${esc(p.value)}</li>`).join("")}
              </ul>
            </div>
            <div class="pdf-qr-grid">
              ${qrList.map((q) => `
                <div class="pdf-qr-item">
                  <img src="${q.src}" alt="${esc(q.label)}" crossorigin="anonymous" />
                  <span>${esc(q.label)}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      };

      const buildPdfWrapper = () => `
        <div class="pdf-root" id="pdfReportRoot" data-edition="${!isSimple ? "pro" : "simple"}">
          <style>${PDF_STYLES}</style>
          <div class="pdf-page-unit pdf-cover">
            <img class="pdf-logo" src="${BRAND_LOGO_SRC}" alt="千殊教育" crossorigin="anonymous" />
            <p class="co">— 千殊教育 TrillionSage —</p>
            <h1>桥梁计划 · 数理素质测验</h1>
            <p class="sub">${!isSimple ? "专业版测验结果报告" : "体验版测验结果报告"}</p>
            <p class="name">${esc(userName)}</p>
            <p class="date">生成时间：${esc(generatedAt)}</p>
          </div>
          ${buildPrefaceHtml()}
          ${buildInterestHtml()}
          ${buildValueHtml()}
          ${buildObjectiveHtml()}
          ${buildMatchHtml()}
          ${buildSummaryHtml()}
          ${buildTailHtml()}
        </div>
      `;

      // 4. Create host container and render
      const host = document.createElement("div");
      host.style.cssText = `position:fixed;left:0;top:0;width:${PDF_REPORT_WIDTH}px;z-index:-9999;opacity:0;pointer-events:none;`;
      host.innerHTML = buildPdfWrapper();
      document.body.appendChild(host);

      // Wait fonts and images to load
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
      await new Promise((r) => setTimeout(r, 600));

      const rootEl = host.querySelector(".pdf-root") as HTMLDivElement;

      // Group elements page-by-page to prevent layout cutoffs
      const pick = (sel: string) => rootEl.querySelector(sel);
      const cover = pick(".pdf-cover");
      const preface = pick('[data-section="preface"]');
      const interest = pick('[data-section="interest"]');
      const value = pick('[data-section="value"]');
      const objective = pick('[data-section="objective"]');
      const match = pick('[data-section="match"]');
      const summarySec = pick('[data-section="summary"]');
      const tail = pick(".pdf-tail");

      const pageGroups = !isSimple
        ? [
            [cover, preface, interest, value].filter(Boolean),
            [objective].filter(Boolean),
            [match, summarySec, tail].filter(Boolean),
          ]
        : [
            [cover, preface, objective].filter(Boolean),
            [match, tail].filter(Boolean),
          ];

      // Setup jsPDF
      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      const PDF_PAGE_HEIGHT_PX = Math.round(PDF_REPORT_WIDTH * (PAGE_H_MM / PAGE_W_MM));
      const totalPages = pageGroups.length;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      // Build each A4 page screenshot
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        
        // Background fill
        pdf.setFillColor(235, 235, 239);
        pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, "F");

        const hideHeader = i === 0;

        // Render page screenshot container
        const captureHost = document.createElement("div");
        captureHost.style.cssText = "position:fixed;left:-12000px;top:0;z-index:-1;opacity:0;pointer-events:none;";
        captureHost.innerHTML = `
          <style>${PDF_STYLES}</style>
          <style>
            .pdf-export-page--capture {
              min-height: ${PDF_PAGE_HEIGHT_PX}px !important;
              height: auto !important;
            }
          </style>
          <div class="pdf-export-page pdf-export-page--capture${hideHeader ? " pdf-export-page--no-header" : ""}">
            <img class="pdf-page-watermark" src="${BRAND_LOGO_SRC}" alt="" crossorigin="anonymous" />
            <div class="pdf-page-header">千殊教育 TrillionSage</div>
            <div class="pdf-page-body"></div>
            <div class="pdf-page-footer">第${i + 1}页/共${totalPages}页</div>
          </div>
        `;
        const bodyEl = captureHost.querySelector(".pdf-page-body")!;
        for (const u of pageGroups[i]) {
          bodyEl.appendChild((u as Element).cloneNode(true));
        }
        document.body.appendChild(captureHost);

        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const pageEl = captureHost.querySelector(".pdf-export-page") as HTMLDivElement;
        
        const captureHeightPx = Math.max(pageEl.offsetHeight, pageEl.scrollHeight, PDF_PAGE_HEIGHT_PX);
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: PDF_PAGE_BG,
          logging: false,
          width: PDF_REPORT_WIDTH,
          height: captureHeightPx,
          windowWidth: PDF_REPORT_WIDTH,
          windowHeight: captureHeightPx,
        });

        captureHost.remove();

        // Calculate size layout to fit A4 page
        let drawW = PAGE_W_MM;
        let drawH = (captureHeightPx / PDF_REPORT_WIDTH) * PAGE_W_MM;
        if (drawH > PAGE_H_MM) {
          const ratio = PAGE_H_MM / drawH;
          drawW *= ratio;
          drawH = PAGE_H_MM;
        }

        const xPos = (PAGE_W_MM - drawW) / 2;
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        
        pdf.addImage(imgData, "JPEG", xPos, 0, drawW, drawH);
      }

      // 5. Trigger download
      const cleanName = String(userName || "测验结果").trim().replace(/[\\/:*?"<>|]/g, "_").slice(0, 40) || "测验结果";
      pdf.save(`${cleanName}_桥梁计划_数理素质测验结果.pdf`);

      // 专业版：导出 PDF 时写入咨询流程导入键（对齐本地 full-flow.html）
      if (!isSimple) {
        writeQuizExportForTracker({
          studentName: userName,
          matches: matches || [],
          isPro: true,
        });
      }

      host.remove();
    } catch (err) {
      console.error("PDF export failed", err);
      alert("PDF 导出失败，请重试。");
    } finally {
      setIsExporting(false);
    }
  };

  /** 导出当前选中二级专业下的三级本科专业目录 PDF（千殊品牌背景） */
  const handleL3PdfExport = async () => {
    if (!activeMajorWithL3?.level3?.length) {
      alert("当前二级专业下暂无三级专业可导出。");
      return;
    }
    try {
      setIsExportingL3(true);
      await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvas = (window as any).html2canvas;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { jsPDF } = (window as any).jspdf;
      if (!html2canvas || !jsPDF) throw new Error("PDF components load failed.");

      const esc = (s: string | number | undefined | null) => String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const generatedAt = new Date().toLocaleString("zh-CN", { hour12: false });
      const l2 = activeMajorWithL3;
      const l3Items = (l2.level3 || []).map((l3) => {
        const info = majorsIntro?.[l3.code];
        return {
          code: l3.code,
          name: info?.officialName || l3.name,
          degree: info?.degreeTypes || "—",
          intro: cleanMajorIntro(info?.intro),
        };
      });

      const buildL3ItemsHtml = (items: typeof l3Items) =>
        items
          .map(
            (item) => `
          <div class="pdf-l3-item">
            <div class="pdf-l3-head">
              <span class="pdf-l3-name">${esc(item.name)}</span>
              <span class="pdf-l3-code">${esc(item.code)}</span>
            </div>
            <div class="pdf-l3-degree">学位门类：${esc(item.degree)}</div>
            ${item.intro ? `<p class="pdf-l3-intro">${esc(item.intro)}</p>` : ""}
          </div>`
          )
          .join("");

      const buildL2IntroBlock = () => `
        <div class="pdf-page-unit pdf-block" data-section="l2intro">
          <h2>${esc(l2.majorName)}（${esc(l2.majorId)}）</h2>
          <p class="pdf-intro">综合匹配 ${esc((l2.score * 100).toFixed(2))}% · 关联一级学科：${esc(l2.parents?.join("、") || "—")}</p>
          <p class="pdf-intro">${esc(l2.officialIntro || "暂无该二级专业大类介绍。")}</p>
          <p class="pdf-intro" style="margin-bottom:0">以下列出该二级专业大类下设的本科专业（参考教育部最新本科专业目录），供进一步探索与对照。</p>
        </div>`;

      const L3_PER_PAGE = 5;
      const l3Chunks: typeof l3Items[] = [];
      for (let i = 0; i < l3Items.length; i += L3_PER_PAGE) {
        l3Chunks.push(l3Items.slice(i, i + L3_PER_PAGE));
      }

      const buildL3ChunkBlock = (items: typeof l3Items, pageNo: number, total: number) => `
        <div class="pdf-page-unit pdf-block" data-section="l3list">
          <h2>下设本科专业名单${total > 1 ? `（${pageNo}/${total}）` : ""}</h2>
          ${buildL3ItemsHtml(items)}
        </div>`;

      const buildL3Tail = () => `
        <div class="pdf-page-unit pdf-tail">
          <p class="pdf-foot">本目录由桥梁计划数理素质测验生成，仅供参考。不同高校培养方案可能存在差异，请结合当年招生简章进一步了解。</p>
        </div>`;

      const host = document.createElement("div");
      host.style.cssText = `position:fixed;left:0;top:0;width:${PDF_REPORT_WIDTH}px;z-index:-9999;opacity:0;pointer-events:none;`;
      host.innerHTML = `
        <div class="pdf-root" id="pdfL3Root">
          <style>${PDF_STYLES}</style>
          <div class="pdf-page-unit pdf-cover">
            <img class="pdf-logo" src="${BRAND_LOGO_SRC}" alt="千殊教育" crossorigin="anonymous" />
            <p class="co">— 千殊教育 TrillionSage —</p>
            <h1>桥梁计划 · 三级专业目录</h1>
            <p class="sub">${esc(l2.majorName)} · ${esc(l2.majorId)}</p>
            <p class="name">${esc(userName)}</p>
            <p class="date">生成时间：${esc(generatedAt)}</p>
          </div>
          ${buildL2IntroBlock()}
          ${l3Chunks.map((chunk, i) => buildL3ChunkBlock(chunk, i + 1, l3Chunks.length)).join("")}
          ${buildL3Tail()}
        </div>`;
      document.body.appendChild(host);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
      await new Promise((r) => setTimeout(r, 400));

      const rootEl = host.querySelector(".pdf-root") as HTMLDivElement;
      const cover = rootEl.querySelector(".pdf-cover");
      const l2intro = rootEl.querySelector('[data-section="l2intro"]');
      const l3blocks = Array.from(rootEl.querySelectorAll('[data-section="l3list"]'));
      const tail = rootEl.querySelector(".pdf-tail");
      const pageGroups = [
        [cover, l2intro].filter(Boolean),
        ...l3blocks.map((b) => [b]),
        [tail].filter(Boolean),
      ].filter((g) => g.length > 0);

      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      const PDF_PAGE_HEIGHT_PX = Math.round(PDF_REPORT_WIDTH * (PAGE_H_MM / PAGE_W_MM));
      const totalPages = pageGroups.length;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        pdf.setFillColor(235, 235, 239);
        pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, "F");

        const hideHeader = i === 0;
        const captureHost = document.createElement("div");
        captureHost.style.cssText = "position:fixed;left:-12000px;top:0;z-index:-1;opacity:0;pointer-events:none;";
        captureHost.innerHTML = `
          <style>${PDF_STYLES}</style>
          <style>.pdf-export-page--capture { min-height: ${PDF_PAGE_HEIGHT_PX}px !important; height: auto !important; }</style>
          <div class="pdf-export-page pdf-export-page--capture${hideHeader ? " pdf-export-page--no-header" : ""}">
            <img class="pdf-page-watermark" src="${BRAND_LOGO_SRC}" alt="" crossorigin="anonymous" />
            <div class="pdf-page-header">千殊教育 TrillionSage</div>
            <div class="pdf-page-body"></div>
            <div class="pdf-page-footer">第${i + 1}页/共${totalPages}页</div>
          </div>`;
        const bodyEl = captureHost.querySelector(".pdf-page-body")!;
        for (const u of pageGroups[i]) {
          bodyEl.appendChild((u as Element).cloneNode(true));
        }
        document.body.appendChild(captureHost);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const pageEl = captureHost.querySelector(".pdf-export-page") as HTMLDivElement;
        const captureHeightPx = Math.max(pageEl.offsetHeight, pageEl.scrollHeight, PDF_PAGE_HEIGHT_PX);
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: PDF_PAGE_BG,
          logging: false,
          width: PDF_REPORT_WIDTH,
          height: captureHeightPx,
          windowWidth: PDF_REPORT_WIDTH,
          windowHeight: captureHeightPx,
        });
        captureHost.remove();

        let drawW = PAGE_W_MM;
        let drawH = (captureHeightPx / PDF_REPORT_WIDTH) * PAGE_W_MM;
        if (drawH > PAGE_H_MM) {
          const ratio = PAGE_H_MM / drawH;
          drawW *= ratio;
          drawH = PAGE_H_MM;
        }
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (PAGE_W_MM - drawW) / 2, 0, drawW, drawH);
      }

      const cleanUser = String(userName || "用户").trim().replace(/[\\/:*?"<>|]/g, "_").slice(0, 20) || "用户";
      const cleanL2 = String(l2.majorName || l2.majorId).replace(/[\\/:*?"<>|]/g, "_").slice(0, 20);
      pdf.save(`${cleanUser}_${cleanL2}_三级专业目录.pdf`);
      host.remove();
    } catch (err) {
      console.error("L3 PDF export failed", err);
      alert("三级专业目录 PDF 导出失败，请重试。");
    } finally {
      setIsExportingL3(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Brand Header — Aligned with .bridge-header in GitHub full-flow.html */}
        <header className="text-center pb-6 text-bridge-text">
          <p className="text-sm text-bridge-muted tracking-wider mb-0.5">
            — <BrandText>千殊教育</BrandText> TrillionSage —
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-2 mb-4">
            <div className="relative flex items-center justify-center p-2 rounded-full bg-white/40 border border-white/[0.95] backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.7)] w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.jpg"
                alt="千殊教育"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-bridge-blue tracking-wide font-brand">桥梁计划</h1>
              <div className="flex gap-4 mt-2 text-sm text-bridge-muted justify-center md:justify-start">
                <span>姓名: {userName}</span>
                <span>激活码: {activationCode}</span>
              </div>
            </div>
          </div>
          <div className="title-sub-wrap inline-flex items-center justify-center gap-2 mt-2 max-w-full">
            <p className="bg-[#e8e8ec] text-bridge-text px-3 py-0.5 text-base md:text-lg font-bold">
              数理素质测验
              {!isSimple && (
                <span className="inline-block ml-2 px-2 py-0.5 text-xs rounded-full bg-bridge-blue/15 text-bridge-blue font-semibold">
                  专业版
                </span>
              )}
            </p>
            {isSimple && (
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-500/15 text-green-700 font-semibold font-sans">
                体验版
              </span>
            )}
          </div>
          <p className="text-sm italic text-bridge-text mt-4">—— 响应国家号召，培养未来高科技人才 ——</p>
          <hr className="my-5 max-w-xl mx-auto h-[1px] bg-white/90 border-none" />
        </header>

        {/* Outer panel matching #result.panel in GitHub */}
        <section id="result" className="glass-panel p-4 md:p-6 mb-4">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-bridge-blue text-center tracking-wide font-sans">
              测验结果
            </h2>
          </div>

          {/* Section 1: Interest Radar Chart — Pro version only */}
          {!isSimple && scores.subjectInterest && (
            <div className="glass-panel p-4 md:p-5 mb-4">
              <h3 className="text-lg md:text-xl font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-serif">
                一、兴趣导向
              </h3>
              <p className="text-sm text-bridge-muted leading-relaxed mb-4 text-justify">
                兴趣导向部分来自你在数学、物理、化学、生物、计算机五门学科上的兴趣自评。雷达图帮助你看清此刻更被哪些学科吸引。
              </p>
              <InterestRadarChart scores={scores.subjectInterest} />
            </div>
          )}

          {/* Section 2: Value Orientation — Pro version only */}
          {!isSimple && <ValueOrientationBar scores={scores.subjective} tierData={valueTiers} />}

          {/* Section 3: Objective Competency Scores */}
          <div className="glass-panel p-4 md:p-5 mb-4">
            <h3 className="text-lg md:text-xl font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-serif">
              {isSimple ? "一、数理素质" : "三、数理素质"}
            </h3>
            <p className="text-sm text-bridge-muted leading-relaxed mb-4 text-justify">
              {isSimple 
                ? withBrandFonts("数理素质部分从 14 维数理素质出发对你从“思维习惯”和“能力程度”两方面综合检验后的结果进行呈现。14维数理素质由“桥梁计划”学长团从所有数理工学科的学习和实践中需要的基本素养中提炼而来，按照自低至高分为4层。体验版从中选取了核心 8 项数理素质呈现，未纳入的 6 维可在专业版测验中查看。")
                : withBrandFonts("数理素质部分从 14 维数理素质出发对你从“思维习惯”和“素质能力”两方面综合检验后的结果进行呈现。14维数理素质由“桥梁计划”学长团从所有数理工学科的学习和实践中需要的基本素养中提炼而来，按照自低至高分为4层。")}
            </p>

            {isSimple && (
              <div className="mb-4 p-3 rounded-lg bg-bridge-blue/5 border border-bridge-blue/20 text-sm text-bridge-muted leading-relaxed">
                当前为 <strong>体验版 · 8 维</strong> 测验结果；记忆、整理、联想、好奇、自学、构建共 6 维未纳入本版测验。
              </div>
            )}

            <ScoreBarChart
              scores={scores.objective}
              displayDimensions={displayDims}
              lockedDimensions={lockedDimensions}
              lockedPlaceholder="专业版测验中查看"
            />

            {/* 分层均分（一/二/三层能力平均得分） */}
            <LayerAverageRows objective={scores.objective} lockedDimensions={lockedDimensions} />

            {/* 3D guide description */}
            <div className="mt-6 p-3 rounded-lg border border-white/95 bg-white/30 text-sm text-bridge-text leading-relaxed">
              <p className="font-bold text-bridge-blue mb-1">3D 素质图景说明：</p>
              <p>右图为你的数理核心素质在三维空间中的拓扑关联网络：</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li><strong>节点大小 & 亮度</strong>：代表你的得分高低（高分点呈现亮蓝色）。</li>
                <li><strong>未解锁点（置灰）</strong>：体验版未测维度，在 3D 模型中呈现暗灰色。</li>
                <li><strong>空间连线</strong>：展示了不同素质之间的学科学习关联强度，拖动或滚动鼠标可以旋转和缩放 3D 视图。</li>
              </ul>
            </div>

            {/* 3D Competency Visualization */}
            {graphData && (
              <div className="relative mt-4 border border-slate-200 rounded-lg overflow-hidden bg-bridge-3d-bg h-[380px] md:h-[450px]">
                <Competency3D
                  key={refreshKey}
                  graphData={graphData}
                  profileScores={scores3d as Record<string, number>}
                  lockedDimensions={lockedDimensions}
                  lockedHint={`${contactText}，解锁专业版可查看 14 维视角`}
                  className="w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => setRefreshKey((prev) => prev + 1)}
                  className="absolute bottom-3 right-3 z-10 px-3 py-1.5 text-xs font-semibold text-bridge-blue bg-white/80 hover:bg-white border border-bridge-blue/20 rounded-md shadow-sm transition-all cursor-pointer"
                >
                  重置 3D 视图
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Recommendations & Matches */}
          <div className="glass-panel p-4 md:p-5">
            <h3 className="text-lg md:text-xl font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-serif">
              {isSimple ? "二、推荐专业" : "四、专业匹配"}
            </h3>

            <p className="text-sm text-bridge-muted leading-relaxed mb-4 text-justify">
              {isSimple 
                ? "该部分依据 8 维数理素质与全部 17 个理工专业画像计算匹配程度，展示以下 Top5 的专业，点击可查看介绍与三级专业列表。结果仅供参考，不代表唯一正确答案。"
                : "专业匹配部分参考最新教育部本科专业目录，从价值导向、兴趣导向、思维习惯与素质能力四方向全面与全部理工专业画像比对，显示你对于这些专业的大学学习、工作实践中的综合匹配程度。匹配程度越高，表示与当前画像越接近。结果仅供参考，不代表唯一正确答案。"}
            </p>

            <p className="text-sm font-bold text-bridge-blue mb-2.5">
              {isSimple ? "请点击栏中专业，查看更多信息" : "点击图中专业查看更多信息"}
            </p>

            {isSimple ? (
              // Static Top 5 recommendation list in simple version
              <ul className="space-y-2.5 mb-5 pl-1">
                {top5.map((m, idx) => {
                  const size = [26, 22, 19, 17, 15][idx] || 15;
                  const color = ["#0b1220", "#1e293b", "#334155", "#475569", "#64748b"][idx];
                  const isActive = activeMajorId === m.majorId;
                  return (
                    <li key={m.majorId} className="list-none">
                      <button
                        onClick={() => setActiveMajorId(activeMajorId === m.majorId ? null : m.majorId)}
                        className={`w-full text-left font-serif cursor-pointer hover:underline transition-all border-none bg-transparent p-0 ${
                          isActive ? "font-bold underline text-bridge-blue" : ""
                        }`}
                        style={{
                          fontSize: `${size}px`,
                          color: isActive ? "#2E75B6" : color,
                        }}
                      >
                        {idx + 1}. {m.majorName}（{m.majorId}）匹配 {(m.score * 100).toFixed(2)}%
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              // Bubble Word Cloud Stage in Pro version
              <div className="mb-4">
                <BubbleWordCloud
                  matches={matches}
                  onSelectMajor={(id) => setActiveMajorId(activeMajorId === id ? null : id)}
                  activeMajorId={activeMajorId}
                />
              </div>
            )}

            {/* Shared detail container below bubble / list selection */}
            {activeMajorWithL3 ? (
              <div className="mt-4 p-4 rounded-xl border border-white/95 bg-white/35 shadow-sm text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900/5 pb-2 mb-2 gap-1.5">
                  <h4 className="text-base font-bold text-bridge-blue font-sans">
                    {activeMajorWithL3.majorName}（{activeMajorWithL3.majorId}）
                  </h4>
                  <span className="text-orange-700 font-bold font-sans">
                    综合匹配 {(activeMajorWithL3.score * 100).toFixed(2)}%
                  </span>
                </div>
                
                <p className="text-sm text-bridge-muted leading-relaxed text-justify mb-3 whitespace-pre-line">
                  {activeMajorWithL3.officialIntro || "暂无该二级专业大类介绍。"}
                  {"\n"}
                  <span className="text-xs text-slate-500 font-sans block mt-1.5">
                    关联一级学科：{activeMajorWithL3.parents?.join("、") || "—"}
                  </span>
                </p>

                {/* 4 factors match percentages (Pro only) */}
                {!isSimple && 
                 activeMajorWithL3.valueSim != null && 
                 activeMajorWithL3.interestSim != null && 
                 activeMajorWithL3.habitsSim != null && 
                 activeMajorWithL3.abilitySim != null && (
                  <div className="mb-3 pt-2.5 border-t border-slate-900/5">
                    <span className="text-xs text-slate-500 font-bold block mb-1">各因子匹配度：</span>
                    <span className="text-sm text-slate-600 font-sans">
                      价值 {(activeMajorWithL3.valueSim * 100).toFixed(2)}% · 
                      兴趣 {(activeMajorWithL3.interestSim * 100).toFixed(2)}% · 
                      习惯 {(activeMajorWithL3.habitsSim * 100).toFixed(2)}% · 
                      能力 {(activeMajorWithL3.abilitySim * 100).toFixed(2)}%
                    </span>
                  </div>
                )}

                {/* Level 3 majors list */}
                {activeMajorWithL3.level3 && activeMajorWithL3.level3.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-900/5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h5 className="text-sm font-bold text-bridge-blue uppercase tracking-wider">下设本科专业名单</h5>
                      <button
                        type="button"
                        onClick={handleL3PdfExport}
                        disabled={isExportingL3}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-bridge-blue hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExportingL3 ? "正在导出…" : "导出此专业下相关3级专业"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {activeMajorWithL3.level3.map((l3) => {
                        const info = majorsIntro?.[l3.code];
                        const title = info?.officialName || l3.name;
                        const degree = info?.degreeTypes || "—";
                        return (
                          <div key={l3.code} className="p-3 rounded-lg border border-white/95 bg-white/30 hover:bg-white/40 transition-colors text-sm">
                            <div className="flex justify-between items-start mb-1 gap-1">
                              <span className="font-bold text-slate-800 text-base">{title}</span>
                              <span className="font-mono px-1.5 py-0.5 rounded bg-bridge-blue/10 text-bridge-blue text-xs flex-shrink-0">{l3.code}</span>
                            </div>
                            <span className="text-xs text-slate-500 block mb-1">学位门类：{degree}</span>
                            {cleanMajorIntro(info?.intro) && (
                              <p className="text-sm text-slate-600 leading-relaxed text-justify mt-1.5 pt-1.5 border-t border-slate-900/5">
                                {cleanMajorIntro(info?.intro)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-center text-bridge-muted/60 py-4 italic bg-white/20 rounded-xl border border-white/5">
                — 点击上方{isSimple ? "专业列表" : "专业气泡"}，探索专业详细解读及本科专业目录 —
              </p>
            )}

            {/* 统一说明：原三级卡片内重复套话，集中放在本部分末尾一次展示 */}
            <div className="mt-4 p-3 rounded-lg border border-white/10 bg-white/20 text-sm text-bridge-muted leading-relaxed text-justify">
              不同高校的培养方案与课程侧重可能存在差异，建议结合当年招生简章与院系介绍进一步了解。
            </div>

            {/* Simple Catalog Footer */}
            {isSimple && catalogReference && (
              <div className="mt-4 p-3 rounded-lg border border-white/10 bg-white/20 text-sm text-bridge-muted leading-relaxed">
                <div className="font-semibold">{catalogReference.label}</div>
                {catalogReference.links.length > 0 && (
                  <ul className="mt-1.5 pl-4 list-disc space-y-1">
                    {catalogReference.links.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-bridge-blue hover:underline break-all"
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Pro Upsell Card — simple edition only */}
        {isSimple && (
          <div className="glass-panel text-center p-6 mb-4">
            <button
              onClick={() => setShowProOverlay(true)}
              className="w-full md:w-auto px-6 py-2.5 text-sm font-bold text-white rounded-lg shadow-md bg-bridge-blue hover:bg-bridge-blue-dark transition-colors cursor-pointer border-none"
            >
              数理素质检测【专业版】
            </button>
            <p className="mt-3 text-sm text-bridge-muted leading-relaxed text-justify">
              专业版提供 14 维全面数理素养评估，从四个方向（兴趣、价值、习惯、能力）综合匹配所有理工科专业，给孩子最全面的专业推荐。
            </p>
          </div>
        )}

        {/* 五、测验总评 — AI 生成总评 (专业版) */}
        {!isSimple && userName && (
          <QuizSummarySection
            userName={userName}
            scores={scores}
            matches={matches}
            valueTiers={valueTiers}
            wheelData={wheelData}
            onSummaryReady={handleSummaryReady}
          />
        )}

        {/* Action Buttons Panel matching .quiz-footer in GitHub */}
        <section className="glass-panel p-4 md:p-5 flex flex-wrap gap-3 items-center justify-center">
          <button
            onClick={handlePdfExport}
            disabled={isExporting}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm text-white transition-colors cursor-pointer border-none shadow-md ${
              isExporting
                ? "bg-slate-500 cursor-not-allowed"
                : "bg-bridge-blue hover:bg-bridge-blue-dark"
            }`}
          >
            {isExporting ? "正在导出结果..." : "导出测验结果"}
          </button>

          <button
            onClick={onRetry}
            className="bg-white/80 hover:bg-white text-bridge-blue border border-bridge-blue/35 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
          >
            重新测验
          </button>

          {returnTo && (
            <a
              href={returnTo}
              className="bg-bridge-gold hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors cursor-pointer no-underline inline-flex items-center"
            >
              返回咨询流程 →
            </a>
          )}

          {onBackToQuiz && (
            <button
              onClick={onBackToQuiz}
              className="bg-white/80 hover:bg-white text-bridge-blue border border-bridge-blue/35 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
            >
              返回修改作答
            </button>
          )}

          {isSimple && (
            <button
              onClick={() => setShowProOverlay(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer shadow-md border-none"
            >
              开通专业版
            </button>
          )}
        </section>
      </div>

      {/* Pro Overlay modal for Simple Edition */}
      {showProOverlay && (
        <div
          className="fixed inset-0 z-50 bg-[#0a0f18]/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowProOverlay(false)}
              className="absolute top-4 right-4 text-bridge-muted hover:text-white text-xl cursor-pointer bg-transparent border-none"
            >
              &times;
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.jpg" alt="千殊教育" className="h-10 mx-auto mb-3 object-contain rounded" />
            <h4 className="text-xl font-bold text-bridge-blue font-sans">
              开通「<BrandText>桥梁计划</BrandText>」数理测评专业版
            </h4>
            <p className="text-sm text-bridge-muted leading-relaxed mt-2 text-justify">
              本测验由千殊硕博团队深耕打造。解锁专业版后，您将获得包含：兴趣自评雷达图、理想与现实价值档位报告、14维雷达素质图谱、三维能力素质关联网络模型、全部17个理工方向的四因子匹配度排名及对应的三级专业培养方案与招生目录清单。
            </p>
            <div className="my-5 p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-bridge-muted block mb-1">专业版激活服务咨询</span>
              <strong className="text-base text-bridge-gold">
                请联系「<BrandText>桥梁计划</BrandText>」老师获取激活码
              </strong>
            </div>
            <div className="flex justify-center gap-3">
              <Button href="/programs" variant="primary" onClick={() => setShowProOverlay(false)}>
                去查看套餐详情
              </Button>
              <Button variant="ghost" onClick={() => setShowProOverlay(false)}>
                返回结果
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
