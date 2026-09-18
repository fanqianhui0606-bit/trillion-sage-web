/** 首页四大板块：锚点 → 板块 key */
export const HOME_SECTION_BY_ANCHOR: Record<string, string> = {
  values: "who",
  "values-content": "who",
  promise: "who",
  "quiz-teaser": "fit",
  "chat-teaser": "fit",
  consultation: "path",
  "programs-preview": "camp",
};

export const EXPAND_HOME_SECTION_EVENT = "expand-home-section";

export function requestExpandHomeSection(anchorId: string) {
  if (typeof window === "undefined") return;
  const id = anchorId.replace(/^#/, "");
  window.dispatchEvent(
    new CustomEvent(EXPAND_HOME_SECTION_EVENT, { detail: { anchorId: id } })
  );
}

/** 展开对应板块后平滑滚动到锚点 */
export function navigateHomeSection(anchorId: string) {
  const id = anchorId.replace(/^#/, "");
  requestExpandHomeSection(id);
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", `/#${id}`);
  }
  // 等待折叠内容挂载后再滚动
  window.setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 120);
}
