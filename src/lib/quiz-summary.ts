/**
 * quiz-summary.ts
 * 专业版测验总评：结构化结果 → DeepSeek V4 Pro / Flash → 段落化总评
 * 移植自 _tmp_remote_quiz_repo/quiz/quiz-summary.js
 */

import type { MajorMatchResult } from "./types";

const SUBJECT_INTEREST_KEYS = ["数学", "物理", "化学", "生物", "信息技术", "工程力学", "经济管理"];

const FACTOR_KEYS = [
  { key: "value", field: "valueSim", label: "价值导向" },
  { key: "interest", field: "interestSim", label: "兴趣导向" },
  { key: "habits", field: "habitsSim", label: "思维习惯" },
  { key: "ability", field: "abilitySim", label: "素质能力" },
];

/** 按得分排序取优势 / 弱势维度 */
export function pickDimensionExtremes(
  objectiveUser: Record<string, number> | null | undefined,
  nodeById: Record<string, { id: string; title: string }>,
  count = 3
) {
  const rows = Object.entries(objectiveUser || {})
    .map(([id, raw]) => ({ id, score: Number(raw), title: nodeById?.[id]?.title || id }))
    .filter((x) => Number.isFinite(x.score));
  rows.sort((a, b) => b.score - a.score);
  return {
    strengths: rows.slice(0, count),
    weaknesses: [...rows].reverse().slice(0, count),
  };
}

/** 四因子加权贡献，返回前两因子名 */
export function dominantFactorLabels(item: MajorMatchResult, weights: Record<string, number> = {}) {
  const w = {
    value: Number(weights.value ?? 1),
    interest: Number(weights.interest ?? 2),
    habits: Number(weights.habits ?? 1),
    ability: Number(weights.ability ?? 4),
  };
  return FACTOR_KEYS.map((f) => ({
    label: f.label,
    contribution: Number(item[f.field as keyof MajorMatchResult] ?? 0) * (w as Record<string, number>)[f.key],
  }))
    .sort((a, b) => b.contribution - a.contribution)
    .filter((x) => x.contribution > 0)
    .slice(0, 2)
    .map((x) => x.label);
}

function fmtPct(score: number) {
  return `${(Number(score) * 100).toFixed(1)}%`;
}

/** 测验结果包结构（由 quiz-scoring.ts computeScores 返回） */
export interface QuizResultPack {
  objectiveUser: Record<string, number>;
  subjectInterest: Record<string, number>;
  ia: number; // interestAmbition
  pb: number; // practicalBenefit
  _rankedAll?: MajorMatchResult[];
  layerAverages?: { name: string; average: number | null }[];
}

/** 专业介绍数据结构 */
export interface MajorIntroData {
  majors: Record<string, { code: string; name: string; officialName?: string }>;
}

/** 测验总评输入结构 */
export interface SummaryInput {
  studentName: string;
  interest: {
    scores: Record<string, number>;
    topSubjects: { subject: string; score: number }[];
  };
  value: {
    tier: number;
    label: string;
    brief: string;
    idealPct: number;
    pracPct: number;
  } | null;
  objective: {
    strengths: { id: string; title: string; score: number }[];
    weaknesses: { id: string; title: string; score: number }[];
    layerAverages: { name: string; average: number }[];
  };
  topMajors: {
    rank: number;
    code: string;
    name: string;
    matchPct: string;
    dominantFactors: string[];
    l3Catalog: { code: string; name: string }[];
  }[];
  factorWeights: Record<string, number>;
}

