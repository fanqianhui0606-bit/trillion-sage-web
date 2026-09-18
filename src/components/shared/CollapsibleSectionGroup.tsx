"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  EXPAND_HOME_SECTION_EVENT,
  HOME_SECTION_BY_ANCHOR,
} from "@/lib/home-sections";

export default function CollapsibleSectionGroup({
  sectionKey,
  title,
  anchors,
  headerAbove,
  children,
}: {
  sectionKey: string;
  title: string;
  /** 本板块内的锚点 id；匹配 hash / 事件时自动展开 */
  anchors: string[];
  headerAbove?: ReactNode;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  const shouldOpenFor = useCallback(
    (anchorId: string) => {
      const mapped = HOME_SECTION_BY_ANCHOR[anchorId];
      return mapped === sectionKey || anchors.includes(anchorId);
    },
    [sectionKey, anchors]
  );

  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && shouldOpenFor(hash)) setExpanded(true);
    };
    openFromHash();

    const onExpand = (e: Event) => {
      const anchorId = (e as CustomEvent<{ anchorId?: string }>).detail?.anchorId;
      if (anchorId && shouldOpenFor(anchorId)) setExpanded(true);
    };

    window.addEventListener("hashchange", openFromHash);
    window.addEventListener(EXPAND_HOME_SECTION_EVENT, onExpand);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener(EXPAND_HOME_SECTION_EVENT, onExpand);
    };
  }, [shouldOpenFor]);

  return (
    <section
      id={sectionKey === "who" ? "values" : undefined}
      className="scroll-mt-16"
    >
      {headerAbove}

      <div className="relative w-full my-2">
        {/* 全宽金色标重背景：更均匀的左右渐变过渡 */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen"
          aria-hidden
        >
          <div
            className="absolute inset-0 blur-3xl scale-y-[1.8] opacity-80"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(197,160,89,0.14) 8%, rgba(197,160,89,0.28) 20%, rgba(197,160,89,0.40) 34%, rgba(197,160,89,0.46) 50%, rgba(197,160,89,0.40) 66%, rgba(197,160,89,0.28) 80%, rgba(197,160,89,0.14) 92%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-y-[20%] left-0 right-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(197,160,89,0.18) 6%, rgba(197,160,89,0.34) 18%, rgba(197,160,89,0.48) 32%, rgba(197,160,89,0.56) 50%, rgba(197,160,89,0.48) 68%, rgba(197,160,89,0.34) 82%, rgba(197,160,89,0.18) 94%, transparent 100%)",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="relative z-10 w-full py-12 px-6 text-center group cursor-pointer bg-transparent border-0"
          aria-expanded={expanded}
        >
          <span className="relative inline-block">
            <h2
              className="text-3xl md:text-4xl font-bold tracking-wide font-kuaikan italic text-white"
              style={{
                textShadow:
                  "0 2px 0 rgba(0,0,0,0.18), 0 8px 18px rgba(46,117,182,0.28), 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              {title}
            </h2>
            {/* 倒影 */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-[92%] block origin-top scale-y-[-1] select-none text-3xl md:text-4xl font-bold tracking-wide font-kuaikan italic text-white"
              style={{
                opacity: 0.28,
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 75%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 75%)",
                textShadow: "0 0 8px rgba(255,255,255,0.25)",
              }}
            >
              {title}
            </span>
          </span>
          <p className="mt-8 text-sm text-bridge-muted tracking-widest group-hover:text-bridge-blue transition-colors font-sans">
            {expanded ? "点击收起 ∧" : "展开查看 ∨"}
          </p>
        </button>
      </div>

      {expanded && <div className="animate-fade-in">{children}</div>}
    </section>
  );
}
