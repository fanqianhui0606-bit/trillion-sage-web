"use client";

import React, { useState } from "react";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";

interface Product {
  name: string;
  desc: string;
  tag: string;
  price: string;
  unit: string;
}

interface Package {
  name: string;
  price: string;
  popular?: boolean;
  recommended?: boolean;
  features: string[];
}

interface TimelineStep {
  num: string;
  title: string;
  desc: string;
  by: string;
  details: string; // Additional professional details shown when expanded
}

interface TimelineGroup {
  stage: string;
  duration: string;
  textColor: string;
  dotColor: string;
  steps: TimelineStep[];
}

const INDIVIDUAL_PRODUCTS: Product[] = [
  {
    name: "一对一导师咨询",
    desc: "由清华、北大、科大等顶级理科方向的博士/硕士学长学姐进行 1v1 深度在线答疑，解答大学专业学习、学科底层逻辑及前沿方向，避免因信息差导致志愿决策失误。",
    tag: "名额按期约满即止",
    price: "1500",
    unit: "次"
  },
  {
    name: "思维共振【专业版报告】",
    desc: "深度 42 题素质检测 + AI 高维挑衅灵魂聊天，生成《14维思维干涉波形与引力星尘报告》，并包含偏差诱导解读与一键大客户通道。",
    tag: "全自动化生成 + 专家库模板比对",
    price: "499",
    unit: "份"
  },
  {
    name: "数理前沿学术衔接营",
    desc: "聚焦半导体、引力波天文学、量子计算、生物计算等最具发展前景的数理科学，由清北硕博团队进行 8 周线上小班制授课与科研启发。",
    tag: "暑期营 / 寒假营限额招募",
    price: "2500",
    unit: "期"
  }
];

const PACKAGES: Package[] = [
  {
    name: "水晶衔接套餐",
    price: "1999",
    features: [
      "思维共振【专业报告】与 Top5 专业推荐",
      "理科硕博导师 1v1 在线深度咨询 (1次)",
      "针对指定高校或具体细分学科答疑，破除信息差",
      "提供详细会议录音、文字整理及导师亲笔手书的 LaTeX 学术建议"
    ]
  },
  {
    name: "白银引航套餐",
    price: "2499",
    popular: true,
    features: [
      "思维共振【专业报告】与 Top5 专业推荐",
      "理科硕博导师 1v1 在线深度咨询 (1次)",
      "针对指定高校或具体细分学科答疑，破除信息差",
      "千殊联盟北大资深心理导师 1v1 心理疏导与未来规划 (1次)",
      "有效缓和高中高压状态下的学业焦虑，保驾护航"
    ]
  },
  {
    name: "黄金长线跟踪套餐",
    price: "4799",
    recommended: true,
    features: [
      "思维共振【专业报告】与 Top5 专业推荐",
      "理科硕博导师 1v1 在线追踪咨询 (3次)",
      "长线跨周期跟踪，辅助学生攻克自主科研与方向迷茫",
      "千殊联盟北大资深心理导师 1v1 心理规划与焦虑释读 (1次)",
      "建立千殊专属社群，导师与助教长期在线陪伴解答"
    ]
  }
];

