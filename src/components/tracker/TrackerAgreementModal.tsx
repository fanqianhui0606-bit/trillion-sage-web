"use client";

import { useState, useEffect, useRef } from "react";

interface TrackerAgreementModalProps {
  title: string;
  content: string;
  onAgree: () => void;
  onCancel: () => void;
  countdownSeconds?: number;
}

/**
 * 协议阅读门控弹窗：
 * - 内容可滚动
 * - 需滚至底部 + 等待倒计时完成方可"同意"
 * - Tailwind only
 */
export default function TrackerAgreementModal({
  title,
  content,
  onAgree,
  onCancel,
  countdownSeconds = 5,
}: TrackerAgreementModalProps) {
  const [canScroll, setCanScroll] = useState(false);
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [agreed, setAgreed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 监听滚动到底部
  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    if (atBottom && !canScroll) {
      setCanScroll(true);
    }
  };

  // 倒计时
  useEffect(() => {
    if (!canScroll) return;
    if (timeLeft <= 0) {
      setAgreed(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [canScroll, timeLeft]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-bridge-blue font-serif">{title}</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none bg-transparent border-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* 协议内容区，可滚动 */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4 text-xs text-slate-600 leading-relaxed"
        >
          {content}
        </div>

        {/* 门控状态条 */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-4">
          {!canScroll ? (
            <span className="text-xs text-orange-500">请向下滚动阅读完整内容</span>
          ) : !agreed ? (
            <span className="text-xs text-bridge-muted animate-pulse">
              请等待 {timeLeft}s 后方可同意
            </span>
          ) : (
            <span className="text-xs text-green-600 font-semibold">✓ 已阅读完毕，可以同意</span>
          )}

          <div className="flex-1" />

          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onAgree}
            disabled={!agreed}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${
              agreed
                ? "bg-bridge-blue text-white hover:bg-bridge-blue-dark cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            同意并继续
          </button>
        </div>
      </div>
    </div>
  );
}