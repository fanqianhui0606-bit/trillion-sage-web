"use client";

import React, { useState } from "react";

interface Tutor {
  school: string;
  role: string;
  field: string;
  quote: string;
  group: "research" | "advisor";
  tagColor: string;
}

const TUTORS: Tutor[] = [
  {
    school: "北京大学",
    role: "博士在读",
    field: "凝聚态物理与拓扑量子器件",
    quote: "探索晶格缺陷中涌现的量子实在，如同在无声的微观迷宫中寻找宏观对称性的投影。",
    group: "research",
    tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  {
    school: "中科院理论物理所",
    role: "博士在读",
    field: "经典与理论物理 / 黑洞物理学",
    quote: "物质告诉时空如何弯曲，时空告诉物质如何运动。这简短的二十个字，蕴含着时空最深邃的纯净。",
    group: "research",
    tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  {
    school: "中国科学技术大学",
    role: "博士在读",
    field: "量子信息科学 / 超冷原子物理",
    quote: "在微开尔文的极寒中捕获原子的自旋相干，是我们叩开通用量子计算大门的一声轻扣。",
    group: "research",
    tagColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  },
  {
    school: "南京大学",
    role: "博士在读",
    field: "柔性电子学与强关联电子系统",
    quote: "在柔性分子基底上重新编织电子的流动，是让冰冷的芯片技术拥抱有机生命体的柔美之桥。",
    group: "research",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    school: "国家天文台",
    role: "博士在读",
    field: "高能天体物理 / 强重力透镜效应",
    quote: "被超大质量星系偏折的光束，是宇宙在百亿年前寄给今天人类的，带着引力余温的微波信件。",
    group: "research",
    tagColor: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  {
    school: "北京大学",
    role: "心理学硕士",
    field: "青少年生涯规划 / 理科直觉保护",
    quote: "我们不负责修复逻辑的缺陷，我们只负责拥抱那些在严密的分数考查系统里感到疲惫的敏锐直觉。",
    group: "advisor",
    tagColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
];

export default function ConsultationSection() {
  // Expand/collapse states for tutors
  const [expandedTutors, setExpandedTutors] = useState<Record<number, boolean>>({});

  const toggleTutorExpand = (index: number) => {
    setExpandedTutors(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <section id="consultation" className="py-24 px-6 relative overflow-hidden bg-stone-50/30">
      {/* Background radial gradient */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-bridge-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-amber-500/10 text-amber-700 font-semibold mb-3 tracking-widest uppercase">
            1v1 Academic Mentorship
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-bridge-text leading-tight tracking-wider">
            预约一对一真人引航
          </h2>
          <p className="mt-4 text-bridge-muted leading-relaxed max-w-2xl mx-auto font-serif text-xs md:text-sm">
            匹配来自清华大学、北京大学、中国科学技术大学等顶尖高校的一线理科博士/硕士导师团队。
            破除中学与大学学术信息差，为您诊断认知评估报告，定制非标成长路径。
          </p>
        </div>

        {/* Structure Layout: Expandable List & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Expandable Academic Fleet (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Group 1: Research Tutors */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-4 bg-bridge-blue rounded-full" />
                <h3 className="font-serif text-sm font-bold text-bridge-blue-dark tracking-wider">
                  物理与数理科学研究引航组
                </h3>
              </div>

              <div className="border border-stone-200/60 rounded-xl bg-white/40 overflow-hidden divide-y divide-stone-200/40">
                {TUTORS.filter(t => t.group === "research").map((tutor, index) => {
                  const actualIndex = TUTORS.findIndex(t => t.school === tutor.school && t.field === tutor.field);
                  const isExpanded = !!expandedTutors[actualIndex];
                  return (
                    <div key={index} className="transition-colors hover:bg-stone-50/30">
                      {/* Row Header */}
                      <button
                        onClick={() => toggleTutorExpand(actualIndex)}
                        className="w-full py-4 px-5 flex items-center justify-between text-left focus:outline-none"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-serif text-sm font-bold text-stone-850">
                              {tutor.school}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-500 font-serif">
                              {tutor.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-bridge-muted font-serif truncate">
                            研究领域: <span className="text-stone-700 font-semibold">{tutor.field}</span>
                          </div>
                        </div>

                        {/* Plus/Minus Indicator */}
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-stone-300 text-stone-500 text-sm font-mono transition-transform duration-300">
                          {isExpanded ? "−" : "+"}
                        </div>
                      </button>

                      {/* Expandable Panel */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? "max-h-32 border-t border-stone-100 bg-stone-50/50" : "max-h-0"
                        }`}
                      >
                        <div className="p-4 text-xs text-stone-600 font-serif leading-relaxed italic border-l-2 border-bridge-blue/40 ml-5 my-2">
                          “ {tutor.quote} ”
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Advisor Tutors */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-4 bg-bridge-gold rounded-full" />
                <h3 className="font-serif text-sm font-bold text-bridge-gold tracking-wider">
                  生涯规划与心智成长支持组
                </h3>
              </div>

              <div className="border border-stone-200/60 rounded-xl bg-white/40 overflow-hidden divide-y divide-stone-200/40">
                {TUTORS.filter(t => t.group === "advisor").map((tutor, index) => {
                  const actualIndex = TUTORS.findIndex(t => t.school === tutor.school && t.field === tutor.field);
                  const isExpanded = !!expandedTutors[actualIndex];
                  return (
                    <div key={index} className="transition-colors hover:bg-stone-50/30">
                      {/* Row Header */}
                      <button
                        onClick={() => toggleTutorExpand(actualIndex)}
                        className="w-full py-4 px-5 flex items-center justify-between text-left focus:outline-none"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-serif text-sm font-bold text-stone-850">
                              {tutor.school}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-500 font-serif">
                              {tutor.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-bridge-muted font-serif truncate">
                            规划领域: <span className="text-stone-700 font-semibold">{tutor.field}</span>
                          </div>
                        </div>

                        {/* Plus/Minus Indicator */}
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-stone-300 text-stone-500 text-sm font-mono transition-transform duration-300">
                          {isExpanded ? "−" : "+"}
                        </div>
                      </button>

                      {/* Expandable Panel */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? "max-h-32 border-t border-stone-100 bg-stone-50/50" : "max-h-0"
                        }`}
                      >
                        <div className="p-4 text-xs text-stone-600 font-serif leading-relaxed italic border-l-2 border-bridge-gold/40 ml-5 my-2">
                          “ {tutor.quote} ”
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-bridge-muted font-serif leading-relaxed italic">
              * 为保障一线青年学者的纯粹科研精力，所有导师姓名均进行去人名化处理。预约成功后，将在微信对接时展示具体引航导师详细学术档案。
            </div>

          </div>

          {/* Right Column: Link to full booking page */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <a
              href="/team#consult"
              className="text-bridge-gold hover:text-amber-600 font-serif text-lg tracking-widest border-b-2 border-bridge-gold/40 hover:border-amber-600/60 pb-1 transition-all duration-300"
            >
              预约一对一真人引航 →
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
