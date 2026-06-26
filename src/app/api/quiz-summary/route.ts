import { NextRequest, NextResponse } from "next/server";
import {
  buildSummaryInput,
  formatSummaryContextForPrompt,
  buildFallbackSummary,
  normalizeSummaryText,
} from "@/lib/quiz-summary";

/** DeepSeek API 调用（带超时） */
async function callChatApi(
  url: string,
  body: Record<string, unknown>,
  apiKey: string,
  timeoutMs: number
): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as { error?: { message?: string }; message?: string })?.error?.message
        || (data as { message?: string })?.message
        || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    const text = (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("模型返回内容为空");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

interface SummaryConfig {
  models: { primary: string; fallback: string };
  request: { maxTokens: number; temperature: number; timeoutMs: number };
  proxyUrl: string;
  consultCta?: string;
  inspectCompareBothModels?: boolean;
}

interface SummaryPrompt {
  systemPrompt: string;
  userPromptPrefix: string;
}

/** POST /api/quiz-summary */
export async function POST(req: NextRequest) {
  try {
    // 1. 读取配置与 prompt
    const [configRes, promptRes] = await Promise.all([
      fetch(new URL("/data/quiz-summary-config.json", req.url), { cache: "no-store" }),
      fetch(new URL("/data/quiz-summary-prompt.json", req.url), { cache: "no-store" }),
    ]);

    if (!configRes.ok || !promptRes.ok) {
      throw new Error("无法加载配置文件");
    }

    const config: SummaryConfig = await configRes.json();
    const promptDoc: SummaryPrompt = await promptRes.json();

    // 2. 解析请求体
    const body = await req.json();
    const {
      studentName,
      objectiveUser,
      subjectInterest,
      interestAmbition,
      practicalBenefit,
      valueTier,
      valueLabel,
      valueBrief,
      rankedMajors,
      factorWeights,
      graphNodes,
      compareBoth,
    } = body;

    // 3. 构建结构化输入
    const input = buildSummaryInput(
      {
        objectiveUser: objectiveUser || {},
        subjectInterest: subjectInterest || {},
        ia: interestAmbition || 0,
        pb: practicalBenefit || 0,
        _rankedAll: rankedMajors || [],
      },
      graphNodes || [],
      null, // intros 简化版不填充
      factorWeights || {},
      valueTier != null ? { tier: valueTier, label: valueLabel || "", brief: valueBrief || "" } : null,
      studentName || "同学"
    );

    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 4. 如果没有 API Key，直接返回 fallback
    if (!apiKey) {
      console.warn("[quiz-summary] DEEPSEEK_API_KEY 未配置，使用本地模板");
      const text = buildFallbackSummary(input, config);
      return NextResponse.json({
        summary: normalizeSummaryText(text),
        source: "fallback",
        sourceLabel: "本地规则模板",
      });
    }

    // 5. 调用 DeepSeek
    const userContent = (promptDoc.userPromptPrefix || "") + formatSummaryContextForPrompt(input);
    const baseBody = {
      messages: [
        { role: "system", content: promptDoc.systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: config.request.maxTokens || 1400,
      temperature: config.request.temperature || 0.65,
      stream: false,
    };

    const timeoutMs = config.request.timeoutMs || 25000;
    const proModel = config.models?.primary || "deepseek-v4-pro";
    const flashModel = config.models?.fallback || "deepseek-v4-flash";

    // 6. 检验模式下并行调用两版
    if (compareBoth || config.inspectCompareBothModels) {
      const [proSettled, flashSettled] = await Promise.allSettled([
        callChatApi(config.proxyUrl, { ...baseBody, model: proModel }, apiKey, timeoutMs),
        callChatApi(config.proxyUrl, { ...baseBody, model: flashModel }, apiKey, timeoutMs),
      ]);

      const variants = {
        pro: proSettled.status === "fulfilled"
          ? normalizeSummaryText(proSettled.value)
          : "",
        flash: flashSettled.status === "fulfilled"
          ? normalizeSummaryText(flashSettled.value)
          : "",
      };

      // 优先使用 Pro
      const activeText = variants.pro || variants.flash || normalizeSummaryText(buildFallbackSummary(input, config));
      const activeSource = variants.pro ? "deepseek-v4-pro" : variants.flash ? "deepseek-v4-flash" : "fallback";

      return NextResponse.json({
        summary: activeText,
        source: activeSource,
        sourceLabel: activeSource === "deepseek-v4-pro" ? "DeepSeek V4 Pro"
          : activeSource === "deepseek-v4-flash" ? "DeepSeek V4 Flash"
          : "本地规则模板",
        compare: { pro: variants.pro, flash: variants.flash },
      });
    }

    // 7. 常规模式：优先 Pro，失败则 Flash，再失败则 fallback
    for (const model of [proModel, flashModel]) {
      try {
        const text = await callChatApi(config.proxyUrl, { ...baseBody, model }, apiKey, timeoutMs);
        return NextResponse.json({
          summary: normalizeSummaryText(text),
          source: model.includes("flash") ? "deepseek-v4-flash" : "deepseek-v4-pro",
          sourceLabel: model.includes("flash") ? "DeepSeek V4 Flash" : "DeepSeek V4 Pro",
        });
      } catch (e) {
        console.warn(`[quiz-summary] ${model} 调用失败:`, e);
        // 继续尝试下一个
      }
    }

    // 8. 两版均失败，使用 fallback
    const fallbackText = buildFallbackSummary(input, config);
    return NextResponse.json({
      summary: normalizeSummaryText(fallbackText),
      source: "fallback",
      sourceLabel: "本地规则模板",
    });
  } catch (error) {
    console.error("[quiz-summary] 错误:", error);
    return NextResponse.json(
      { error: "总评生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}