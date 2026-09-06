/**
 * 引导员昵称本地存储（对齐咨询流程表 bridge_flow_guides_v1）
 */

export const GUIDES_KEY = "bridge_flow_guides_v1";

function loadGuides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(GUIDES_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function getGuideName(teamCode: string): string {
  const tc = String(teamCode || "").trim();
  if (!tc) return "";
  return loadGuides()[tc] || "";
}

export function setGuideName(teamCode: string, name: string): void {
  const tc = String(teamCode || "").trim();
  if (!tc || typeof window === "undefined") return;
  const guides = loadGuides();
  const n = String(name || "").trim().slice(0, 20);
  if (n) guides[tc] = n;
  else delete guides[tc];
  localStorage.setItem(GUIDES_KEY, JSON.stringify(guides));
}