const TIMELINES: TimelineGroup[] = [
  {
    stage: "A. 前期建档与意愿确认",
    duration: "1 - 2 个工作日",
    textColor: "text-amber-600 border-amber-200/50",
    dotColor: "bg-bridge-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]",
    steps: [
      {
        num: "A-1",
        title: "初次建档沟通",
        desc: "与主理人助理进行初次微信通话，沟通学生的基本选科、平时分数、及对理科方向的自主期望。",
        by: "双方对接",
        details: "我们将使用结构化信息模板建立学生的专属档案库，并在阿里云安全云端隔离存储，以保护学生隐私。"
      },
      {
        num: "A-2",
        title: "挑选并锁定套餐",
        desc: "根据学情推荐最契合的导航包。支付 10% 锁定定金后，正式录入该期咨询名额储备库。",
        by: "家长确认",
        details: "白银与黄金套餐内包含的北大心理专家通话名额受限于时间窗口，定金一经锁定即启动专家排期安排。"
      },
      {
        num: "A-3",
        title: "学生自主参与知情",
        desc: "由于本计划涉及深度的数理逻辑交互与直觉挖掘，需要学生本人确认自愿参与，破除‘被动应试’的心理边界。",
        by: "学生勾选",
        details: "我们认为‘被动强加’的测评是无效的。如果学生强烈反抗，我们将在本步骤终止服务，全额退还定金。"
      }
    ]
  },
  {
    stage: "B. 过程融合与深度咨询",
    duration: "1 - 3 周（视约定的会议时间）",
    textColor: "text-bridge-blue-dark border-blue-200/50",
    dotColor: "bg-bridge-blue shadow-[0_0_8px_rgba(46,117,182,0.5)]",
    steps: [
      {
        num: "B-1",
        title: "精准指派匹配导师",
        desc: "我方在千殊 985 硕博库中指派最对口的科研导师。确定腾讯会议通话时间，并请学生提前提交 3 个核心困惑。",
        by: "我方协调",
        details: "匹配算法会考虑学生的 14 维兴趣测验数据。例如，若测验在「物理分析」和「计算理论」维度较高，我们将指派主要研究黑洞引力波或强基计划出身的 PhD 导师组。"
      },
      {
        num: "B-2",
        title: "数理素质测验与灵魂对话",
        desc: "学生登录系统完成 42 题素质检测，并在「发掘你的光」空间与物理、算法等 AI 角色进行 10 轮盲测对弈。",
        by: "学生参与",
        details: "后台 Agent 会自动对比量表结果与灵魂对话的语义偏好。若发现「逻辑稳定但直觉极为跳跃」等偏差，将作为重点分析对象写入导学报告中。"
      },
      {
        num: "B-3",
        title: "1v1 导师在线腾讯会议咨询",
        desc: "正式进行 1v1 语音/视频会议。导师基于双重报告为学生复盘大学学科真实样貌，指导自主学习计划。",
        by: "导师与学生",
        details: "会议一般由导师主讲 30 分钟，互动答疑 15 分钟。会后 2 个工作日内，我们将整理出 LaTeX 排版的高清建议文档寄给家长。"
      }
    ]
  },
  {
    stage: "C. 结案与长期陪伴",
    duration: "长线服务",
    textColor: "text-emerald-700 border-emerald-200/50",
    dotColor: "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    steps: [
      {
        num: "C-1",
        title: "结案成果交付",
        desc: "打包发送：14维素质报告 PDF、1v1 咨询录像、 LaTeX 学术建议文档、及大一理科基础预习资料包。",
        by: "我方交付",
        details: "资料包中包含精选的理科衔接书单（如费曼物理学讲义、微积分核心概念阐述等），避开教条课本，直达物理核心。"
      },
      {
        num: "C-2",
        title: "千殊校友社群加入",
        desc: "学生将受邀加入「千殊校友微信社群」，与历届清北科大理科学长学姐以及同类低熵少年保持长线沟通。",
        by: "加入社群",
        details: "群内定期分享高校科研实习机会、前沿学术讲座信息，以及学长学姐在海外攻读 PhD 的求学见闻。"
      }
    ]
  }
];

