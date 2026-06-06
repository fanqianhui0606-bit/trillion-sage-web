"use client";

import { DIMENSION_ORDER } from "@/lib/constants";
import type { CompetencyVector } from "@/lib/types";

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

        return (
          <div key={dim} className="flex flex-col w-full">
            {/* Header info */}
            <div className="flex justify-between items-baseline mb-1">
              <span className={`font-bold font-serif text-sm ${isLocked ? "text-slate-400" : "text-slate-800"}`}>
                {dim}
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
