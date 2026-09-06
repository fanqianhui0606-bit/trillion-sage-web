"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MIN_READ_SECONDS,
  getAgreementById,
  docChecksSatisfied,
  loadAgreementHtml,
} from "@/lib/tracker-agreements";
import { getPackagePrice, getDepositAmount } from "@/lib/tracker-packages";
import type { PackageId } from "@/lib/tracker-types";

interface TrackerAgreementModalProps {
  agreementId: string;
  visitor?: TrackerOrderVisitor;
  packageId: string;
  orderNo: string;
  existingRecord?: {
    checked?: boolean;
    confirmedAt?: string;
    agreed?: boolean;
    agreedAt?: string;
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

function syncButtonStates(
  container: HTMLElement,
  docChecks: Record<string, boolean>,
  canEdit: boolean
) {
  container.querySelectorAll<HTMLButtonElement>("[data-check-id], [data-doc-check]").forEach((btn) => {
    const id = btn.dataset.checkId || btn.dataset.docCheck;
    if (!id) return;
    const checked = !!docChecks[id];
    const label = btn.textContent?.replace(/^[☑□]\s*/, "") || "";
    btn.textContent = `${checked ? "☑" : "□"} ${label}`;
    btn.classList.toggle("doc-btn--on", checked);
    btn.classList.toggle("on", checked);
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
  const [docChecks, setDocChecks] = useState<Record<string, boolean>>(
    () => existingRecord?.docChecks || {}
  );
  const [reachedBottom, setReachedBottom] = useState(false);
  const [startTs, setStartTs] = useState(0);
  const [, setTick] = useState(0);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const alreadyAgreed = !!(
    (existingRecord?.checked || existingRecord?.agreed) &&
    (existingRecord?.confirmedAt || existingRecord?.agreedAt)
  );
  const isAdult = !!(visitor?.isAdult || visitor?.age === "25以上" || visitor?.grade?.includes("本科生"));
  const canAgree = !!(def && (
    (def.by === "visitor" && role === "family") ||
    (def.by === "staff" && role === "staff")
  ));
  const elapsedSecs = startTs > 0 ? (Date.now() - startTs) / 1000 : 0;
  const readTimeOk = reachedBottom && elapsedSecs >= MIN_READ_SECONDS;
  const allDocChecksOk = docChecksSatisfied(agreementId, docChecks, isAdult);
  const canConfirm = canAgree && readTimeOk && allDocChecksOk && !alreadyAgreed;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    const pkg = packageId as PackageId;
    loadAgreementHtml(agreementId, visitor, packageId, orderNo, docChecks, {
      totalPrice: getPackagePrice(pkg),
      depositAmount: getDepositAmount(pkg),
      agreedAt: existingRecord?.confirmedAt || existingRecord?.agreedAt,
    })
      .then((h) => {
        if (!cancelled) {
          setHtml(h);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError((err as Error).message || "载入失败");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // 仅在打开/协议切换时重载正文；按钮状态由 sync 更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreementId, packageId, orderNo]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    syncButtonStates(el, docChecks, canAgree && !alreadyAgreed);
  }, [docChecks, canAgree, alreadyAgreed, html]);

  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (alreadyAgreed || !canAgree) return;
    const btn = (e.target as HTMLElement).closest("[data-check-id], [data-doc-check]") as HTMLButtonElement | null;
    if (!btn) return;
    const checkId = btn.dataset.checkId || btn.dataset.docCheck || "";
    if (!checkId) return;

    setDocChecks((prev) => {
      const next = { ...prev };
      if (checkId.startsWith("psych_rec_")) {
        next.psych_rec_yes = checkId === "psych_rec_yes";
        next.psych_rec_no = checkId === "psych_rec_no";
      } else {
        next[checkId] = !prev[checkId];
      }
      const a11 = ["a11_1", "a11_2", "a11_3", "svc_a11_1", "svc_a11_2", "svc_a11_3"];
      if (a11.includes(checkId)) {
        next.svc_a11_any = a11.some((k) => !!next[k]);
      }
      const a15 = ["a15_1", "a15_2", "a15_3", "a15_4", "a15_5", "svc_a15_1", "svc_a15_2", "svc_a15_3", "svc_a15_4", "svc_a15_5"];
      if (a15.includes(checkId)) {
        next.svc_a15_all = ["a15_1", "a15_2", "a15_3", "a15_4", "a15_5"].every((k) => !!next[k])
          || ["svc_a15_1", "svc_a15_2", "svc_a15_3", "svc_a15_4", "svc_a15_5"].every((k) => !!next[k]);
      }
      return next;
    });
  }, [alreadyAgreed, canAgree]);

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

  useEffect(() => {
    if (alreadyAgreed || loading) return;
    const check = () => {
      const el = contentRef.current;
      if (el && el.scrollHeight <= el.clientHeight + 6) {
        setReachedBottom(true);
        setStartTs((prev) => (prev > 0 ? prev : Date.now()));
      }
    };
    check();
    const t = setTimeout(check, 200);
    return () => clearTimeout(t);
  }, [alreadyAgreed, html, loading]);

  // 阅读计时：打开即开始计时
  useEffect(() => {
    if (alreadyAgreed) return;
    setStartTs((prev) => (prev > 0 ? prev : Date.now()));
  }, [alreadyAgreed]);

  // 每 400ms 触发一次重渲染，使阅读倒计时与「同意并继续」按钮状态实时更新
  useEffect(() => {
    if (alreadyAgreed) return;
    const id = setInterval(() => setTick((t) => t + 1), 400);
    return () => clearInterval(id);
  }, [alreadyAgreed]);

  if (!def) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center text-sm">协议数据不存在</div>
      </div>
    );
  }

  const remainSecs = Math.max(0, Math.ceil(MIN_READ_SECONDS - elapsedSecs));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-bridge-blue text-center flex-1 pr-6">{def.title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none bg-transparent border-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div
          ref={contentRef}
          onScroll={handleScroll}
          onClick={handleContentClick}
          className="agreement-doc flex-1 overflow-y-auto px-6 py-4 text-sm text-slate-700 leading-relaxed"
        >
          {loading && <p className="text-center text-bridge-muted py-10">正在载入文件内容…</p>}
          {loadError && <p className="text-center text-red-600 py-10">{loadError}</p>}
          {!loading && !loadError && (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          <div className="flex items-center gap-4 text-sm flex-wrap text-left">
            {!canAgree ? (
              <span className="text-orange-500">
                {role === "staff"
                  ? "本协议需由家庭端阅读并同意；您可查看全文"
                  : "本协议由我方确认"}
              </span>
            ) : alreadyAgreed ? (
              <span className="text-green-600 font-semibold">
                ✓ 已于 {existingRecord?.confirmedAt || existingRecord?.agreedAt} 阅读并同意
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

          {!alreadyAgreed && canAgree && !allDocChecksOk && (
            <p className="text-sm text-orange-500 text-left">请先点击完成各必选项确认</p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => onAgree(docChecks)}
              disabled={!canConfirm}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${
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
