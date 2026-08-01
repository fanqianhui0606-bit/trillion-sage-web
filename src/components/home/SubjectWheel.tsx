"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { WheelData, CompetencyVector, Level2Major } from "@/lib/types";

// 一级学科固定顺序与配色（与 wheel-data.json level1 名称一致）
const L1_ORDER = ["数学", "物理", "化学", "生物", "计算机", "工程"] as const;

const L1_PALETTE: Record<string, { rgb: string }> = {
  数学: { rgb: "46, 117, 182" },
  物理: { rgb: "107, 33, 168" },
  化学: { rgb: "22, 163, 74" },
  生物: { rgb: "220, 38, 38" },
  计算机: { rgb: "202, 138, 4" },
  工程: { rgb: "249, 115, 22" },
};

const DEFAULT_TITLE = "数理学科";
const DEFAULT_INTRO =
  "点击内环一级学科，外环即展示与其关联的二级专业大类；再点击二级专业，可查看官方介绍并在 3D 模型中联动其数理素质画像。";

// 辅助函数：角度转弧度，且减去 90 度使 0 度在圆正上方
function degToRad(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

// 弧度绘制路径公式
function getSectorPath(cx: number, cy: number, rIn: number, rOut: number, startAngle: number, endAngle: number) {
  const sRad = degToRad(startAngle);
  const eRad = degToRad(endAngle);

  const x1_in = cx + rIn * Math.cos(sRad);
  const y1_in = cy + rIn * Math.sin(sRad);
  const x2_in = cx + rIn * Math.cos(eRad);
  const y2_in = cy + rIn * Math.sin(eRad);

  const x1_out = cx + rOut * Math.cos(sRad);
  const y1_out = cy + rOut * Math.sin(sRad);
  const x2_out = cx + rOut * Math.cos(eRad);
  const y2_out = cy + rOut * Math.sin(eRad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `
    M ${x1_out} ${y1_out}
    A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out}
    L ${x2_in} ${y2_in}
    A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x1_in} ${y1_in}
    Z
  `;
}

interface SubjectWheelProps {
  onHoverMajor: (profile: CompetencyVector | null, title?: string, intro?: string) => void;
}

export default function SubjectWheel({ onHoverMajor }: SubjectWheelProps) {
  const [wheelData, setWheelData] = useState<WheelData | null>(null);
  const [activeL1, setActiveL1] = useState<string>("数学");
  const [activeL2Id, setActiveL2Id] = useState<string | null>(null);
  const [hoveredL2Id, setHoveredL2Id] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/wheel-data.json")
      .then((r) => r.json())
      .then(setWheelData)
      .catch((e) => console.error("学科轮盘载入数据失败", e));
  }, []);

  // 当前一级学科下辖的二级专业（参考设计：外环随一级学科过滤，体现 1-2 级联系）
  const childL2s = useMemo<Level2Major[]>(() => {
    if (!wheelData) return [];
    return wheelData.level2.filter((l2) => (l2.parents || []).includes(activeL1));
  }, [wheelData, activeL1]);

  const findL2 = useCallback(
    (id: string | null) => (id ? wheelData?.level2.find((l2) => l2.id === id) ?? null : null),
    [wheelData]
  );

  // 将选中项（悬停优先于点击选中，选中优先于一级学科）应用到 3D 模型
  const emitSelection = useCallback(
    (l2: Level2Major | null, l1Name: string) => {
      if (l2) {
        onHoverMajor(l2.profile, `${l1Name} / ${l2.name}`, l2.officialIntro);
        return;
      }
      const l1 = wheelData?.level1.find((x) => x.name === l1Name);
      if (l1?.profile) {
        onHoverMajor(l1.profile, `${l1Name}（一级学科画像）`);
      }
    },
    [onHoverMajor, wheelData]
  );

  // 数据加载完成后应用默认一级学科画像（参考设计初始态）
  useEffect(() => {
    if (wheelData) emitSelection(null, activeL1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheelData]);

  const handleL1Click = (name: string) => {
    setActiveL1(name);
    setActiveL2Id(null);
    setHoveredL2Id(null);
    emitSelection(null, name);
  };

  const handleL2Click = (l2: Level2Major) => {
    const next = activeL2Id === l2.id ? null : l2.id;
    setActiveL2Id(next);
    emitSelection(next ? l2 : null, activeL1);
  };

  const handleL2Hover = (l2: Level2Major | null) => {
    setHoveredL2Id(l2?.id ?? null);
    // 悬停临时预览；移开后回落到已点击选中的项（或一级学科画像）
    emitSelection(l2 ?? findL2(activeL2Id), activeL1);
  };

  // 展示项：悬停优先，其次点击选中，最后一级学科
  const displayL2 = findL2(hoveredL2Id) ?? findL2(activeL2Id);
  const displayTitle = displayL2 ? displayL2.name : wheelData ? `${activeL1} · 一级学科` : DEFAULT_TITLE;
  const displayIntro = displayL2?.officialIntro
    ?? (wheelData
      ? `已选中一级学科「${activeL1}」，其关联 ${childL2s.length} 个二级专业大类显示于外环。${DEFAULT_INTRO}`
      : DEFAULT_INTRO);

  // 高亮与当前展示二级专业关联的全部一级学科（展示 2 级 → 1 级联系）
  const highlightedParents = new Set(displayL2?.parents ?? []);

  const cx = 200;
  const cy = 200;
  const activeRgb = L1_PALETTE[activeL1]?.rgb ?? "46, 117, 182";

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full select-none">
      {/* SVG Wheel Wrapper */}
      <div className="relative w-full max-w-[380px] aspect-square rounded-full shadow-glass border border-white/25 bg-white/5 backdrop-blur-md p-2 flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* 1. 内环 一级学科 (r = 55 -> 100)，可点击 */}
          {L1_ORDER.map((name, i) => {
            const start = i * 60;
            const end = start + 60;
            const rgb = L1_PALETTE[name].rgb;
            const isActive = activeL1 === name;
            const isParentOfDisplay = highlightedParents.has(name);
            const pathD = getSectorPath(cx, cy, 55, 100, start, end);
            const mid = (start + end) / 2;
            const textR = 77.5;
            const tx = cx + textR * Math.cos(degToRad(mid));
            const ty = cy + textR * Math.sin(degToRad(mid));

            const fill = isActive
              ? `rgba(${rgb}, 0.55)`
              : isParentOfDisplay
                ? `rgba(${rgb}, 0.35)`
                : `rgba(${rgb}, 0.08)`;

            return (
              <g key={name} onClick={() => handleL1Click(name)} className="cursor-pointer">
                <path
                  d={pathD}
                  fill={fill}
                  stroke={isActive ? "#C5A059" : isParentOfDisplay ? "rgba(197,160,89,0.7)" : "rgba(255,255,255,0.4)"}
                  strokeWidth={isActive ? 2 : isParentOfDisplay ? 1.5 : 1}
                  className="transition-all duration-300"
                  style={{
                    filter: isActive ? `drop-shadow(0 0 6px rgba(${rgb}, 0.55))` : "none",
                  }}
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={isActive || isParentOfDisplay ? "#ffffff" : "#C5A059"}
                  className="text-xs font-bold pointer-events-none select-none tracking-wider transition-colors duration-300"
                  transform={`rotate(${mid}, ${tx}, ${ty})`}
                >
                  {name}
                </text>
              </g>
            );
          })}

          {/* 2. 外环 当前一级学科关联的二级专业 (r = 105 -> 165)，可点击 */}
          {childL2s.map((l2, i) => {
            const n = childL2s.length;
            const start = (360 / n) * i;
            const end = (360 / n) * (i + 1);
            const isSelected = activeL2Id === l2.id;
            const isHovered = hoveredL2Id === l2.id;
            const lit = isSelected || isHovered;
            const pathD = getSectorPath(cx, cy, 105, 165, start, end);

            const mid = (start + end) / 2;
            const textR = 135;
            const tx = cx + textR * Math.cos(degToRad(mid));
            const ty = cy + textR * Math.sin(degToRad(mid));
            // 文字如果是朝下的，旋转 180 度使其正立 (90 - 270度之间)
            const rotateAngle = mid > 90 && mid < 270 ? mid + 180 : mid;
            // 名称越长字号越小，保证长专业名不溢出扇区
            const fontSize = Math.max(7.5, Math.min(10.5, 62 / l2.name.length));

            return (
              <g
                key={l2.id}
                onClick={() => handleL2Click(l2)}
                onMouseEnter={() => handleL2Hover(l2)}
                onMouseLeave={() => handleL2Hover(null)}
                className="cursor-pointer"
              >
                <path
                  d={pathD}
                  fill={lit ? `rgba(${activeRgb}, ${isSelected ? 0.9 : 0.75})` : `rgba(${activeRgb}, 0.15)`}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={isSelected ? 1.8 : 1.2}
                  className="transition-all duration-300 ease-out"
                  style={{
                    filter: lit ? `drop-shadow(0 0 6px rgba(${activeRgb}, 0.45))` : "none",
                  }}
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={lit ? "#ffffff" : "#2E75B6"}
                  fontSize={fontSize}
                  className="font-semibold pointer-events-none tracking-tight transition-colors duration-300"
                  transform={`rotate(${rotateAngle}, ${tx}, ${ty})`}
                >
                  {l2.name}
                </text>
              </g>
            );
          })}

          {/* 3. 中心圆指示区 (r = 50) */}
          <circle
            cx={cx}
            cy={cy}
            r="50"
            fill="rgba(10, 15, 24, 0.85)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
          />

          <text
            x={cx}
            y={displayL2 && displayL2.name.length > 5 ? cy - 4 : cy + 4}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#ffffff"
            fontSize={displayL2 ? 11 : 12}
            className="font-bold pointer-events-none"
          >
            {displayL2 && displayL2.name.length > 5 ? (
              <>
                <tspan x={cx} dy="0">{displayL2.name.slice(0, 5)}</tspan>
                <tspan x={cx} dy="13">{displayL2.name.slice(5)}</tspan>
              </>
            ) : (
              displayTitle.length > 8 ? activeL1 : displayTitle
            )}
          </text>
        </svg>
      </div>

      {/* Description Panel */}
      <div className="mt-6 w-full max-w-[380px] min-h-[110px] p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300">
        <h4 className="text-sm font-bold text-bridge-gold mb-1">{displayTitle}</h4>
        <p className="text-xs text-bridge-muted leading-relaxed">{displayIntro}</p>
        {displayL2 && (
          <p className="mt-1.5 text-[10px] text-bridge-muted/80">
            关联一级学科：{(displayL2.parents || []).join("、") || "—"}（内环已同步高亮）
          </p>
        )}
      </div>
    </div>
  );
}
