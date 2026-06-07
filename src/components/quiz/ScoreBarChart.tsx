"use client";

import { DIMENSION_ORDER } from "@/lib/constants";
import type { CompetencyVector } from "@/lib/types";

const DIMENSIONS_MAP: Record<string, string> = {
  "操作": "动手操作能力",
  "好奇": "好奇心",
  "执行": "执行力",
  "抽象": "抽象概念理解",
  "整理": "整理归纳",
  "观察": "观察力",
  "记忆": "记忆力",
  "空间": "空间想象",
  "联想": "联想能力",
  "计算": "计算能力",
  "推导": "逻辑推导能力",
  "构建": "构建框架",
  "自主": "自主探索能力",
  "自学": "自学能力"
};

export default function ScoreBarChart({
  scores,
  displayDimensions,
  lockedDimensions = [],
  lockedPlaceholder = "专业版测验中查看",
}: {
  scores: CompetencyVector;
  displayDimensions?: readonly string[];
  lockedDimensions?: string[];
  lockedPlaceholder?: string;
}) {
  const maxScore = 5;
  const dims = displayDimensions ?? DIMENSION_ORDER;
  const lockedSet = new Set(lockedDimensions);

  return (
    <div className="w-full space-y-4 py-2">
      {dims.map((dim) => {
        const isLocked = lockedSet.has(dim);
        const val = isLocked ? 0 : (scores[dim] ?? 0);
        const pct = isLocked ? 0 : (val / maxScore) * 100;
        const fullName = DIMENSIONS_MAP[dim] || dim;

        return (
          <div key={dim} className="flex flex-col w-full">
            {/* Header info */}
            <div className="flex justify-between items-baseline mb-1">
              <span className={`font-bold font-serif text-sm ${isLocked ? "text-slate-400" : "text-slate-800"}`}>
                {fullName}
              </span>
              {isLocked ? (
                <span className="text-xs font-semibold text-slate-400">
                  {lockedPlaceholder}
                </span>
              ) : (
                <span className="text-xs font-semibold font-mono text-slate-500">
                  {val.toFixed(2)}/5
                </span>
              )}
            </div>

            {/* Horizontal progress bar */}
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out origin-left ${
                  isLocked ? "w-0" : "bg-gradient-to-r from-blue-400 to-[#2E75B6]"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
