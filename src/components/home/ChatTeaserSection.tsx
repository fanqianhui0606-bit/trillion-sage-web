"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import GlassCard from "@/components/shared/GlassCard";
import ChatEntryModal from "@/components/shared/ChatEntryModal";

export default function ChatTeaserSection() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <section id="chat-teaser" className="py-24 px-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-550/5 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-bridge-blue/10 text-bridge-blue-dark font-semibold mb-3 tracking-widest uppercase">
            AI Cognitive Resonance
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-bridge-text leading-tight tracking-wider">
            AI 思维共振聊天室
          </h2>
          <p className="mt-4 text-bridge-muted leading-relaxed max-w-2xl mx-auto font-serif text-xs md:text-sm">
            我们拒绝生硬的问卷与谄媚的夸赞。通过去魅的灵魂对弈与苏格拉底式发问，
            在流动的对话中探寻少年的逻辑暗物质，照见父母的深层期待，构筑家庭理解之桥。
          </p>
        </div>

        {/* Three Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Column 1: Student Chat */}
          <GlassCard className="text-center py-10 px-6 flex flex-col items-center border-bridge-blue/20 hover:border-bridge-blue/60 transition-all duration-500 shadow-glass hover:shadow-glass-lg group relative">
            <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-bridge-blue/10 text-bridge-blue font-semibold mb-4 tracking-widest">
              学生端 · 免费体验
            </span>
            <h3 className="text-xl font-bold font-serif text-bridge-blue mb-2">探寻星轨的少年</h3>
            <p className="text-bridge-muted text-xs md:text-sm mb-6 leading-relaxed">
              与联合主理人（物理学姐）及理科学长学姐化身的 AI 助手对话，评估理科审美、逻辑直觉，发掘你的思维光芒。
            </p>

            <ul className="text-left text-xs md:text-sm text-bridge-muted space-y-3 mb-8 w-full px-4 border-t border-stone-200/40 pt-6">
              <li className="flex items-center gap-2">
                <span className="text-bridge-blue">✦</span> 苏格拉底式理科审美对弈
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-blue">✦</span> 物理常数与逻辑直觉探索
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-blue">✦</span> 评估眼高手低与“战略应付”
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-blue">✦</span> 支持输入家庭关联码对比
              </li>
            </ul>

            <div className="mt-auto w-full">
              <Button onClick={() => setIsChatModalOpen(true)} variant="secondary" className="w-full font-serif text-xs tracking-widest">
                开启少年探索之旅
              </Button>
            </div>
          </GlassCard>

          {/* Column 2: Parent Chat */}
          <GlassCard className="text-center py-10 px-6 flex flex-col items-center border-amber-600/20 hover:border-amber-600/60 transition-all duration-500 shadow-glass hover:shadow-glass-lg group relative bg-gradient-to-b from-amber-50/10 to-transparent">
            <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-amber-600/10 text-amber-700 font-semibold mb-4 tracking-widest">
              家长端 · 免费体验
            </span>
            <h3 className="text-xl font-bold font-serif text-amber-800 mb-2">静候回音的守护者</h3>
            <p className="text-bridge-muted text-xs md:text-sm mb-6 leading-relaxed">
              倾听育儿过程中的真实困惑与升学期望，照见家庭的决策画像，释放焦虑，用理性的物理思维搭起与孩子沟通的桥梁。
            </p>

            <ul className="text-left text-xs md:text-sm text-bridge-muted space-y-3 mb-8 w-full px-4 border-t border-stone-200/40 pt-6">
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✦</span> 深度共情与真实育儿压力倾听
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✦</span> 结构化家庭决策模型探测
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✦</span> 拒绝说教的温润引导体验
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">✦</span> 解锁家庭双端思维对比报告
              </li>
            </ul>

            <div className="mt-auto w-full">
              <Button onClick={() => setIsChatModalOpen(true)} variant="secondary" className="w-full font-serif text-xs tracking-widest text-amber-800 border-amber-600/30 hover:bg-amber-50/50">
                开启守护者倾听
              </Button>
            </div>
          </GlassCard>

          {/* Column 3: Paid Professional Chat */}
          <GlassCard className="text-center py-10 px-6 flex flex-col items-center border-bridge-gold/30 hover:border-bridge-gold/80 transition-all duration-500 shadow-[0_4px_20px_rgba(197,160,89,0.06)] hover:shadow-[0_8px_32px_rgba(197,160,89,0.12)] bg-gradient-to-b from-amber-50/20 to-transparent relative overflow-hidden group">
            <div className="absolute top-2 right-4 text-bridge-gold/50 text-[9px] font-serif tracking-[0.2em] animate-pulse">
              深度诊断 🦋
            </div>
            
            <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-bridge-gold/10 text-bridge-gold font-semibold mb-4 tracking-widest">
              专业版 · 深度定制
            </span>
            <h3 className="text-xl font-bold font-serif text-bridge-gold mb-2">深度共振计划</h3>
            <p className="text-bridge-muted text-xs md:text-sm mb-6 leading-relaxed">
              多维度多角色（主理人、科学家、心理学导引等）复杂博弈模型，支持25轮以上的深度长对话与双端交叉星图分析。
            </p>

            <ul className="text-left text-xs md:text-sm text-bridge-muted space-y-3 mb-8 w-full px-4 border-t border-amber-500/10 pt-6">
              <li className="flex items-center gap-2">
                <span className="text-bridge-gold">✦</span> 多角色（主理人与科学家）围桌会商
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-gold">✦</span> 超长对话轮次，发掘微小逻辑缺陷
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-gold">✦</span> 独家《数理成长天赋生存手册》
              </li>
              <li className="flex items-center gap-2">
                <span className="text-bridge-gold">✦</span> 专业真人团队人工复核解读
              </li>
            </ul>

            <div className="mt-auto w-full">
              <Button href="/paid-chat" variant="primary" className="w-full font-serif text-xs tracking-widest bg-bridge-gold hover:bg-amber-600 shadow-[0_2px_10px_rgba(197,160,89,0.2)]">
                开启专业版对弈
              </Button>
            </div>
          </GlassCard>

        </div>
      </div>

      {/* Chat Entry Modal */}
      <ChatEntryModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
    </section>
  );
}
