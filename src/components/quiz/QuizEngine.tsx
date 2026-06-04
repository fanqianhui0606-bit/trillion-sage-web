"use client";

import { useState, useRef } from "react";
import Button from "@/components/shared/Button";
import GlassCard from "@/components/shared/GlassCard";
import QuizResult from "@/components/quiz/QuizResult";
import { useQuizState } from "@/hooks/useQuizState";

const PRO_CONTACT_TEXT = "请联系「桥梁计划」团队购买参与";

export default function QuizEngine({ edition }: { edition?: string }) {
  const { state, dispatch, getUnansweredIds } = useQuizState(edition);
  const [showValidation, setShowValidation] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const isSimple = (state.edition ?? "user") === "simple";

  // --- Cover phase ---
  if (state.phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-bridge-muted text-lg animate-pulse">加载中...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="text-center max-w-md">
          <p className="text-red-600 font-semibold">数据加载失败</p>
          <p className="text-bridge-muted text-sm mt-2">{state.error}</p>
        </GlassCard>
      </div>
    );
  }

  if (state.phase === "cover") {
    const questionCount = state.bank?.meta.objectiveQuestionCount ?? (isSimple ? 18 : 35);
    const dimCount = isSimple ? 8 : 14;
    const timeEstimate = isSimple ? "5 分钟" : "15 分钟";

    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <GlassCard className="max-w-2xl w-full text-center py-12 px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-bridge-blue mb-2">
            数理素质测评
            {isSimple && (
              <span className="inline-block ml-2 px-2 py-0.5 text-sm rounded-md bg-green-100/60 text-green-700 align-middle">
                体验版
              </span>
            )}
          </h1>
          <p className="text-bridge-muted leading-relaxed mb-2">
            {questionCount} 道题目 · 约 {timeEstimate}
          </p>
          {isSimple ? (
            <>
              <p className="text-bridge-muted text-sm leading-relaxed mb-2">
                由 <strong>985 理工硕博学长团</strong> 制作，涵盖 {dimCount} 项数理素质维度。
              </p>
              <p className="text-bridge-muted text-sm leading-relaxed mb-2">
                参考 <strong>2026 年教育部最新本科专业目录</strong>，为你推荐最匹配的理工专业方向。
              </p>
              <p className="text-bridge-muted text-xs leading-relaxed mb-8 text-gray-400">
                体验版推荐仅依据 8 维客观结果，仅供参考
              </p>
            </>
          ) : (
            <p className="text-bridge-muted text-sm leading-relaxed mb-8">
              涵盖 {dimCount} 项数理素质维度，完成后生成 3D 素质图景与专业推荐。
              请如实作答，答案无对错之分。
            </p>
          )}
          <Button variant="primary" onClick={() => dispatch({ type: "START_QUIZ" })}>
            开始测验
          </Button>
        </GlassCard>
      </div>
    );
  }

  // --- Answering phase ---
  if (state.phase === "answering" && state.bank) {
    const questions = state.bank.questions;
    const currentQ = questions[state.currentIndex];
    const progress = ((state.currentIndex + 1) / questions.length) * 100;

    const sectionLabel = (() => {
      if (!currentQ) return "";
      if (currentQ.section === "subjective") return "— 主观判断";
      if (isSimple) {
        return currentQ.objectiveTrack === "habits" ? "— 思维习惯（4 题）" : "— 能力自检（14 题）";
      }
      if (currentQ.objectiveTrack === "habits") return "— 思维习惯（15 题）";
      return "— 能力自检（15 题）";
    })();

    const handleSubmit = () => {
      const unanswered = getUnansweredIds();
      if (unanswered.length > 0) {
        setShowValidation(true);
        const firstUnanswered = questions.findIndex((q) => q.id === unanswered[0]);
        if (firstUnanswered >= 0) {
          dispatch({
            type: "RESTORE",
            saved: { currentIndex: firstUnanswered },
          } as Parameters<typeof dispatch>[0]);
        }
        setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        dispatch({ type: "SUBMIT" });
      }
    };

    const answer = state.answers[currentQ?.id ?? ""];

    return (
      <div ref={topRef} className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-bridge-muted mb-1">
              <span>
                第 {state.currentIndex + 1} / {questions.length} 题 {sectionLabel}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-bridge-blue rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Unanswered warning */}
          {showValidation && (
            <div className="mb-4 p-3 rounded-lg bg-red-100/80 text-red-700 text-sm text-center">
              还有未作答的题目，请完成所有题目后提交
            </div>
          )}

          {/* Question card */}
          {currentQ && (
            <GlassCard className="mb-6">
              <p className="text-xs text-bridge-blue font-semibold mb-1">
                {currentQ.type === "single"
                  ? "单选题"
                  : currentQ.type === "multi"
                  ? "多选题"
                  : "判断题"}
              </p>
              <h3 className="text-lg font-semibold text-bridge-text leading-relaxed mb-4">
                {currentQ.stem}
              </h3>

              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected =
                    Array.isArray(answer)
                      ? answer.includes(opt.id)
                      : answer === opt.id;

                  const handleChange = () => {
                    if (currentQ.type === "multi") {
                      const prev = Array.isArray(answer) ? answer : [];
                      const next = prev.includes(opt.id)
                        ? prev.filter((id) => id !== opt.id)
                        : [...prev, opt.id];
                      dispatch({ type: "SET_ANSWER", questionId: currentQ.id, answer: next });
                    } else {
                      dispatch({ type: "SET_ANSWER", questionId: currentQ.id, answer: opt.id });
                    }
                  };

                  return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-bridge-blue/10 border-bridge-blue"
                          : "bg-white/20 border-transparent hover:bg-white/40"
                      }`}
                    >
                      <input
                        type={currentQ.type === "multi" ? "checkbox" : "radio"}
                        name={`q-${currentQ.id}`}
                        checked={isSelected}
                        onChange={handleChange}
                        className="mt-0.5 accent-bridge-blue"
                      />
                      <span className="text-sm text-bridge-text">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "PREV_QUESTION" })}
              className={state.currentIndex === 0 ? "invisible" : ""}
            >
              上一题
            </Button>

            {state.currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => dispatch({ type: "NEXT_QUESTION" })}
              >
                下一题
              </Button>
            ) : (
              <Button variant="accent" onClick={handleSubmit}>
                提交结果
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Submitting phase ---
  if (state.phase === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-bridge-blue/30 border-t-bridge-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-bridge-muted">正在计算...</p>
        </div>
      </div>
    );
  }

  // --- Result phase ---
  if (state.phase === "result" && state.userScores && state.matches) {
    const lockedDims = isSimple
      ? state.bank?.meta.lockedDimensions ?? []
      : [];
    const fullDimOrder = isSimple
      ? state.bank?.meta.fullDimensionOrder ?? []
      : [];
    const catalogRef = isSimple
      ? state.bank?.meta.catalogReference
      : undefined;

    return (
      <QuizResult
        scores={state.userScores}
        matches={state.matches}
        isSimple={isSimple}
        lockedDimensions={lockedDims}
        fullDimensionOrder={fullDimOrder}
        catalogReference={catalogRef}
        contactText={PRO_CONTACT_TEXT}
        onRetry={() => dispatch({ type: "START_QUIZ" })}
      />
    );
  }

  return null;
}