const SYLLABUS_WEEKS = [
  {
    week: "第 1 - 2 周",
    title: "宇宙的琴弦：引力波天文学与黑洞微扰",
    subtitle: "解密引力波如何成为探测宇宙强引力场几何结构的耳朵",
    topics: [
      "经典时空的崩塌与爱因斯坦广义相对论的几何阐述",
      "强引力场下的黑洞微扰论：Quasi-Normal Modes (QNM) 黑洞合鸣",
      "极度质量比旋入 (EMRI) 物理机制与引力波辐射轨道流形",
      "中国空间引力波探测计划（天琴/太极）与天文学前沿科研"
    ]
  },
  {
    week: "第 3 - 4 周",
    title: "微观的冰封与相干：超冷原子与量子信息",
    subtitle: "在接近绝对零度的极限世界里控制原子的自旋与叠加",
    topics: [
      "热力学第三定律与绝对零度逼近：超冷原子的激光冷却与磁阱捕获",
      "波色-爱因斯坦凝聚 (BEC) 态：宏观量子实在的涌现",
      "自旋相干性与超导量子比特 (Qubit) 的调控动力学",
      "量子退相干与量子纠错原理：叩开通用量子计算大门的钥匙"
    ]
  },
  {
    week: "第 5 - 6 周",
    title: "量子拓荒与实在性：拓扑超导与纳米流形",
    subtitle: "理解拓扑保护如何重构未来的半导体与无损电子学",
    topics: [
      "量子霍尔效应与拓扑绝缘体：晶格能带中的拓扑不变性",
      "马约拉纳费米子 (Majorana Fermion) 与非阿贝尔统计",
      "拓扑超导物理器件：无损耗电子流动在柔性基底上的实现",
      "下一代纳米器件在半导体光刻及高密度存储中的理论极限"
    ]
  },
  {
    week: "第 7 - 8 周",
    title: "生命系统的逻辑骨架：计算生物学与交叉流形",
    subtitle: "当严密的数理逻辑与大模型工具撞击复杂的生命序列",
    topics: [
      "从物理视角看生命：薛定谔的《生命是什么》与局部低熵物理模型",
      "基因序列的矩阵表示：使用傅里叶变换与余弦相似度解读生物密码",
      "AlphaFold 等深度结构预测背后的图神经网络 (GNN) 物理表征",
      "大语言模型在生物信息流解译与非标靶向药物分子设计中的前沿应用"
    ]
  }
];

