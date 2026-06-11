"use client";

import React, { useState } from "react";

interface Tutor {
  school: string;
  role: string;
  field: string;
  quote: string;
  tagColor: string;
}

const TUTORS: Tutor[] = [
  { school: "北京大学", role: "博士在读", field: "凝聚态物理", tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20", quote: "探索晶格缺陷中涌现的量子实在，如同在无声的微观迷宫中寻找宏观对称性的投影。" },
  { school: "北京大学", role: "博士毕业", field: "临床心理学", tagColor: "bg-rose-500/10 text-rose-600 border-rose-500/20", quote: "心理测评不是给人贴标签，而是在混沌的情绪场中为来访者找到第一根可以倚靠的认知锚点。" },
  { school: "清华大学", role: "博士在读", field: "数学 / 代数几何", tagColor: "bg-violet-500/10 text-violet-600 border-violet-500/20", quote: "概形上的层与上同调，是代数几何在交换环谱上重建拓扑直觉的逻辑利刃。" },
  { school: "清华大学", role: "博士在读", field: "化学 / 有机化学", tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", quote: "在分子尺度上设计功能材料的电子结构，是从原子轨道对称性出发重构宏观物性的化学炼金术。" },
  { school: "中科院数学所", role: "博士在读", field: "数学物理 / 计算相对论", tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", quote: "用数值方法在时空网格上重构双黑洞合并过程，是逻辑在强弯曲时空的具象表达。" },
  { school: "中科院数学所", role: "博士后", field: "数学物理 / 数值计算相对论", tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", quote: "将连续物理场映射为格点离散算法，解决强引力场的数值奇异性。" },
  { school: "中科院理论物理所", role: "博士在读", field: "理论物理 / 全息ADS-CFT对应", tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", quote: "将三维空间的重力场全息投影在二维边界上，黑洞的熵可能只是边界量子纠缠的宏观表象。" },
  { school: "国家天文台", role: "博士在读", field: "引力波理论 / 黑洞物理", tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", quote: "引力波的干涉条纹，是千亿光年外黑洞并合事件跨越时空阻尼送达的引力签名。" },
  { school: "中国科学技术大学", role: "硕士在读", field: "天文学 / 射电天体物理探测", tagColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", quote: "以射电望远镜扫描银河系的边缘，是人类向无穷未知投射的一道引力问候。" },
  { school: "中山大学", role: "博士在读", field: "计算物理 / 数值引力相对论", tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", quote: "用算法模拟引力波的数值演化，是在硅基世界里克隆黑洞对撞的引力相干。" },
  { school: "武汉大学", role: "博士在读", field: "电子信息 / 半导体物理", tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20", quote: "从量子阱到异质结，半导体能带工程设计是现代芯片的灵魂。" },
  { school: "南京大学", role: "博士在读", field: "柔性电子学 / 新型材料", tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", quote: "在柔性分子基底上重新编织电子的流动，是让冰冷的芯片技术拥抱有机生命体的柔美之桥。" },
  { school: "湖南师范大学", role: "博士在读", field: "计算相对论 / 数值模拟", tagColor: "bg-stone-500/10 text-stone-600 border-stone-200/50", quote: "以格点计算模拟强重力场演化，将繁杂的广义相对论方程在超级计算机中收敛为数值波形。" },
  { school: "兰州大学 & 中科院数学所", role: "硕士毕业", field: "分析相对论 / 天文", tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", quote: "从相对论到天体物理，数学与物理的交叉是理解宇宙最优雅的路径。" },
  { school: "兰州大学 & 中科院理论所", role: "博士在读", field: "理论物理 / 全息引力", tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", quote: "全息原理认为三维空间的信息完全存储在二维边界上。" },
  { school: "兰州大学 & 中科院理论所", role: "博士在读", field: "理论物理 / 广相与引力波", tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", quote: "引力波是弯曲时空中传播的涟漪，是宇宙最深处发出的震动信号。" },
  { school: "兰州大学", role: "博士在读", field: "凝聚态物理 / 磁性材料", tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20", quote: "微观自旋的无序到有序，是电子关联系统在局部降低系统熵的磁性相变过程。" },
  { school: "兰州大学 & 航天501所", role: "硕士在读", field: "材料科学 / 航天材料", tagColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", quote: "在极端空间环境下，通过合金原子错位设计，构筑航天器特种轻质防热结构。" },
  { school: "兰州大学", role: "博士在读", field: "无机材料 / 稀土发光材料", tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", quote: "稀土离子的能级跃迁与荧光自组织，是用原子轨道能带微调去精准捕捉光子能量。" },
  { school: "中国工程物理研究院", role: "博士在读", field: "量子场论 / 基础引力理论", tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", quote: "将引力场量子化并探索超对称作用，是人类攀爬终极统一理论的逻辑长征。" },
  { school: "中科院高能所", role: "博士在读", field: "高能物理计算 / 空间天文探测", tagColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", quote: "捕捉来自百亿光年外的原初宇宙射线，是宇宙在视界边缘留给今天的电磁余温。" },
  { school: "中国农业大学", role: "博士在读", field: "生物合成学 / 代谢流分析", tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", quote: "设计底盘细胞的代谢通路，是人工制造局部负熵、重构生命信息流的湿实验创世纪。" },
  { school: "同济大学", role: "硕士毕业", field: "土木工程 / 结构设计", tagColor: "bg-slate-500/10 text-slate-600 border-slate-200/50", quote: "七年的行业实践教会我：最优雅的结构不是最复杂的，而是用最少的材料承受最大荷载的那一个。" },
  { school: "爱丁堡大学", role: "硕士毕业", field: "金融科技 / 计算机", tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", quote: "从代码到资本市场的映射，是用图灵机语言在不确定性中寻找可计算套利边界的知识转译。" },
  { school: "麦考瑞大学 & 悉尼大学", role: "硕士毕业", field: "金融 / 会计 / 数据科学", tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", quote: "跨学科的学习路径从来不是笔直的公路，而是在不同学科版图间反复测绘、发现最短路程的探索者之旅。" },
];
const INITIAL_COUNT = 8;

export default function ConsultationSection() {
  const [showAll, setShowAll] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const displayTutors = showAll ? TUTORS : TUTORS.slice(0, INITIAL_COUNT);

  return (
    <section id="consultation" className="py-24 px-6 relative overflow-hidden bg-stone-50/30">
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-bridge-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-serif rounded-md bg-amber-500/10 text-amber-700 font-semibold mb-3 tracking-widest uppercase">
            1v1 Academic Mentorship
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-bridge-text leading-tight tracking-wider">
            预约一对一真人引航
          </h2>
          <p className="mt-4 text-bridge-muted leading-relaxed max-w-xl mx-auto font-serif text-xs md:text-sm">
            匹配来自清华大学、北京大学、中国科学技术大学等顶尖高校的一线理科博士/硕士导师团队。
          </p>
        </div>

        {/* Expandable Tutor List */}
        <div className="border border-stone-200/60 rounded-xl bg-white/40 overflow-hidden divide-y divide-stone-200/40">
          {displayTutors.map((tutor, idx) => {
            const isExpanded = expandedIdx === idx;
            return (
              <div key={idx} className="transition-colors hover:bg-stone-50/30">
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className="w-full py-4 px-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-sm font-bold text-stone-850">{tutor.school}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-500 font-serif">{tutor.role}</span>
                    </div>
                    <div className="text-[11px] text-bridge-muted font-serif truncate">
                      <span className="text-stone-700 font-semibold">{tutor.field}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-stone-300 text-stone-500 text-sm font-mono transition-transform duration-300">
                    {isExpanded ? "−" : "+"}
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-h-32 border-t border-stone-100 bg-stone-50/50" : "max-h-0"
                }`}>
                  <div className="p-4 text-xs text-stone-600 font-serif leading-relaxed italic border-l-2 border-bridge-blue/40 ml-5 my-2">
                    “ {tutor.quote} ”
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-bridge-muted font-serif leading-relaxed italic mt-4 text-center">
          * 为保障一线青年学者的纯粹科研精力，所有导师姓名均进行去人名化处理。
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 mt-8">
          {TUTORS.length > INITIAL_COUNT && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-bridge-blue hover:text-bridge-blue-dark font-serif text-sm tracking-wider border-b border-bridge-blue/30 hover:border-bridge-blue-dark transition-all"
            >
              {showAll ? "收起导师 ↑" : "展开全部导师 ↓"}
            </button>
          )}
          <a
            href="/team"
            className="text-bridge-gold hover:text-amber-600 font-serif text-base tracking-widest border-b-2 border-bridge-gold/40 hover:border-amber-600/60 pb-1 transition-all duration-300"
          >
            预约一对一引航 →
          </a>
        </div>
      </div>
    </section>
  );
}