/** 从测验结果包构建总评输入 */
export function buildSummaryInput(
  pack: QuizResultPack,
  graphNodes: { id: string; title: string }[],
  intros: MajorIntroData | null,
  factorWeights: Record<string, number>,
  valueTier: { tier: number; label: string; brief: string } | null,
  studentName: string
): SummaryInput {
  const nodeById = Object.fromEntries(graphNodes.map((n) => [n.id, n]));
  const { objectiveUser, subjectInterest, ia, pb } = pack;
  const { strengths, weaknesses } = pickDimensionExtremes(objectiveUser, nodeById, 3);

  const idealPct = ia + pb > 0 ? (100 * ia) / (ia + pb) : 50;
  const pracPct = ia + pb > 0 ? (100 * pb) / (ia + pb) : 50;

  return {
    studentName: studentName || "同学",
    interest: {
      scores: subjectInterest || {},
      topSubjects: SUBJECT_INTEREST_KEYS.map((s) => ({
        subject: s,
        score: Number(subjectInterest?.[s] ?? 0),
      }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score),
    },
    value: valueTier
      ? { tier: valueTier.tier, label: valueTier.label, brief: valueTier.brief, idealPct, pracPct }
      : null,
    objective: {
      strengths: strengths.map((x) => ({ id: x.id, title: x.title, score: x.score })),
      weaknesses: weaknesses.map((x) => ({ id: x.id, title: x.title, score: x.score })),
      layerAverages: (pack.layerAverages || [])
        .filter((l) => l.average != null)
        .map((l) => ({ name: l.name, average: Number(l.average.toFixed(2)) })),
    },
    topMajors: (pack._rankedAll || []).slice(0, 5).map((item, idx) => {
      return {
        rank: idx + 1,
        code: item.majorId,
        name: item.majorName,
        matchPct: fmtPct(item.score),
        dominantFactors: dominantFactorLabels(item, factorWeights),
        l3Catalog: [], // 简化版，暂不填充三级目录
      };
    }),
    factorWeights: factorWeights || {},
  };
}

/** 将结构化输入序列化为 LLM 用户消息 */
export function formatSummaryContextForPrompt(input: SummaryInput): string {
  const lines: string[] = [];

  if (input.studentName) {
    lines.push(`【学生姓名】${input.studentName}`);
  }

  if (input.interest?.topSubjects?.length) {
    lines.push("【兴趣导向】");
    lines.push(
      input.interest.topSubjects.map((x) => `${x.subject} ${x.score.toFixed(2)} 分`).join("；")
    );
  }

  if (input.value) {
    lines.push("【价值导向】");
    lines.push(
      `第 ${input.value.tier} 档：${input.value.label}；理想/抱负约 ${input.value.idealPct.toFixed(0)}%，实际/利益约 ${input.value.pracPct.toFixed(0)}%。`
    );
    if (input.value.brief) lines.push(`简评参考：${input.value.brief}`);
  }

  lines.push("【数理素质】");
  if (input.objective.strengths?.length) {
    lines.push(
      `优势项：${input.objective.strengths.map((x) => `${x.title}(${x.id}) ${x.score.toFixed(2)}/5`).join("、")}`
    );
  }
  if (input.objective.weaknesses?.length) {
    lines.push(
      `相对偏弱：${input.objective.weaknesses.map((x) => `${x.title}(${x.id}) ${x.score.toFixed(2)}/5`).join("、")}`
    );
  }
  if (input.objective.layerAverages?.length) {
    lines.push(
      `分层均分：${input.objective.layerAverages.map((l) => `${l.name} ${l.average.toFixed(2)}/5`).join("；")}`
    );
  }

  lines.push("【专业匹配 Top5】");
  for (const m of input.topMajors || []) {
    const l3 = (m.l3Catalog || []).map((x) => x.name).join("、") || "（暂无三级目录条目）";
    lines.push(
      `${m.rank}. ${m.name}（${m.code}）综合匹配 ${m.matchPct}；主要匹配因子：${(m.dominantFactors || []).join("、") || "—"}；教育部目录专业示例：${l3}`
    );
  }

  return lines.join("\n");
}

/** 规则兜底总评（API 不可用时） */
export function buildFallbackSummary(input: SummaryInput, config?: { consultCta?: string }): string {
  const cta =
    config?.consultCta ||
    "如需结合你的具体情况做更深入的志愿与路径规划，欢迎通过「桥梁计划」官方渠道联系我们的学长团队，获取一对一咨询支持。";
  const name = input.studentName || "同学";
  const paras: string[] = [];

  // 开头
  paras.push(`${name}，你好！以下是你的「桥梁计划」测验总评，请查收~`);

  // 第一段：兴趣 + 价值 + 素质总览
  const topSubjects = (input.interest?.topSubjects || []).slice(0, 3);
  const allSubjects = input.interest?.topSubjects || [];
  const lowSubjects = [...allSubjects].reverse().slice(0, 2).filter((s) => s.score < 2);

  let interestLine = "";
  if (topSubjects.length >= 2) {
    const highNames = topSubjects.map((x) => x.subject).join("、");
    interestLine = `我们发现你在兴趣上表现出对${highNames}学科更高的关注`;
    if (lowSubjects.length > 0) {
      const lowNames = lowSubjects.map((x) => x.subject).join("、");
      interestLine += `，而对${lowNames}更「无感」`;
    }
    interestLine += "，这与后续专业探索可以相互参照。";
  } else if (topSubjects.length === 1) {
    interestLine = `在兴趣上，你对${topSubjects[0].subject}学科表现出更高的关注，这与后续专业探索可以相互参照。`;
  } else {
    interestLine = "在学科兴趣上，你表现较为均衡，这与后续专业探索可以相互参照。";
  }

  const valueLine = input.value
    ? `价值导向上，你目前更接近第 ${input.value.tier} 档「${input.value.label}」，理想/抱负约占 ${input.value.idealPct.toFixed(0)}%，实际/利益约占 ${input.value.pracPct.toFixed(0)}%，说明你在抱负与现实考量之间有自己的平衡方式。`
    : "";

  const str = (input.objective?.strengths || []).map((x) => x.title).join("、");
  const weak = (input.objective?.weaknesses || []).map((x) => x.title).join("、");

  const layers = input.objective?.layerAverages || [];
  const layerText = layers.map((l) => `${l.name} ${l.average.toFixed(2)} 分`).join("，");

  const objLineParts: string[] = [];
  objLineParts.push(
    `同时，我们从思维习惯和素质能力两方面进行考察，发现你在${str || "若干维度"}上表现相对突出，而${weak || "部分维度"}仍有提升空间。`
  );
  objLineParts.push("希望你在未来的选择中能扬长避短，继续发挥你的优势。");
  if (layerText) objLineParts.push(`你的${layerText}。`);
  objLineParts.push(
    "通常而言，高级能力得分越高，专业学习得越快速；基础能力得分越高，专业学习得越扎实。这些结果来自你的自评与测验合成，供你了解自己的思维习惯与能力结构。"
  );

  paras.push(
    ["经测评，", interestLine, valueLine ? " " + valueLine : "", " ", ...objLineParts].join("")
  );

  // 第二段：Top5 专业方向
  const majorEntries = (input.topMajors || []).slice(0, 5);
  if (majorEntries.length > 0) {
    const majorLines: string[] = [];
    majorLines.push("结合四因子加权匹配，我们为你梳理了值得进一步了解的方向：");
    for (const m of majorEntries) {
      const l3Names =
        (m.l3Catalog || []).slice(0, 5).map((x) => x.name).join("、") || "相关本科专业";
      majorLines.push(
        `${m.rank}.「${m.name}」（${m.code}），综合匹配值 ${m.matchPct}，包括 ${l3Names}等专业；`
      );
    }

    const factorNotes: string[] = [];
    for (const m of majorEntries) {
      if (m.dominantFactors?.length > 0) {
        factorNotes.push(`「${m.name}」的${m.dominantFactors.join("和")}贡献较突出`);
      }
    }
    if (factorNotes.length > 0) {
      majorLines.push(`${factorNotes.slice(0, 2).join("，")}。以上排序仅供参考，不代表唯一正确答案。`);
    } else {
      majorLines.push("以上排序仅供参考，不代表唯一正确答案。");
    }

    paras.push(majorLines.join("\n"));
  }

  // 第三段：价值导向结合专业推荐
  const valueTier = input.value?.tier;
  let guidanceLine: string;
  if (valueTier === 1) {
    guidanceLine =
      "根据你的测评结果，我们建议你在选择专业时重点关注培养周期与学科深造的长期回报，同时也可以了解基础学科与交叉领域的前沿发展情况。";
  } else if (valueTier === 3 || valueTier === 4) {
    guidanceLine =
      "根据你的测评结果，我们建议你在以上感兴趣的专业中重点关注就业节奏与区域资源，了解所在城市或目标城市的产业布局，结合家庭与个人条件做出务实判断。";
  } else {
    guidanceLine =
      "根据你的测评结果，我们建议你在以上感兴趣的专业中既关注培养周期与学科发展的长期趋势，也了解就业节奏与区域资源的实际条件。";
  }
  guidanceLine += ` ${cta}`;
  paras.push(guidanceLine);

  // 第四段：免责申明
  paras.push(
    "但不论如何请记住，我们提供的仅为志愿与路径参考，真正做出选择并承担结果的始终是你本人。请结合自身意愿、学业基础与家庭条件，与家中长辈共同商讨，做出对人生负责的决定。"
  );

  // 第五段：鼓励结尾
  paras.push(
    `在科技引领时代发展的背景下，你的探索与尝试本身就值得肯定。${name}，作为你人生路上的一盏引路灯，我们感到由衷的高兴！愿你在未来的大学学习生涯与职业生涯中找到最合适自己成长的定位。\n\n「桥梁计划」全体学长真挚地祝福你保持好奇、踏实前行，在前行的路上找到属于自己的光亮^u^。`
  );

  return paras.join("\n\n");
}

/** 清理模型输出：去 Markdown 标题符号，保留段落 */
export function normalizeSummaryText(raw: string): string {
  return String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/^#+\s*/gm, "")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 总评正文 → 段落数组 */
export function formatSummaryParagraphs(text: string): string[] {
  return normalizeSummaryText(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}