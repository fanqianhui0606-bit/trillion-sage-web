"use client";

import Button from "@/components/shared/Button";
import GlassCard from "@/components/shared/GlassCard";

export default function QuizTeaserSection() {
  return (
    <section id="quiz-teaser" className="py-24 px-6 relative overflow-hidden">
      {/* Background radial gradient to weave them together */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-bridge-gold/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-bridge-blue/10 text-bridge-blue-dark font-semibold mb-3 tracking-widest uppercase">
            Psychometric Evaluation
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-bridge-text leading-tight tracking-wider">
            数理思维素质测验
          </h2>
          <p className="mt-4 text-bridge-muted leading-relaxed max-w-xl mx-auto font-serif text-xs md:text-sm">
            由<strong>清华/北大/科大硕博团队</strong>打造，非标设计的认知模式量表。
            在抽象逻辑、形式推演、物理图像等 14 个独立维度上探测思维天赋与认知边界。
          </p>
        </div>

        {/* Two Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Pillar 1: Lite Quiz */}
          <GlassCard className="text-center py-10 px-8 flex flex-col items-center border-stone-200/50 hover:border-bridge-blue/40 transition-all duration-500 shadow-glass hover:shadow-glass-lg group">
            <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-stone-100 text-stone-600 font-semibold mb-4 tracking-widest">
              免费体验版
            </span>
            <h3 className="text-xl font-bold font-serif text-bridge-blue mb-2">免费 Lite 版测评</h3>
            <p className="text-bridge-muted text-xs md:text-sm mb-6 leading-relaxed">
              18道经过严格信效度检验的逻辑直觉与抽象几何题目。快速测算，在核心5维特征上探测学生的理科天赋特征。
            </p>

            <ul className="text-left text-xs md:text-sm text-bridge-muted space-y-3 mb-8 w-full px-4 border-t border-stone-200/40 pt-6">
              <li className="flex items-center gap-2">
                <span className="text-bridge-blue">✦</span> 18道精选经典思维谜题
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-blue">✦</span> 极速出具 5 维雷达图简报
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-blue">✦</span> 评估基础抽象逻辑推理水平
              </li>
              <li className="flex items-center gap-2">
                <span className="text-stone-300">✦</span> 暂不支持 3D 流形图与详细报告
              </li>
            </ul>

            <div className="mt-auto w-full">
              <Button href="/quiz" variant="secondary" className="w-full font-serif text-xs tracking-widest">
                开启免费测验 (18题)
              </Button>
            </div>
          </GlassCard>

          {/* Pillar 2: Professional Quiz */}
          <GlassCard className="text-center py-10 px-8 flex flex-col items-center border-bridge-gold/30 hover:border-bridge-gold/80 transition-all duration-500 shadow-[0_4px_20px_rgba(197,160,89,0.06)] hover:shadow-[0_8px_32px_rgba(197,160,89,0.12)] bg-gradient-to-b from-amber-50/15 to-transparent relative overflow-hidden group">
            <div className="absolute top-2 right-4 text-bridge-gold/55 text-[9px] font-serif tracking-[0.2em] animate-pulse">
              深度诊断 🏆
            </div>
            
            <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-bridge-gold/15 text-bridge-gold font-semibold mb-4 tracking-widest animate-pulse">
              专业深度版
            </span>
            <h3 className="text-xl font-bold font-serif text-bridge-gold mb-2">专业深度版 (¥499)</h3>
            <p className="text-bridge-muted text-xs md:text-sm mb-6 leading-relaxed">
              35道完整题库。深度扫描14维认知图谱，采用三维拓扑流形互动呈现认知全貌，精准匹配2026年教育部新设理工类专业。
            </p>

            <ul className="text-left text-xs md:text-sm text-bridge-muted space-y-3 mb-8 w-full px-4 border-t border-amber-500/10 pt-6">
              <li className="flex items-center gap-2">
                <span className="text-bridge-gold">✦</span> 35道深度高阶数理潜质探测
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-gold">✦</span> 交互式 3D 素质流形图谱呈现
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-gold">✦</span> 2026教育部新工科/理科专业匹配
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-gold">✦</span> 终身保存，且附赠专属 AI 深度解读
              </li>
            </ul>

            <div className="mt-auto w-full">
              <Button href="/quiz?mode=pro" variant="primary" className="w-full font-serif text-xs tracking-widest bg-bridge-gold hover:bg-amber-600 shadow-[0_2px_10px_rgba(197,160,89,0.2)]">
                开启深度测验 (¥499)
              </Button>
            </div>
          </GlassCard>

        </div>
      </div>
    </section>
  );
}
