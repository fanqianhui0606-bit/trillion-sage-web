"use client";

import { useState } from "react";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";
import {
  SINGLE_PRODUCTS,
  SERVICE_PACKAGES,
  WHY_US,
  CONSULT_QUESTIONS,
  CAMP_MAJORS,
  CAMP_DIMENSIONS,
  CAMP_PRINCIPLE,
  CAMP_INFO,
  CAMP_BONUS,
  CAMP_GAINS,
} from "@/lib/products-data";

type TabId = "packages" | "camp";

const TABS: { id: TabId; label: string }[] = [
  { id: "packages", label: "咨询产品与套餐" },
  { id: "camp", label: "数理线上营" },
];

function BlockTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="w-1.5 h-6 bg-bridge-blue rounded-full" />
      <h3 className="text-lg md:text-xl font-bold text-bridge-blue-dark tracking-wider">{title}</h3>
      {note && (
        <span className="text-xs text-bridge-muted bg-white/40 px-2 py-0.5 rounded border border-white/60">
          {note}
        </span>
      )}
    </div>
  );
}

function PackagesPanel() {
  return (
    <div className="space-y-16">
      {/* 单项产品 */}
      <section>
        <BlockTitle title="咨询产品" note="单项购买" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SINGLE_PRODUCTS.map((p) => (
            <GlassCard key={p.name} className="flex flex-col border border-white/60">
              <h4 className="text-base font-bold text-bridge-blue mb-3">{p.name}</h4>
              <p className="text-sm text-bridge-muted leading-relaxed flex-1">{p.desc}</p>
              <div className="mt-5 pt-4 border-t border-stone-200/50">
                <span className="text-2xl font-bold font-mono text-stone-800">￥{p.price}</span>
                {p.priceNote && (
                  <span className="block text-xs text-bridge-muted mt-1">{p.priceNote}</span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 教育规划套餐 */}
      <section>
        <BlockTitle title="教育规划套餐" note="组合优惠" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">
          {SERVICE_PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative rounded-xl border p-6 flex flex-col backdrop-blur-md transition-all duration-500 ${
                pkg.highlight === "popular"
                  ? "border-bridge-gold bg-amber-500/10 shadow-[0_0_24px_rgba(197,160,89,0.18)] lg:scale-[1.03]"
                  : pkg.highlight === "recommended"
                  ? "border-bridge-blue/40 bg-bridge-blue/5 shadow-[0_0_24px_rgba(46,117,182,0.12)] hover:border-bridge-blue"
                  : "border-white/60 bg-white/25 shadow-glass hover:border-stone-300"
              }`}
            >
              {pkg.highlight === "popular" && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-amber-600 to-bridge-gold text-white text-[10px] font-bold tracking-widest rounded-full shadow-md">
                  热门推荐
                </span>
              )}
              {pkg.highlight === "recommended" && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-bridge-blue to-sky-600 text-white text-[10px] font-bold tracking-widest rounded-full shadow-md">
                  长线跟踪
                </span>
              )}

              <p className="text-xs text-bridge-muted tracking-widest mt-2">{pkg.alias}</p>
              <h4 className="text-xl font-bold text-stone-800 mb-3">【{pkg.name}】</h4>

              <div className="flex items-baseline gap-1.5 mb-5 border-b border-stone-200/50 pb-4">
                <span className="text-3xl font-bold font-mono text-stone-800">￥{pkg.price}</span>
                <span className="text-xs text-bridge-muted">/ 套餐全额</span>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-stone-700 leading-relaxed flex-1">
                {pkg.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <span
                      className={`mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                        pkg.highlight === "popular" ? "bg-bridge-gold" : "bg-bridge-blue"
                      }`}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button href="/team#consult" variant={pkg.highlight === "popular" ? "accent" : "primary"} className="w-full text-center">
                预约咨询
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-bridge-muted mt-6 text-center leading-relaxed">
          与北大资深心理辅导师合作，舒缓孩子的未来焦虑，为家庭升学决策提供心理支持。
        </p>
      </section>

      {/* 为什么选择我们 */}
      <section>
        <BlockTitle title="为什么选择我们" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_US.map((reason, i) => (
            <GlassCard key={reason} className="border border-white/60">
              <span className="text-2xl font-bold text-bridge-gold/40 font-mono leading-none">
                0{i + 1}
              </span>
              <p className="text-sm text-bridge-muted leading-relaxed mt-3">{reason}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 咨询能解答什么 */}
      <section>
        <BlockTitle title="咨询能为你解答" note="真实高频问题" />
        <GlassCard className="border border-white/60">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {CONSULT_QUESTIONS.map((q) => (
              <li key={q} className="flex items-start gap-2 text-sm text-bridge-muted leading-relaxed">
                <span className="text-bridge-blue mt-0.5 flex-shrink-0">✦</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button href="/downloads/gaokao-consulting-package.pdf" variant="primary" download>
          下载完整咨询套餐 PDF
        </Button>
        <Button href="/team#consult" variant="secondary">
          预约 1v1 咨询
        </Button>
      </div>
    </div>
  );
}

function CampPanel() {
  return (
    <div className="space-y-16">
      {/* 营期概览 */}
      <section>
        <BlockTitle title="营期一览" note="2026 秋季学期" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 border border-white/60">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {CAMP_INFO.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-bridge-blue font-bold tracking-wider mb-1">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-bridge-muted leading-relaxed">{item.value}</dd>
                </div>
              ))}
            </dl>
          </GlassCard>

          <GlassCard className="border border-bridge-gold/30 bg-gradient-to-b from-amber-50/20 to-transparent">
            <h4 className="text-base font-bold text-bridge-gold mb-3">报名附赠</h4>
            <ul className="space-y-3 mb-5">
              {CAMP_BONUS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-bridge-muted leading-relaxed">
                  <span className="text-bridge-gold mt-0.5 flex-shrink-0">✦</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-stone-200/50">
              <p className="text-xs text-bridge-blue font-bold tracking-wider mb-1">营期收获</p>
              <p className="text-sm text-bridge-muted leading-relaxed">{CAMP_GAINS}</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 8 种专业 */}
      <section>
        <BlockTitle title="8 种最具发展潜力的数理专业" note="985 高校硕博生解答" />

        {/* 桌面端表格 */}
        <GlassCard className="hidden md:block border border-white/60 overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bridge-blue/10 text-bridge-blue-dark">
                <th className="px-5 py-3 text-left font-bold w-[22%]">专业领域</th>
                <th className="px-5 py-3 text-left font-bold">核心亮点内容预览</th>
                <th className="px-5 py-3 text-left font-bold w-[26%]">对应讲师背景</th>
              </tr>
            </thead>
            <tbody>
              {CAMP_MAJORS.map((m, i) => (
                <tr
                  key={m.field}
                  className={`border-t border-white/60 ${i % 2 === 1 ? "bg-white/20" : ""}`}
                >
                  <td className="px-5 py-3 font-bold text-stone-800">{m.field}</td>
                  <td className="px-5 py-3 text-bridge-muted leading-relaxed">{m.highlight}</td>
                  <td className="px-5 py-3 text-bridge-muted">{m.lecturer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>

        {/* 移动端卡片 */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {CAMP_MAJORS.map((m) => (
            <GlassCard key={m.field} className="border border-white/60">
              <h4 className="text-sm font-bold text-bridge-blue mb-1.5">{m.field}</h4>
              <p className="text-sm text-bridge-muted leading-relaxed">{m.highlight}</p>
              <p className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-200/50">
                讲师背景：{m.lecturer}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 3+1 模式 */}
      <section>
        <BlockTitle title="3+1 科学模式" note="三种维度 + 一个学科原理" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {CAMP_DIMENSIONS.map((d) => (
            <GlassCard key={d.title} className="border border-white/60">
              <h4 className="text-base font-bold text-bridge-blue mb-3">{d.title}</h4>
              <p className="text-sm text-bridge-muted leading-relaxed">{d.desc}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="border border-bridge-gold/30 bg-gradient-to-r from-amber-50/20 to-transparent">
          <h4 className="text-base font-bold text-bridge-gold mb-3">{CAMP_PRINCIPLE.title}</h4>
          <p className="text-sm text-bridge-muted leading-relaxed">{CAMP_PRINCIPLE.desc}</p>
        </GlassCard>
      </section>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button href="/downloads/programs-overview.pdf" variant="primary" download>
          下载线上营一览 PDF
        </Button>
        <Button href="/team#consult" variant="secondary">
          咨询报名
        </Button>
      </div>
    </div>
  );
}

export default function ProgramsInteractive() {
  const [tab, setTab] = useState<TabId>("packages");

  return (
    <div>
      <div className="flex justify-center gap-2 mb-12">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t.id
                ? "bg-bridge-blue text-white shadow-md"
                : "bg-white/50 text-bridge-blue border border-bridge-blue/25 hover:bg-white/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "packages" ? <PackagesPanel /> : <CampPanel />}
    </div>
  );
}
