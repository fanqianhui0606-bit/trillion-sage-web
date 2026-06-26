"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/shared/Button";
import GlassCard from "@/components/shared/GlassCard";
import QuizResult from "@/components/quiz/QuizResult";
import { useQuizState } from "@/hooks/useQuizState";
import { validateActivationCode } from "@/lib/cosine-similarity";

const PRO_CONTACT_TEXT = "请联系「桥梁计划」团队购买参与";

export default function QuizEngine({ edition }: { edition?: string }) {
  const { state, dispatch, getUnansweredIds } = useQuizState(edition);
  const [showValidation, setShowValidation] = useState(false);
  const [userName, setUserName] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  const isSimple = (state.edition ?? "user") === "simple";

  // Firewall: Block Ctrl+S / Cmd+S (Problem 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        alert("系统已启用安全防火墙，禁止保存网页代码。");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    const questionCount = state.bank?.questions.length ?? (isSimple ? 18 : 42);
    const dimCount = isSimple ? 8 : 14;
    const timeEstimate = isSimple ? "5 分钟" : "15 分钟";

    const handleStart = () => {
      if (!userName.trim()) {
        setFormError("请输入您的姓名");
        return;
      }
      if (!isSimple) {
        if (!validateActivationCode(code)) {
          setFormError("激活码无效或格式错误");
          return;
        }
      }
      setFormError("");
      dispatch({
        type: "START_QUIZ_WITH_USER",
        userName: userName.trim(),
        activationCode: isSimple ? undefined : code.trim().toUpperCase(),
      });
    };

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
          <p className="text-bridge-muted leading-relaxed mb-6">
            {questionCount} 道题目 · 约 {timeEstimate}
          </p>
          {isSimple ? (
            <>
              <p className="text-bridge-muted text-sm leading-relaxed mb-2">
                由 <strong>985 理工硕博学长团</strong> 制作，涵盖 {dimCount} 项数理素质维度。
              </p>
              <p className="text-bridge-muted text-sm leading-relaxed mb-4">
                参考 <strong>2026 年教育部最新本科专业目录</strong>，为你推荐最匹配的理工专业方向。
              </p>
            </>
          ) : (
            <p className="text-bridge-muted text-sm leading-relaxed mb-6">
              涵盖 {dimCount} 项数理素质维度，完成后生成 3D 素质图景与专业推荐。
              请如实作答，答案无对错之分。
            </p>
          )}

          {/* User registration form */}
          <div className="max-w-sm mx-auto mb-8 text-left space-y-4">
            <div>
              <label className="block text-xs font-bold text-bridge-blue mb-1">您的姓名 / 昵称 (必填)</label>
              <input
                type="text"
                placeholder="请输入您的姓名"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue transition-colors"
              />
            </div>
            {!isSimple && (
              <div>
                <label className="block text-xs font-bold text-bridge-blue mb-1">专业版激活码 (必填)</label>
                <input
                  type="text"
                  placeholder="请输入 12 位专业版激活码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue font-mono transition-colors"
                />
              </div>
            )}
            {formError && (
              <p className="text-red-500 text-xs text-center font-semibold mt-2 animate-shake">{formError}</p>
            )}
          </div>

          <Button variant="primary" onClick={handleStart}>
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
      if (currentQ.section === "subjective") return "— 价值导向（6 题）";
      if (isSimple) {
        return "— 基础数理自测（17 题）";
      }
      return currentQ.objectiveTrack === "habits" ? "— 思维习惯（15 题）" : "— 能力自检（21 题）";
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
        if (isSimple) {
          dispatch({ type: "SUBMIT" });
        } else {
          dispatch({ type: "ENTER_INTEREST" });
        }
      }
    };

    const answer = state.answers[currentQ?.id ?? ""];

    // GitHub Aligned Coloring and Typography
    const getStemClass = (id: string, type: string) => {
      const lowerId = id.toLowerCase();
      let colorClass = "text-bridge-text";
      if (lowerId.startsWith("oh")) colorClass = "text-[#1e3a8a]";
      else if (lowerId.startsWith("oa")) colorClass = "text-[#6b21a8]";
      else if (lowerId.startsWith("s")) colorClass = "text-[#991b1b]";
      
      const fontStyle = type === "boolean" ? "italic" : "not-italic";
      return `${colorClass} ${fontStyle} text-lg font-semibold leading-relaxed mb-4`;
    };

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
              <h3 className={getStemClass(currentQ.id, currentQ.type)}>
                <span className="font-extrabold mr-2 select-none">{currentQ.id}</span>
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

  // --- Interest self-assessment phase (Professional only) ---
  if (state.phase === "interest") {
    const subjects = ["数学", "物理", "化学", "生物", "计算机"];
    
    const handleInterestChange = (sub: string, val: number) => {
      dispatch({ type: "SET_INTEREST", subject: sub, score: val });
    };

    const handleInterestSubmit = () => {
      dispatch({ type: "SUBMIT" });
    };

    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <GlassCard className="mb-6 p-8">
            <h2 className="text-xl font-bold text-bridge-blue mb-2">
              一、 兴趣导向自评
            </h2>
            <p className="text-sm text-bridge-muted leading-relaxed mb-6">
              请依据个人兴趣，在「数学、物理、化学、生物、计算机」五门学科中分别打分：
              <strong> 1</strong> 表示兴趣较低，<strong>10</strong> 表示兴趣较高。
              提交后将进入测验结果页。
            </p>

            <div className="space-y-6">
              {subjects.map((sub) => {
                const val = state.subjectInterest?.[sub] ?? 5;
                return (
                  <div key={sub} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-4 p-3.5 rounded-xl border border-white/95 bg-white/35 shadow-sm">
                    <label className="font-bold text-bridge-blue text-sm">{sub}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={val}
                      onChange={(e) => handleInterestChange(sub, parseInt(e.target.value, 10))}
                      className="w-full accent-bridge-blue cursor-pointer h-1.5 bg-white/40 rounded-lg appearance-none"
                    />
                    <span className="text-center font-bold text-bridge-text font-mono">{val}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "BACK_TO_QUIZ" })}
            >
              返回修改作答
            </Button>
            <Button
              variant="primary"
              onClick={handleInterestSubmit}
            >
              提交并查看结果
            </Button>
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
        userName={state.userName || "用户"}
        activationCode={state.activationCode || "免费体验"}
        lockedDimensions={lockedDims}
        fullDimensionOrder={fullDimOrder}
        catalogReference={catalogRef}
        contactText={PRO_CONTACT_TEXT}
        onRetry={() => dispatch({ type: "START_QUIZ" })}
        onBackToQuiz={() => dispatch({ type: "BACK_TO_QUIZ" })}
      />
    );
  }

  return null;
}