export default function ProgramsInteractive() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  const toggleStepDetails = (num: string) => {
    setActiveStep((prev) => (prev === num ? null : num));
  };

  return (
    <div className="space-y-20">
      
      {/* SECTION 1: Package Grid */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1.5 h-6 bg-bridge-blue rounded-full" />
          <h3 className="font-serif text-lg md:text-xl font-bold text-bridge-blue-dark tracking-widest">
            一、 咨询与导向套餐
          </h3>
          <span className="text-xs font-serif text-bridge-muted bg-white/40 px-2 py-0.5 rounded border border-white/60">
            精细定价与高标交付
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative rounded-xl border p-6 flex flex-col justify-between transition-all duration-500 backdrop-blur-md group
                ${pkg.popular 
                  ? 'border-bridge-gold bg-amber-500/10 shadow-[0_0_24px_rgba(197,160,89,0.18)] scale-[1.03] text-stone-850' 
                  : pkg.recommended
                    ? 'border-bridge-blue/40 bg-bridge-blue/5 shadow-[0_0_24px_rgba(46,117,182,0.12)] text-stone-850 hover:border-bridge-blue'
                    : 'border-white/40 bg-white/20 hover:border-stone-300 text-stone-850 shadow-glass'
                }
              `}
            >
              {pkg.popular && (
                <span className="absolute -top-3.5 left-6 px-3 py-1 bg-gradient-to-r from-amber-600 to-bridge-gold text-white text-[9px] font-serif font-extrabold tracking-widest uppercase rounded-full shadow-[0_4px_10px_rgba(197,160,89,0.3)] animate-pulse">
                  年度推荐 · 强力引航
                </span>
              )}
              {pkg.recommended && (
                <span className="absolute -top-3.5 left-6 px-3 py-1 bg-gradient-to-r from-bridge-blue to-sky-600 text-white text-[9px] font-serif font-extrabold tracking-widest uppercase rounded-full shadow-[0_4px_10px_rgba(46,117,182,0.2)]">
                  长线跟踪 · 科研推荐
                </span>
              )}

              <div>
                <h4 className="text-xl font-bold text-stone-850 font-serif mb-2 pt-2 tracking-wider flex items-center gap-2">
                  {pkg.name}
                  {pkg.popular && <span className="text-bridge-gold text-xs">✦</span>}
                </h4>
                <div className="flex items-baseline gap-1.5 mb-6 border-b border-stone-200/50 pb-4">
                  <span className="text-3xl font-bold font-mono text-stone-850">￥{pkg.price}</span>
                  <span className="text-xs text-bridge-muted font-serif">/ 套餐全额</span>
                </div>

                <ul className="space-y-4 mb-8 text-xs md:text-sm text-stone-700 font-serif leading-relaxed">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-justify">
                      <span className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full ${pkg.popular ? "bg-bridge-gold" : "bg-bridge-blue"}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-4 border-t border-stone-200/50">
                <Button 
                  href="/team#consult" 
                  variant={pkg.popular ? "primary" : pkg.recommended ? "primary" : "secondary"}
                  className="w-full text-center py-2.5 font-serif text-xs tracking-widest shadow-sm"
                >
                  预约该套餐席位
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-center text-bridge-muted/70 mt-6 font-serif italic">
          * 友情提示：白银/黄金套餐与北大青少年心理辅导团队合作，名额稀缺，请提前在线与助理锁定。
        </p>
      </div>

      {/* SECTION 2: Individual Products */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1.5 h-6 bg-bridge-blue rounded-full" />
          <h3 className="font-serif text-lg md:text-xl font-bold text-bridge-blue-dark tracking-widest">
            二、 科学探索独立项目
          </h3>
          <span className="text-xs font-serif text-bridge-muted bg-white/40 px-2 py-0.5 rounded border border-white/60">
            按需选择单项服务
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {INDIVIDUAL_PRODUCTS.map((prod) => (
            <GlassCard key={prod.name} className="flex flex-col h-full justify-between p-6 border border-white/45 hover:border-bridge-blue/30 transition-all duration-300">
              <div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/30 border border-stone-200 text-stone-600 block w-fit mb-3 font-serif">
                  {prod.tag}
                </span>
                <h4 className="text-base font-bold text-stone-850 font-serif mb-2 tracking-wide">
                  {prod.name}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed text-justify mb-4 font-serif">
                  {prod.desc}
                </p>
              </div>
              <div className="pt-4 border-t border-stone-200/20 flex items-baseline justify-between mt-auto">
                <span className="text-xs text-stone-500 font-serif">单项价格</span>
                <span className="text-lg font-bold font-mono text-bridge-gold">
                  ￥{prod.price} <span className="text-xs font-normal text-stone-500 font-serif">/ {prod.unit}</span>
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* SECTION 3: Syllabus (8-Week Camp) */}
      <div className="scroll-mt-24">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1.5 h-6 bg-bridge-blue rounded-full" />
          <h3 className="font-serif text-lg md:text-xl font-bold text-bridge-blue-dark tracking-widest">
            三、 数理前沿学术衔接营大纲
          </h3>
          <span className="text-xs font-serif text-bridge-muted bg-white/40 px-2 py-0.5 rounded border border-white/60">
            8 周高维启发课程
          </span>
        </div>

        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 border border-white/40 mb-8">
            <p className="text-xs md:text-sm text-stone-700 leading-loose text-justify font-serif">
              <strong>为什么创办此营？</strong> 高考考纲为了普适性，剔除了几乎所有现代物理与数学的前沿概念，导致优秀高中生常产生“做题即科学”的错觉。千殊前沿衔接营，由清华、北大、科大等顶级物理与应用数学博士授课，带你在 8 周内完成一次由中学刷题套路向大学物理直觉的惊艳飞跃。
            </p>
          </GlassCard>

          <div className="space-y-4">
            {SYLLABUS_WEEKS.map((week, idx) => (
              <div 
                key={idx}
                className="bg-white/40 border border-stone-200/40 rounded-xl overflow-hidden shadow-sm hover:border-bridge-blue/40 transition-all duration-300"
              >
                <button
                  onClick={() => setActiveWeek(activeWeek === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-bridge-blue/10 text-bridge-blue-dark w-fit">
                      {week.week}
                    </span>
                    <h4 className="font-serif text-sm md:text-base font-bold text-stone-850 tracking-wider">
                      {week.title}
                    </h4>
                  </div>
                  <span className={`text-stone-400 text-sm transform transition-transform duration-300 ${activeWeek === idx ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {activeWeek === idx && (
                  <div className="px-5 pb-5 border-t border-stone-200/20 pt-4 bg-stone-50/30 animate-fade-in">
                    <p className="text-xs font-serif text-bridge-gold tracking-widest mb-4 italic font-semibold">
                      引航视界：{week.subtitle}
                    </p>
                    <ul className="space-y-3 pl-4 font-serif text-xs md:text-sm text-stone-600">
                      {week.topics.map((topic, i) => (
                        <li key={i} className="list-decimal text-justify leading-relaxed">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Timeline Flow */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1.5 h-6 bg-bridge-gold rounded-full" />
          <h3 className="font-serif text-lg md:text-xl font-bold text-bridge-gold tracking-widest">
            四、 科学导航服务全流程
          </h3>
          <span className="text-xs font-serif text-bridge-muted bg-white/40 px-2 py-0.5 rounded border border-white/60">
            阶段闭环与履约规范
          </span>
        </div>

        <div className="space-y-12 relative pl-6 border-l border-stone-300/40 ml-3 max-w-4xl mx-auto">
          {TIMELINES.map((group) => (
            <div key={group.stage} className="relative">
              
              {/* Left Timeline Glow Dot */}
              <div className="absolute -left-[32px] top-1.5 flex items-center justify-center">
                <div className={`w-3.5 h-3.5 rounded-full ${group.dotColor} ring-4 ring-[#eef0f5]`} />
              </div>

              <div className="mb-6">
                <h4 className="font-serif text-base md:text-lg font-bold text-stone-850 tracking-widest">
                  {group.stage}
                </h4>
                <span className="text-[10px] font-mono text-bridge-muted bg-white/30 px-2 py-0.5 rounded border border-white/50 block w-fit mt-1">
                  控制周期：{group.duration}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {group.steps.map((step) => {
                  const isOpen = activeStep === step.num;
                  return (
                    <GlassCard 
                      key={step.num}
                      className={`p-4 border transition-all duration-300 cursor-pointer select-none
                        ${isOpen 
                          ? "border-bridge-gold/50 bg-amber-500/5 shadow-[0_4px_16px_rgba(197,160,89,0.06)]" 
                          : "border-white/50 bg-white/20 hover:border-stone-300 hover:bg-white/40"
                        }
                      `}
                    >
                      <div 
                        onClick={() => toggleStepDetails(step.num)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/20 pb-2.5 mb-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-bridge-blue/10 text-bridge-blue-dark">
                            {step.num}
                          </span>
                          <h5 className="font-serif text-sm font-bold text-stone-850 tracking-wider">
                            {step.title}
                          </h5>
                        </div>
                        <span className="text-[10px] font-serif text-bridge-gold bg-white/60 px-2.5 py-0.5 rounded border border-white flex items-center gap-1.5">
                          ✦ {step.by}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed text-justify font-serif">
                        {step.desc}
                      </p>

                      {/* Expandable detailed requirements */}
                      {isOpen && (
                        <div className="mt-3 pt-3 border-t border-dashed border-stone-300/40 text-stone-500 text-[11px] md:text-xs font-serif bg-stone-50/20 p-2.5 rounded leading-relaxed animate-slide-up">
                          <strong className="text-bridge-gold">【履约规范与交付细则】</strong>
                          <p className="mt-1">{step.details}</p>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <GlassCard className="border border-amber-500/20 bg-amber-500/5 p-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="font-serif">
          <h4 className="font-bold text-amber-950 text-sm md:text-base tracking-wider">关于定金退还的合规说明</h4>
          <p className="text-xs text-bridge-muted leading-relaxed mt-1 text-justify">
            本计划所收定金均具备法律效力。若因我方排期问题未能及时匹配导师，定金将双倍退还；服务全流程在云端留痕，学生及家长可随时查询并导出状态凭证。
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button href="/team#consult" variant="primary" className="font-serif text-xs tracking-widest whitespace-nowrap">
            立即锁定预约席位
          </Button>
        </div>
      </GlassCard>

    </div>
  );
}
