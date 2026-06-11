"use client";

import Image from "next/image";
import GlassCard from "@/components/shared/GlassCard";

export default function CTASection() {
  return (
    <section id="contact" className="py-24 px-6 relative overflow-hidden bg-stone-50/20 border-t border-stone-200/40">
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-bridge-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-bridge-blue/10 text-bridge-blue-dark font-semibold mb-3 tracking-widest uppercase">
            Connect With Us
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-bridge-text leading-tight tracking-wider">
            与我们建立连接
          </h2>
          <p className="mt-4 text-bridge-muted leading-relaxed max-w-xl mx-auto font-serif text-xs md:text-sm">
            无论你是想了解自己的数理天赋轨迹，还是在寻找个性化的硕博学术引航，
            我们始终在此聆听，为您提供理性、科学的成长解法。
          </p>
        </div>

        {/* Two-Column Grid: Contacts & QR Codes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Left Column: Founders & Company Info (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Founder Card 1 */}
              <GlassCard className="border border-stone-200/50 hover:border-bridge-blue/40 hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-bridge-blue/5 rounded-full group-hover:bg-bridge-blue/10 transition-all duration-500 blur-lg" />
                <div>
                  <div className="flex items-baseline justify-between border-b border-stone-200/40 pb-2 mb-3">
                    <h4 className="font-serif text-base font-bold text-stone-850 tracking-wider">
                      主理人 胡桐祎
                    </h4>
                    <span className="text-[9px] font-serif tracking-widest text-bridge-blue uppercase font-semibold">
                      Founder / CEO
                    </span>
                  </div>
                  <p className="text-[11px] font-serif text-stone-500 mb-4 leading-relaxed">
                    探索教育底层逻辑，致力于破除高中与大学物理信息差，为理性少年指明航线。
                  </p>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-stone-600 border-t border-stone-200/20 pt-2.5">
                  <p className="flex items-center gap-1.5">
                    <span className="text-bridge-blue font-sans">📞</span> 133 6045 5457
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-bridge-blue font-sans">✉️</span> huty@trillionSage.com
                  </p>
                </div>
              </GlassCard>

              {/* Founder Card 2 */}
              <GlassCard className="border border-stone-200/50 hover:border-bridge-gold/40 hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-amber-500/5 rounded-full group-hover:bg-amber-500/10 transition-all duration-500 blur-lg" />
                <div>
                  <div className="flex items-baseline justify-between border-b border-stone-200/40 pb-2 mb-3">
                    <h4 className="font-serif text-base font-bold text-stone-850 tracking-wider">
                      联合主理人 范千慧
                    </h4>
                    <span className="text-[9px] font-serif tracking-widest text-bridge-gold uppercase font-semibold">
                      Co-Founder
                    </span>
                  </div>
                  <p className="text-[11px] font-serif text-stone-500 mb-4 leading-relaxed">
                    数学物理 PhD 在读，研究方向为极端质量比旋入引力波 (EMRI)，倾听少年思维波频。
                  </p>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-stone-600 border-t border-stone-200/20 pt-2.5">
                  <p className="flex items-center gap-1.5">
                    <span className="text-bridge-gold font-sans">📞</span> 188 3515 4290
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-bridge-gold font-sans">✉️</span> fanqh@trillionSage.com
                  </p>
                </div>
              </GlassCard>

            </div>

            {/* Corporate Info */}
            <GlassCard className="border border-stone-200/50 p-5 flex-1 flex flex-col justify-center">
              <div className="space-y-2.5 text-[11px] md:text-xs font-serif text-stone-700">
                <p>
                  <strong className="text-stone-800">企业法人名称：</strong>
                  <span className="font-sans">千殊（杭州）教育咨询有限公司</span>
                </p>
                <p>
                  <strong className="text-stone-800">合规注册地址：</strong>
                  <span className="font-sans text-stone-600">浙江省杭州市拱墅区武林街道二圣庙前58号3幢1044室</span>
                </p>
              </div>
            </GlassCard>

          </div>

          {/* Right Column: 2 QR Codes (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            
            {/* QR 1: WeChat Public */}
            <GlassCard className="text-center p-3 border border-stone-200/50 hover:border-bridge-blue/30 transition-all duration-300 flex flex-col items-center justify-between">
              <div className="w-full aspect-square relative rounded bg-white mb-2 flex items-center justify-center p-1">
                <Image
                  src="/images/wechat.jpg"
                  alt="微信公众号"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              <p className="text-[10px] font-serif font-bold text-stone-800">微信公众号</p>
              <p className="text-[8px] text-stone-500 mt-0.5 font-serif truncate w-full">@ 桥梁计划Bridge</p>
            </GlassCard>

            {/* QR 2: Xiaohongshu */}
            <GlassCard className="text-center p-3 border border-stone-200/50 hover:border-rose-300/30 transition-all duration-300 flex flex-col items-center justify-between">
              <div className="w-full aspect-square relative rounded bg-white mb-2 flex items-center justify-center p-1">
                <Image
                  src="/images/xiaohongshu.jpg"
                  alt="官方小红书"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              <p className="text-[10px] font-serif font-bold text-stone-800 font-sans">官方小红书</p>
              <p className="text-[8px] text-stone-500 mt-0.5 font-serif truncate w-full">@ 桥梁计划BridgePlan</p>
            </GlassCard>

          </div>

        </div>
      </div>
    </section>
  );
}
