"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MIN_READ_SECONDS,
  getAgreementById,
  docChecksSatisfied,
  buildAgreementVars,
  fillAgreementContent,
  AGREEMENT_CONTENT_TEMPLATES,
} from "@/lib/tracker-agreements";

interface TrackerAgreementModalProps {
  agreementId: string;
  visitor?: TrackerOrderVisitor;
  packageId: string;
  orderNo: string;
  existingRecord?: {
    checked?: boolean;
    confirmedAt?: string;
    docChecks?: Record<string, boolean>;
  };
  role: "family" | "staff";
  onAgree: (docChecks: Record<string, boolean>) => void;
  onCancel: () => void;
}

interface TrackerOrderVisitor {
  name?: string;
  age?: string;
  grade?: string;
  school?: string;
  phone?: string;
  wechat?: string;
  email?: string;
  parentName?: string;
  relationship?: string;
  parentTitle?: string;
  parentPhone?: string;
  parentWechat?: string;
  parentEmail?: string;
  contactTime?: string;
  isAdult?: boolean;
  packageId?: string;
  [key: string]: unknown;
}

/** 更新 DOM 中交互按钮的视觉状态（docChecks 变化时调用） */
function syncButtonStates(
  container: HTMLElement,
  docChecks: Record<string, boolean>,
  canEdit: boolean
) {
  container.querySelectorAll<HTMLButtonElement>("[data-check-id]").forEach((btn) => {
    const id = btn.dataset.checkId;
    if (!id) return;
    const checked = !!docChecks[id];
    // 更新 checkbox 符号
    const textNode = btn.childNodes[0];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = `${checked ? "☑" : "□"} `;
    }
    // 更新选中样式
    btn.classList.toggle("doc-btn--on", checked);
    btn.disabled = !canEdit;
  });
}

