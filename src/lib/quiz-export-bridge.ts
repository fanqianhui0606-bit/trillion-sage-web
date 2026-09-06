/**
 * 测验结果 → 咨询流程导入桥接
 * 与本地「咨询流程表」`bridge_quiz_export_v1` / 「数理素质测验」导出格式对齐
 */

export const QUIZ_EXPORT_KEY = "bridge_quiz_export_v1";
export const QUIZ_SNAPSHOT_KEY = "quiz_flow_last_snapshot";

export interface QuizExportPayload {
  edition: "pro" | "simple";
  studentName?: string;
  /** 结果链接（本站可用本地路径或模拟 URL） */
  resultLink: string;
  top5: { id: string; name: string }[];
  generatedAt: string;
}

export interface QuizSnapshot {
  scores?: { objective?: Record<string, number> };
  matches?: { majorId: string; majorName: string; score: number }[];
}

/** 专业版测验提交或导出 PDF 后写入，供咨询流程一键导入 */
export function writeQuizExportForTracker(opts: {
  studentName?: string;
  matches: { majorId: string; majorName: string; score?: number }[];
  isPro?: boolean;
}): void {
  if (typeof window === "undefined") return;
  if (opts.isPro === false) return;
  try {
    const top5 = (opts.matches || [])
      .slice(0, 5)
      .map((m) => ({ id: m.majorId || "", name: m.majorName || "" }))
      .filter((m) => m.id || m.name);
    const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
    const payload: QuizExportPayload = {
      edition: "pro",
      studentName: opts.studentName,
      resultLink: `https://trillionsage.com/r/${token}`,
      top5,
      generatedAt: new Date().toISOString(),
    };
    localStorage.setItem(QUIZ_EXPORT_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function readQuizExport(): QuizExportPayload | null {
  try {
    const raw = localStorage.getItem(QUIZ_EXPORT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizExportPayload;
    if (!parsed?.top5?.length && !parsed?.resultLink) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readQuizSnapshot(): QuizSnapshot | null {
  try {
    const raw = localStorage.getItem(QUIZ_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizSnapshot;
    if (!parsed?.matches?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** 是否存在可供导入的专业版结果 */
export function hasImportableQuizResult(): boolean {
  return !!(readQuizExport()?.top5?.length || readQuizSnapshot()?.matches?.length);
}

/**
 * 由套餐 + 订单号生成专业版测验激活码。
 * 输出满足内测码格式 `BRIDGE-[A-Z]{3,16}`（纯大写字母），可直接通过测验激活校验。
 */
export function makeQuizCodeForOrder(packageId: string, orderNo: string): string {
  const digitMap = "ABCDEFGHIJ"; // 0-9 → A-J，保证纯字母
  const encode = (s: string) =>
    (s || "")
      .toUpperCase()
      .split("")
      .map((ch) => {
        if (/[A-Z]/.test(ch)) return ch;
        if (/[0-9]/.test(ch)) return digitMap[Number(ch)];
        return "";
      })
      .join("");
  const pkgLetters = (encode(packageId) || "QS").slice(0, 4);
  let body = (pkgLetters + encode(orderNo)).replace(/[^A-Z]/g, "");
  if (body.length < 3) body = (body + "QSXX").slice(0, 4);
  body = body.slice(0, 16);
  return `BRIDGE-${body}`;
}

export const QUIZ_RETURN_KEY = "quiz_return_to";
