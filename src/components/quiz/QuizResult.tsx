"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import Button from "@/components/shared/Button";
import ScoreBarChart from "@/components/quiz/ScoreBarChart";
import { FULL_DIMENSION_ORDER } from "@/lib/constants";
import type { UserScores, MajorMatchResult, GraphData, CatalogReference, WheelData } from "@/lib/types";

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
      <h3 className="text-base md:text-[1.05rem] font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-serif">
        二、价值导向
      </h3>
      <p className="text-xs text-bridge-muted leading-relaxed mb-4 text-justify">
        价值导向部分显示你关于理想/抱负与实际/利益方向的考量比较。按照你对两个方向不同程度的侧重，共分为 5 档。
      </p>

      <div className="value-orient-wrap mb-4">
        <div className="h-3.5 rounded-full overflow-hidden bg-gradient-to-r from-green-500 via-yellow-400 to-orange-500 flex shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <div className="h-full bg-green-500/35 border-r-2 border-white/85" style={{ width: `${idealPct}%` }} />
          <div className="h-full bg-orange-500/35" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5 text-xs">
          <span className="text-green-700 font-semibold">理想/抱负 {idealPct}%</span>
          <span className="text-orange-700 font-semibold text-right">实际/利益 {pct}%</span>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-2">
        价值导向第 <strong className="text-slate-800">{scores.valueTier}</strong> 档 / 共 5 档
      </div>
      <strong className="block mb-1 text-slate-800 text-sm">{label}</strong>
      <div className="text-xs text-slate-600 leading-relaxed text-justify">
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
  const [dimensions, setDimensions] = useState({ width: 500, height: 420 });


  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: Math.max(containerRef.current.clientWidth, 320),
          height: 420,
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
    const size = 11 + t * 14; // Font sizes 11px to 25px

    // Enhanced high-contrast bright text color palette (Problem 5 & 10)
    const color = ["#ffffff", "#e2e8f0", "#93c5fd", "#60a5fa", "#3b82f6"][
      Math.min(4, Math.floor((1 - t) * 4.99))
    ] || "#ffffff";

    const isActive = activeMajorId === item.majorId;

    return (
      <button
        key={item.majorId}
        onClick={() => onSelectMajor(item.majorId)}
        className={`absolute select-none transition-all duration-300 font-sans cursor-pointer whitespace-nowrap px-3 py-1 rounded-full border border-transparent shadow-none bg-transparent
          ${isActive 
            ? 'bg-bridge-blue/35 text-white font-extrabold z-10 border-bridge-blue shadow-[0_0_15px_rgba(46,117,182,0.5)] scale-110 ring-2 ring-bridge-blue/40' 
            : 'hover:scale-[1.08] hover:bg-slate-800/50 hover:text-white hover:border-white/10 hover:shadow-md'
          }
        `}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%)',
          fontSize: `${size}px`,
          fontWeight: t > 0.4 ? 700 : 600,
          color: isActive ? '#ffffff' : color,
        }}
        title={`${item.majorId} · 匹配度 ${(item.score * 100).toFixed(2)}%`}
      >
        {item.majorName}
        <span className="ml-1 text-[0.8em] font-semibold font-mono opacity-85 text-bridge-gold">
          {(item.score * 100).toFixed(2)}%
        </span>
      </button>
    );
  });

  return (
    <div
      ref={containerRef}
      id="floatStageAllMatch"
      className="relative min-h-[420px] w-full border border-white/10 rounded-2xl overflow-hidden bg-slate-950/40 shadow-inner flex items-center justify-center"
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
    font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif;
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
    font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif;
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
`;

// ============================================================
// Main Component
// ============================================================

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
  onRetry: () => void;
  onBackToQuiz?: () => void;
}) {
  const [activeMajorId, setActiveMajorId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showProOverlay, setShowProOverlay] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Loaded metadata
  const [valueTiers, setValueTiers] = useState<ValueOrientationTiers | null>(null);
  const [wheelData, setWheelData] = useState<WheelData | null>(null);
  const [majorsIntro, setMajorsIntro] = useState<MajorsIntroMap | null>(null);

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

        return `
          <div class="pdf-page-unit pdf-block" data-section="objective">
            <h2>${esc(title)}</h2>
            <p class="pdf-intro">${esc(intro)}</p>
            ${rows}
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
      const tail = pick(".pdf-tail");

      const pageGroups = !isSimple
        ? [
            [cover, preface, interest, value].filter(Boolean),
            [objective].filter(Boolean),
            [match, tail].filter(Boolean),
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

      host.remove();
    } catch (err) {
      console.error("PDF export failed", err);
      alert("PDF 导出失败，请重试。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Brand Header — Aligned with .bridge-header in GitHub full-flow.html */}
        <header className="text-center pb-6 text-bridge-text">
          <p className="text-[0.72rem] text-bridge-muted tracking-wider mb-0.5">— 千殊教育 TrillionSage —</p>
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
              <h1 className="text-2xl md:text-3xl font-bold text-bridge-blue tracking-wide">桥梁计划</h1>
              <div className="flex gap-4 mt-2 text-xs text-bridge-muted justify-center md:justify-start">
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
          <p className="text-[0.82rem] italic text-bridge-text mt-4">—— 响应国家号召，培养未来高科技人才 ——</p>
          <hr className="my-5 max-w-xl mx-auto h-[1px] bg-white/90 border-none" />
        </header>

        {/* Outer panel matching #result.panel in GitHub */}
        <section id="result" className="glass-panel p-4 md:p-6 mb-4">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-bridge-blue text-center tracking-wide font-serif">
              测验结果
            </h2>
          </div>

          {/* Section 1: Interest Radar Chart — Pro version only */}
          {!isSimple && scores.subjectInterest && (
            <div className="glass-panel p-4 md:p-5 mb-4">
              <h3 className="text-base md:text-[1.05rem] font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-serif">
                一、兴趣导向
              </h3>
              <p className="text-xs text-bridge-muted leading-relaxed mb-4 text-justify">
                兴趣导向部分来自你在数学、物理、化学、生物、计算机五门学科上的兴趣自评。雷达图帮助你看清此刻更被哪些学科吸引。
              </p>
              <InterestRadarChart scores={scores.subjectInterest} />
            </div>
          )}

          {/* Section 2: Value Orientation — Pro version only */}
          {!isSimple && <ValueOrientationBar scores={scores.subjective} tierData={valueTiers} />}

          {/* Section 3: Objective Competency Scores */}
          <div className="glass-panel p-4 md:p-5 mb-4">
            <h3 className="text-base md:text-[1.05rem] font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-serif">
              {isSimple ? "一、数理素质" : "三、数理素质"}
            </h3>
            <p className="text-xs text-bridge-muted leading-relaxed mb-4 text-justify">
              {isSimple 
                ? "数理素质部分从 14 维数理素质出发对你从“思维习惯”和“能力程度”两方面综合检验后的结果进行呈现。14维数理素质由“桥梁计划”学长团从所有数理工学科的学习和实践中需要的基本素养中提炼而来，按照自低至高分为4层。体验版从中选取了核心 8 项数理素质呈现，未纳入的 6 维可在专业版测验中查看。"
                : "数理素质部分从 14 维数理素质出发对你从“思维习惯”和“素质能力”两方面综合检验后的结果进行呈现。14维数理素质由“桥梁计划”学长团从所有数理工学科的学习和实践中需要的基本素养中提炼而来，按照自低至高分为4层。"}
            </p>

            {isSimple && (
              <div className="mb-4 p-3 rounded-lg bg-bridge-blue/5 border border-bridge-blue/20 text-xs text-bridge-muted leading-relaxed">
                当前为 <strong>体验版 · 8 维</strong> 测验结果；记忆、整理、联想、好奇、自学、构建共 6 维未纳入本版测验。
              </div>
            )}

            <ScoreBarChart
              scores={scores.objective}
              displayDimensions={displayDims}
              lockedDimensions={lockedDimensions}
              lockedPlaceholder="专业版测验中查看"
            />

            {/* 3D guide description */}
            <div className="mt-6 p-3 rounded-lg border border-white/95 bg-white/30 text-xs text-bridge-text leading-relaxed">
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
            <h3 className="text-base md:text-[1.05rem] font-bold text-bridge-blue border-b-2 border-bridge-blue/25 pb-2 mb-3 font-serif">
              {isSimple ? "二、推荐专业" : "四、专业匹配"}
            </h3>

            <p className="text-xs text-bridge-muted leading-relaxed mb-4 text-justify">
              {isSimple 
                ? "该部分依据 8 维数理素质与全部 17 个理工专业画像计算匹配程度，展示以下 Top5 的专业，点击可查看介绍与三级专业列表。结果仅供参考，不代表唯一正确答案。"
                : "专业匹配部分参考最新教育部本科专业目录，从价值导向、兴趣导向、思维习惯与素质能力四方向全面与全部理工专业画像比对，显示你对于这些专业的大学学习、工作实践中的综合匹配程度。匹配程度越高，表示与当前画像越接近。结果仅供参考，不代表唯一正确答案。"}
            </p>

            <p className="text-[0.78rem] text-slate-500 leading-relaxed mb-3">
              {isSimple
                ? "Top5 二级专业 · 仅依据数理素质匹配"
                : "综合匹配 = 价值导向×1 + 兴趣导向×2 + 思维习惯×1 + 素质能力×4（各因子 0–1 归一后加权；对照旧算法见 models/match-recommend/匹配算法说明.md）。"}
            </p>

            <p className="text-xs font-bold text-bridge-blue mb-2.5">
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
              <div className="mt-4 p-4 rounded-xl border border-white/95 bg-white/35 shadow-sm text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900/5 pb-2 mb-2 gap-1.5">
                  <h4 className="text-sm font-bold text-bridge-blue font-serif">
                    {activeMajorWithL3.majorName}（{activeMajorWithL3.majorId}）
                  </h4>
                  <span className="text-orange-700 font-bold font-sans">
                    综合匹配 {(activeMajorWithL3.score * 100).toFixed(2)}%
                  </span>
                </div>
                
                <p className="text-xs text-bridge-muted leading-relaxed text-justify mb-3 whitespace-pre-line">
                  {activeMajorWithL3.officialIntro || "暂无该二级专业大类介绍。"}
                  {"\n"}
                  <span className="text-[10px] text-slate-500 font-sans block mt-1.5">
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
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">各因子匹配度：</span>
                    <span className="text-[11px] text-slate-600 font-sans">
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
                    <h5 className="text-[11px] font-bold text-bridge-blue mb-2 uppercase tracking-wider">下设本科专业名单</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {activeMajorWithL3.level3.map((l3) => {
                        const info = majorsIntro?.[l3.code];
                        const title = info?.officialName || l3.name;
                        const degree = info?.degreeTypes || "—";
                        return (
                          <div key={l3.code} className="p-3 rounded-lg border border-white/95 bg-white/30 hover:bg-white/40 transition-colors text-xs">
                            <div className="flex justify-between items-start mb-1 gap-1">
                              <span className="font-bold text-slate-800">{title}</span>
                              <span className="font-mono px-1.5 py-0.5 rounded bg-bridge-blue/10 text-bridge-blue text-[10px] flex-shrink-0">{l3.code}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mb-1">学位门类：{degree}</span>
                            {info?.intro && (
                              <p className="text-[10.5px] text-slate-600 leading-relaxed text-justify mt-1.5 pt-1.5 border-t border-slate-900/5">
                                {info.intro}
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
              <p className="text-xs text-center text-bridge-muted/60 py-4 italic bg-white/20 rounded-xl border border-white/5">
                — 点击上方{isSimple ? "专业列表" : "专业气泡"}，探索专业详细解读及本科专业目录 —
              </p>
            )}

            {/* Simple Catalog Footer */}
            {isSimple && catalogReference && (
              <div className="mt-4 p-3 rounded-lg border border-white/10 bg-white/20 text-xs text-bridge-muted leading-relaxed">
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
            <p className="mt-3 text-xs text-bridge-muted leading-relaxed text-justify">
              专业版在体验版 <strong>8 维</strong> 测验基础上，提供 <strong>14 维全面</strong>数理素养评估（含记忆、整理、联想、好奇、自学、构建等），并支持查看<strong>全部理工科专业</strong>的匹配程度。
            </p>
          </div>
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
            <h4 className="text-lg font-bold text-bridge-blue font-serif">开通「桥梁计划」数理测评专业版</h4>
            <p className="text-xs text-bridge-muted leading-relaxed mt-2 text-justify">
              本测验由千殊硕博团队深耕打造。解锁专业版后，您将获得包含：兴趣自评雷达图、理想与现实价值档位报告、14维雷达素质图谱、三维能力素质关联网络模型、全部17个理工方向的四因子匹配度排名及对应的三级专业培养方案与招生目录清单。
            </p>
            <div className="my-5 p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-bridge-muted block mb-1">专业版激活服务咨询</span>
              <strong className="text-sm text-bridge-gold">请联系「桥梁计划」老师获取激活码</strong>
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
