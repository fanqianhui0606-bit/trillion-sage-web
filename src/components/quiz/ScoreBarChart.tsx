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
  const colCount = dims.length;

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="grid gap-1 items-end h-48 min-w-[650px]"
        style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
      >
        {dims.map((dim) => {
          const isLocked = lockedSet.has(dim);
          const val = isLocked ? 0 : (scores[dim] ?? 0);
          const pct = isLocked ? 0 : (val / maxScore) * 100;

          return (
            <div
              key={dim}
              className={`flex flex-col items-center gap-1 ${isLocked ? "opacity-60" : ""}`}
            >
              <span className="text-[10px] text-bridge-muted whitespace-nowrap">
                {isLocked ? lockedPlaceholder : val.toFixed(1)}
              </span>
              <div
                className={`w-full max-w-[28px] rounded-t-sm origin-bottom transition-all duration-700 ${
                  isLocked
                    ? "bg-gray-300 h-1"
                    : "bg-gradient-to-t from-bridge-blue to-bridge-blue-light animate-bar-grow"
                }`}
                style={{ height: isLocked ? "4px" : `${pct}%` }}
              />
              <span className="text-[10px] text-bridge-muted leading-tight text-center">
                {dim}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
