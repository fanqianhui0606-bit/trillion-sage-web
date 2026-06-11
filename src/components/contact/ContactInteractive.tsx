"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import GlassCard from "@/components/shared/GlassCard";

export default function ContactInteractive() {
  const [zoomLicense, setZoomLicense] = useState(false);

  // Close zoom modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomLicense(false);
    };
    if (zoomLicense) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomLicense]);

  return (
    <div className="space-y-16">
      
      {/* 1. Founders Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Founder 1 */}
        <GlassCard className="border border-white/50 hover:border-bridge-blue/40 hover:shadow-[0_8px_24px_rgba(46,117,182,0.08)] transition-all duration-500 p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-20 h-20 bg-bridge-blue/5 rounded-full group-hover:bg-bridge-blue/10 transition-all duration-500 blur-lg" />
          
          <div>
            <div className="flex items-baseline justify-between border-b border-stone-200/50 pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-stone-850 tracking-wider">
                主理人 胡桐祎
              </h3>
              <span className="text-[10px] font-serif tracking-widest text-bridge-blue uppercase font-semibold">
                Founder / CEO
              </span>
            </div>
            <p className="text-xs font-serif text-stone-500 mb-4 leading-relaxed">
              探索教育的底层逻辑，致力于消除高中与大学之间的数理信息鸿沟，为低熵少年寻找同行者。
            </p>
          </div>
          
          <div className="space-y-2 text-xs font-mono text-stone-600 border-t border-stone-200/30 pt-3">
            <p className="flex items-center gap-2">
              <span className="text-bridge-blue font-sans">📞</span> 电话：133 6045 5457
            </p>
            <p className="flex items-center gap-2">
              <span className="text-bridge-blue font-sans">✉️</span> 邮箱：huty@trillionSage.com
            </p>
          </div>
        </GlassCard>

        {/* Founder 2 (联合主理人) */}
        <GlassCard className="border border-white/50 hover:border-bridge-gold/40 hover:shadow-[0_8px_24px_rgba(197,160,89,0.08)] transition-all duration-500 p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-20 h-20 bg-amber-500/5 rounded-full group-hover:bg-amber-500/10 transition-all duration-500 blur-lg" />
          
          <div>
            <div className="flex items-baseline justify-between border-b border-stone-200/50 pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-stone-850 tracking-wider">
                联合主理人 范千慧
              </h3>
              <span className="text-[10px] font-serif tracking-widest text-bridge-gold uppercase font-semibold">
                Co-Founder
              </span>
            </div>
            <p className="text-xs font-serif text-stone-500 mb-4 leading-relaxed">
              数学物理 PhD 在读，研究方向为强引力场下的引力波理论 (EMRI)。在数理探险之余，倾听少年的思维波频。
            </p>
          </div>
          
          <div className="space-y-2 text-xs font-mono text-stone-600 border-t border-stone-200/30 pt-3">
            <p className="flex items-center gap-2">
              <span className="text-bridge-gold font-sans">📞</span> 电话：188 3515 4290
            </p>
            <p className="flex items-center gap-2">
              <span className="text-bridge-gold font-sans">✉️</span> 邮箱：fanqh@trillionSage.com
            </p>
          </div>
        </GlassCard>

      </div>

      {/* 2. QR Codes / Social Section */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1.5 h-6 bg-bridge-blue rounded-full" />
          <h3 className="font-serif text-lg font-bold text-bridge-blue-dark tracking-widest">
            关注学术营与动态
          </h3>
          <span className="text-xs font-serif text-bridge-muted bg-white/40 px-2 py-0.5 rounded border border-white/60">
            破除升学信息差
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* QR 1: WeChat Public */}
          <GlassCard className="text-center p-4 border border-white/60 hover:border-bridge-blue/30 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between">
            <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-white mb-3 flex items-center justify-center p-1">
              <Image
                src="/images/wechat.jpg"
                alt="微信公众号"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
            <p className="text-xs font-serif font-bold text-stone-800">微信公众号</p>
            <p className="text-[10px] text-stone-500 mt-1 font-serif">@ 桥梁计划Bridge</p>
          </GlassCard>

          {/* QR 2: Xiaohongshu */}
          <GlassCard className="text-center p-4 border border-white/60 hover:border-rose-300/30 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between">
            <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-white mb-3 flex items-center justify-center p-1">
              <Image
                src="/images/xiaohongshu.jpg"
                alt="小红书"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
            <p className="text-xs font-serif font-bold text-stone-800">官方小红书</p>
            <p className="text-[10px] text-stone-500 mt-1 font-serif">@ 桥梁计划BridgePlan</p>
          </GlassCard>
        </div>
      </div>

      {/* 3. Company Info & License */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl mx-auto items-stretch">
        
        {/* Info Box */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <GlassCard className="border border-white/60 p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <span className="w-1 h-5 bg-bridge-blue rounded-full" />
                <h3 className="font-serif text-base font-bold text-stone-850 tracking-wider">
                  公司合规背书信息
                </h3>
              </div>
              
              <div className="space-y-4 text-xs md:text-sm font-serif text-stone-700 leading-loose">
                <p>
                  <strong className="text-stone-800">企业法人名称：</strong>
                  <span className="font-sans">千殊（杭州）教育咨询有限公司</span>
                </p>
                <p>
                  <strong className="text-stone-800">合规注册地址：</strong>
                  <span className="font-sans text-stone-600">浙江省杭州市拱墅区武林街道二圣庙前58号3幢1044室</span>
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-stone-200/40 pt-4 text-[10px] text-bridge-muted font-serif italic leading-relaxed">
              * 桥梁计划（Bridge Plan）为千殊教育旗下独立教育咨询 brand，所有服务流程受国家市场监管法律法规及公司服务合约保护。
            </div>
          </GlassCard>
        </div>

        {/* License Trigger Card */}
        <div className="flex">
          <GlassCard 
            className="w-full border border-white/60 hover:border-bridge-gold/50 hover:shadow-[0_8px_24px_rgba(197,160,89,0.06)] transition-all duration-300 p-5 flex flex-col items-center justify-between text-center cursor-pointer group"
            onClick={() => setZoomLicense(true)}
          >
            <span className="text-[10px] font-serif bg-bridge-gold/10 text-bridge-gold border border-bridge-gold/20 px-2 py-0.5 rounded-full tracking-wider animate-pulse mb-3">
              点击可放大查验 🔍
            </span>
            
            <div className="w-full relative aspect-[3/4.2] rounded overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center filter group-hover:brightness-95 transition-all">
              <Image
                src="/images/license.png"
                alt="营业执照缩略图"
                fill
                className="object-cover"
                sizes="(max-w-768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all flex items-center justify-center">
                <span className="bg-stone-900/60 text-white rounded-full px-3 py-1.5 text-xs font-serif scale-0 group-hover:scale-100 transition-transform duration-300">
                  查看大图
                </span>
              </div>
            </div>
            
            <p className="text-xs font-serif font-bold text-stone-800 mt-3">工商营业执照</p>
          </GlassCard>
        </div>

      </div>

      {/* 4. Full-screen License Modal */}
      {zoomLicense && (
        <div 
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setZoomLicense(false)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] aspect-[3/4.2] rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-white animate-scale-in cursor-default"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the license itself
          >
            <Image
              src="/images/license.png"
              alt="营业执照高清大图"
              fill
              className="object-contain p-2"
              priority
              sizes="100vw"
            />
            {/* Close button in corner */}
            <button
              onClick={() => setZoomLicense(false)}
              className="absolute top-4 right-4 bg-stone-950/80 text-white text-xs font-serif px-3 py-1.5 border border-white/10 rounded-md hover:bg-stone-900 hover:text-bridge-gold transition-all"
            >
              关闭大图 (Esc)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
