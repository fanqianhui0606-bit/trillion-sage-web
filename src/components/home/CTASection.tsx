"use client";

import Image from "next/image";
import SectionTitle from "@/components/shared/SectionTitle";
import GlassCard from "@/components/shared/GlassCard";

export default function CTASection() {
  return (
    <section id="contact" className="min-h-screen flex items-center py-24 px-6 relative overflow-hidden scroll-mt-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-bridge-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto w-full">
        <SectionTitle
          title="联系我们"
          subtitle="如需咨询请添加千殊小助理微信：TrillionSage"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <GlassCard className="border border-stone-200/50 hover:border-bridge-blue/40 hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-bridge-blue/5 rounded-full group-hover:bg-bridge-blue/10 transition-all duration-500 blur-lg" />
                <div>
                  <div className="flex items-baseline justify-between border-b border-stone-200/40 pb-2 mb-3">
                    <h4 className="text-base font-bold text-stone-850 tracking-wider">主理人 胡桐祎</h4>
                    <span className="text-[9px] tracking-widest text-bridge-blue uppercase font-semibold">Founder</span>
                  </div>
                  <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                    探索教育底层逻辑，致力于破除高中与大学物理信息差，为理性少年指明航线。
                  </p>
                </div>
                <div className="space-y-1 text-xs font-mono text-stone-600 border-t border-stone-200/20 pt-2.5">
                  <p className="flex items-center gap-1.5">
                    <span className="text-bridge-blue">📞</span> 133 6045 5457
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-bridge-blue">✉️</span> huty@trillionSage.com
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="border border-stone-200/50 hover:border-bridge-gold/40 hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-amber-500/5 rounded-full group-hover:bg-amber-500/10 transition-all duration-500 blur-lg" />
                <div>
                  <div className="flex items-baseline justify-between border-b border-stone-200/40 pb-2 mb-3">
                    <h4 className="text-base font-bold text-stone-850 tracking-wider">联合主理人 范千慧</h4>
                    <span className="text-[9px] tracking-widest text-bridge-gold uppercase font-semibold">Co-Founder</span>
                  </div>
                  <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                    数学物理 PhD 在读，研究方向为极端质量比旋入引力波 (EMRI)，倾听少年思维波频。
                  </p>
                </div>
                <div className="space-y-1 text-xs font-mono text-stone-600 border-t border-stone-200/20 pt-2.5">
                  <p className="flex items-center gap-1.5">
                    <span className="text-bridge-gold">📞</span> 188 3515 4290
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-bridge-gold">✉️</span> fanqh@trillionSage.com
                  </p>
                </div>
              </GlassCard>
            </div>

            <GlassCard className="border border-stone-200/50 p-5">
              <div className="space-y-2.5 text-xs md:text-sm text-stone-700">
                <p>
                  <strong className="text-stone-800">企业法人名称：</strong>
                  <span className="font-sans">千殊（杭州）教育咨询有限公司</span>
                </p>
                <p>
                  <strong className="text-stone-800">合规注册地址：</strong>
                  <span className="font-sans text-stone-600">浙江省杭州市拱墅区武林街道二圣庙前58号3幢1044室</span>
                </p>
                <p>
                  <strong className="text-stone-800">小助理微信：</strong>
                  <span className="font-mono text-bridge-blue font-semibold">TrillionSage</span>
                </p>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <GlassCard className="text-center p-3 border border-stone-200/50 hover:border-bridge-blue/30 transition-all duration-300 flex flex-col items-center justify-between">
              <div className="w-full aspect-square relative rounded bg-white mb-2 flex items-center justify-center p-1">
                <Image src="/images/wechat.jpg" alt="微信公众号" width={120} height={120} className="object-contain" />
              </div>
              <p className="text-xs font-bold text-stone-800">微信公众号</p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-brand truncate w-full">@ 桥梁计划Bridge</p>
            </GlassCard>

            <GlassCard className="text-center p-3 border border-stone-200/50 hover:border-rose-300/30 transition-all duration-300 flex flex-col items-center justify-between">
              <div className="w-full aspect-square relative rounded bg-white mb-2 flex items-center justify-center p-1">
                <Image src="/images/xiaohongshu.jpg" alt="官方小红书" width={120} height={120} className="object-contain" />
              </div>
              <p className="text-xs font-bold text-stone-800">官方小红书</p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-brand truncate w-full">@ 桥梁计划BridgePlan</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