export default function TrackerAgreementModal({
  agreementId,
  visitor,
  packageId,
  orderNo,
  existingRecord,
  role,
  onAgree,
  onCancel,
}: TrackerAgreementModalProps) {
  const def = getAgreementById(agreementId);

  // docChecks 初始化（从已有记录恢复）
  const [docChecks, setDocChecks] = useState<Record<string, boolean>>(
    () => existingRecord?.docChecks || {}
  );

  // 门控：reachedBottom + startTs（避免倒计时被滚动重置）
  const [reachedBottom, setReachedBottom] = useState(false);
  const [startTs, setStartTs] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);

  // 状态推导
  const alreadyAgreed = !!(existingRecord?.checked && existingRecord?.confirmedAt);
  const isAdult = !!(visitor?.isAdult || visitor?.age === "25以上" || (visitor?.grade?.includes("本科生")));
  // visitor 协议 → family 角色可同意；staff 协议 → staff 角色可同意
  const canAgree = !!(def && (
    (def.by === "visitor" && role === "family") ||
    (def.by === "staff" && role === "staff")
  ));
  const elapsedSecs = startTs > 0 ? (Date.now() - startTs) / 1000 : 0;
  const readTimeOk = reachedBottom && elapsedSecs >= MIN_READ_SECONDS;
  const allDocChecksOk = docChecksSatisfied(agreementId, docChecks, isAdult);
  const canConfirm = canAgree && readTimeOk && allDocChecksOk && !alreadyAgreed;

  // 生成带占位符的原始 HTML（按钮为初始未选中状态）
  const rawHtml = (() => {
    if (!def) return "";
    const tpl = AGREEMENT_CONTENT_TEMPLATES[agreementId];
    const content = tpl || def.content;
    const { vars } = buildAgreementVars(agreementId, visitor, packageId, orderNo, docChecks);
    return fillAgreementContent(content, vars);
  })();

  // docChecks 或 canAgree 变化时同步刷新按钮状态
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    syncButtonStates(el, docChecks, canAgree && !alreadyAgreed);
  }, [docChecks, canAgree, alreadyAgreed]);

  // 协议内容区域点击 → 事件委托
  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (alreadyAgreed || !canAgree) return;
    const btn = (e.target as HTMLElement).closest("[data-check-id]") as HTMLButtonElement | null;
    if (!btn) return;

    const checkId = btn.dataset.checkId || "";
    setDocChecks((prev) => {
      const next = { ...prev };

      // 心理辅导录音互斥
      if (checkId.startsWith("psych_rec_")) {
        next.psych_rec_yes = checkId === "psych_rec_yes";
        next.psych_rec_no = checkId === "psych_rec_no";
      } else {
        next[checkId] = !prev[checkId];
      }

      // 聚合标识：a11 任选其一
      if (["svc_a11_1", "svc_a11_2", "svc_a11_3"].some((k) => k === checkId)) {
        next.svc_a11_any = ["svc_a11_1", "svc_a11_2", "svc_a11_3"].some((k) => !!next[k]);
      }
      // 聚合标识：a15 全部
      if (["svc_a15_1", "svc_a15_2", "svc_a15_3", "svc_a15_4", "svc_a15_5"].some((k) => k === checkId)) {
        next.svc_a15_all = ["svc_a15_1", "svc_a15_2", "svc_a15_3", "svc_a15_4", "svc_a15_5"].every((k) => !!next[k]);
      }

      return next;
    });
  }, [alreadyAgreed, canAgree]);

  // 监听滚动到底部（首次触发起始计时）
  const handleScroll = useCallback(() => {
    if (alreadyAgreed) return;
    const el = contentRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 6;
    if (atBottom && !reachedBottom) {
      setReachedBottom(true);
      setStartTs((prev) => (prev > 0 ? prev : Date.now()));
    }
  }, [reachedBottom, alreadyAgreed]);

  // 内容不足一屏时，无需滚动直接视为已读到底部
  useEffect(() => {
    if (alreadyAgreed) return;
    const check = () => {
      const el = contentRef.current;
      if (el && el.scrollHeight <= el.clientHeight + 6) {
        setReachedBottom(true);
        setStartTs((prev) => (prev > 0 ? prev : Date.now()));
      }
    };
    check();
    const t = setTimeout(check, 150);
    return () => clearTimeout(t);
  }, [alreadyAgreed, rawHtml]);

  if (!def) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center">协议数据不存在</div>
      </div>
    );
  }

  const remainSecs = Math.max(0, Math.ceil(MIN_READ_SECONDS - elapsedSecs));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-bridge-blue font-serif">{def.title}</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none bg-transparent border-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* 协议内容区：事件委托 onClick → handleContentClick */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          onClick={handleContentClick}
          className="flex-1 overflow-y-auto px-6 py-4 text-xs text-slate-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: rawHtml }}
        />

        {/* 门控状态条 */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          {/* 阅读进度提示 */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {!canAgree ? (
              <span className="text-orange-500">
                {role === "staff"
                  ? "本协议需由家庭端阅读并同意；您可查看全文"
                  : "本协议由我方确认"}
              </span>
            ) : alreadyAgreed ? (
              <span className="text-green-600 font-semibold">
                ✓ 已于 {existingRecord?.confirmedAt} 阅读并同意
              </span>
            ) : (
              <>
                <span className={reachedBottom ? "text-green-600" : "text-orange-500"}>
                  {reachedBottom ? "✓ 已读至底部" : "请向下滑动至全文底部"}
                </span>
                <span className="text-slate-400">·</span>
                <span className={readTimeOk ? "text-green-600" : "text-slate-500"}>
                  {readTimeOk
                    ? `✓ 阅读时间已满足（${MIN_READ_SECONDS}s）`
                    : `阅读计时 ${remainSecs}s`}
                </span>
              </>
            )}
          </div>

          {/* docChecks 未完成提示 */}
          {!alreadyAgreed && canAgree && !allDocChecksOk && (
            <p className="text-xs text-orange-500">请先点击完成各必选项确认</p>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            <div className="flex-1" />
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => onAgree(docChecks)}
              disabled={!canConfirm}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${
                canConfirm
                  ? "bg-bridge-blue text-white hover:bg-blue-600 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {alreadyAgreed ? "已同意" : "同意并继续"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}