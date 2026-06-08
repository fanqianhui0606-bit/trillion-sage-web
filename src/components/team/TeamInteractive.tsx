"use client";

import React, { useState, useRef, useEffect } from "react";
import GlassCard from "@/components/shared/GlassCard";

interface Tutor {
  school: string;
  role: string;
  field: string;
  quote: string;
  tagColor: string;
}

interface TutorGroup {
  id: string;
  name: string;
  desc: string;
  icon: string;
  tutors: Tutor[];
}

const TUTOR_GROUPS: TutorGroup[] = [
  {
    id: "math",
    name: "数学与纯粹逻辑组",
    desc: "极致的公理化追求与拓扑流形逻辑探针",
    icon: "📐",
    tutors: [
      {
        school: "中科院数学所",
        role: "博士在读",
        field: "分析相对论 / 广义相对论引力波",
        quote: "极度质量比旋入 (EMRI) 中的引力波波形，是人类探测时空强引力场几何结构的终极交响乐。",
        tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      },
      {
        school: "中科院数学所",
        role: "博士在读",
        field: "数学物理 / 计算相对论方向",
        quote: "用数值方法在时空网格上重构双黑洞合并过程，是逻辑在强弯曲时空的具象表达。",
        tagColor: "bg-stone-500/10 text-stone-600 border-stone-200/50",
      },
      {
        school: "中科院数学所",
        role: "博士在读",
        field: "数学物理 / 数值广相计算",
        quote: "在差分格点上计算爱因斯坦场方程的波动演化，每一步都是离散与连续的博弈。",
        tagColor: "bg-stone-500/10 text-stone-600 border-stone-200/50",
      },
      {
        school: "中科院数学所",
        role: "博士在读",
        field: "代数与流形几何 / 密码学方向",
        quote: "对称与非对称的安全攻防，是信息论与流形几何交织的数学艺术。",
        tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      }
    ]
  },
  {
    id: "physics",
    name: "理论与应用物理组",
    desc: "黑洞引力、强凝聚态与天体宇宙探测元直觉",
    icon: "🪐",
    tutors: [
      {
        school: "北京大学",
        role: "博士在读",
        field: "凝聚态物理 / 拓扑量子器件",
        quote: "探索晶格缺陷中涌现的量子实在，如同在无声的微观迷宫中寻找宏观对称性的投影。",
        tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
      },
      {
        school: "中科院理论物理所",
        role: "博士在读",
        field: "理论物理 / 全息ADS-CFT对应",
        quote: "将三维空间的重力场全息投影在二维边界上，黑洞的熵可能只是边界量子纠缠的宏观表象。",
        tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      },
      {
        school: "中科院理论物理所",
        role: "博士在读",
        field: "理论物理 / 黑洞引力波理论",
        quote: "物质告诉时空如何弯曲，时空告诉物质如何运动。这简短的二十个字，蕴含着时空最深邃的纯净。",
        tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      },
      {
        school: "中国科学技术大学",
        role: "博士在读",
        field: "超冷原子物理 / 量子相干计算",
        quote: "在微开尔文的极寒中捕获原子的自旋相干，是我们叩开通用量子计算大门的一声轻扣。",
        tagColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      },
      {
        school: "南京大学",
        role: "博士在读",
        field: "柔性电子学 / 强关联电子器件",
        quote: "在柔性分子基底上重新编织电子的流动，是让冰冷的芯片技术拥抱有机生命体的柔美之桥。",
        tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      },
      {
        school: "国家天文台",
        role: "博士在读",
        field: "高能天体物理 / 强重力透镜效应",
        quote: "被超大质量星系偏折的光束，是宇宙在百亿年前寄给今天人类的，带着引力余温的微波信件。",
        tagColor: "bg-violet-500/10 text-violet-600 border-violet-500/20",
      },
      {
        school: "中科院高能所",
        role: "博士在读",
        field: "高能物理计算 / 空间天文探测",
        quote: "捕捉来自百亿光年外的原初宇宙射线，是宇宙在视界边缘留给今天的电磁余温。",
        tagColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      },
      {
        school: "中山大学",
        role: "博士在读",
        field: "计算物理 / 数值引力相对论",
        quote: "用算法模拟引力波的数值演化，是在硅基世界里克隆黑洞对撞的引力相干。",
        tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      },
      {
        school: "武汉大学",
        role: "博士在读",
        field: "物理波形载波 / 电子信息系统",
        quote: "在物理介质中实现高精度的信息载波，是麦克斯韦方程组在日常通信中的完美重现。",
        tagColor: "bg-slate-500/10 text-slate-600 border-slate-200/50",
      },
      {
        school: "中国科学技术大学",
        role: "硕士在读",
        field: "天文学 / 射电天体物理探测",
        quote: "以射电望远镜扫描银河系的边缘，是人类向无穷未知投射的一道引力问候。",
        tagColor: "bg-violet-500/10 text-violet-600 border-violet-500/20",
      },
      {
        school: "湖南师范大学",
        role: "博士在读",
        field: "计算相对论 / 强引力场数值模拟",
        quote: "以格点计算模拟强重力场演化，将繁杂的广义相对论方程在超级计算机中收敛为数值波形。",
        tagColor: "bg-stone-500/10 text-stone-600 border-stone-200/50",
      },
      {
        school: "兰州大学",
        role: "博士在读",
        field: "凝聚态物理 / 磁性纳米材料",
        quote: "微观自旋的无序到有序，是电子关联系统在局部降低系统熵的磁性相变过程。",
        tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
      },
      {
        school: "中国工程物理研究院",
        role: "博士在读",
        field: "量子场论 / 基础引力理论",
        quote: "将引力场量子化并探索超对称作用，是人类攀爬终极统一理论的逻辑长征。",
        tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      },
      {
        school: "国家天文台",
        role: "博士在读",
        field: "引力波理论 / 黑洞微扰学",
        quote: "引力波的干涉条纹，是千亿光年外黑洞并合事件跨越时空阻尼送达的引力签名。",
        tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      }
    ]
  },
  {
    id: "biology",
    name: "生化与前沿材料组",
    desc: "湿实验负熵秩序构建、细胞代谢与高分子化学阻力分析",
    icon: "🧬",
    tutors: [
      {
        school: "清华大学",
        role: "博士在读",
        field: "生物化学与分子生物学 / 细胞代谢调控与负熵构建",
        quote: "在起伏的自由能势垒和酶催化过渡态中，生命用完美的负熵机制对抗着宇宙的热寂。",
        tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      },
      {
        school: "北京大学",
        role: "博士在读",
        field: "化学基因组学 / 小分子药物靶点与分子反应动力学",
        quote: "小分子与蛋白质受体的靶向识别，是微观化学动力学与拓扑几何契合的微观交响。",
        tagColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      },
      {
        school: "清华大学",
        role: "硕士在读",
        field: "结构生物学 / 冷冻电镜与生物大分子拓扑重构",
        quote: "在接近绝对零度的冰冻中捕捉大分子的三维衍射，冷冻电镜帮我们在原子分辨率重构生命的动态机械模型。",
        tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      },
      {
        school: "中国农业大学",
        role: "博士在读",
        field: "生物合成学 / 代谢流 analysis",
        quote: "设计底盘细胞的代谢通路，是人工制造局部负熵、重构生命信息流的湿实验创世纪。",
        tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      },
      {
        school: "兰州大学 & 航天501所",
        role: "硕士在读",
        field: "材料科学 / 航天轻质特种材料",
        quote: "在极端空间阻力环境下，通过合金原子错位设计，构筑航天器特种轻质防热结构。",
        tagColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      },
      {
        school: "兰州大学",
        role: "博士在读",
        field: "无机材料 / 稀土发光材料",
        quote: "稀土离子的能级跃迁与荧光自组织，是用原子轨道能带微调去精准捕捉光子能量的物理化学桥梁。",
        tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      }
    ]
  },
  {
    id: "algorithm",
    name: "计算与算法科学组",
    desc: "图灵限界限界、分布式并行演变与算法复杂度压缩",
    icon: "💻",
    tutors: [
      {
        school: "中科院数学所",
        role: "博士后",
        field: "数学物理 / 数值计算相对论算法",
        quote: "将连续物理场映射为格点离散算法，解决强引力场的数值奇异性，是算法在极端时空的极限测试。",
        tagColor: "bg-stone-500/10 text-stone-600 border-stone-200/50",
      },
      {
        school: "中科院数学所",
        role: "博士在读",
        field: "数学物理 / 强引力场数值并行求解",
        quote: "用数值求解爱因斯坦引力方程，算法的每一次迭代，都是硅基逻辑对弯曲时空实在的逼近。",
        tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      },
      {
        school: "中科院数学所",
        role: "博士在读",
        field: "计算机应用 / 高性能并行计算",
        quote: "以分布式并行计算求解时空偏微分方程，用算法力量重塑两个黑洞并合时的三维波形。",
        tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      },
      {
        school: "中科院数学所",
        role: "博士在读",
        field: "应用数学 / 密码学与计算复杂度",
        quote: "用可计算复杂度理论设计加密体系，在图灵限界之内为信息流建立起逻辑防火墙。",
        tagColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      }
    ]
  }
];

const FIELDS_OPTIONS = [
  { id: "physics", label: "物理学 (理论/凝聚态/天体物理)" },
  { id: "math", label: "数学 (纯数/应用数学/分析)" },
  { id: "life", label: "生化分子与生命科学" },
  { id: "cs", label: "计算机与计算科学 (算法/人工智能)" },
  { id: "chem", label: "材料与微纳化学" },
  { id: "inter", label: "前沿交叉学科 (如数理金融、量子计算)" },
];

export default function TeamInteractive() {
  // Accordion state - keeps track of which group is expanded
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>("math");
  const [expandedTutorKey, setExpandedTutorKey] = useState<string | null>(null);

  // Booking Form State
  const [studentName, setStudentName] = useState("");
  const [contact, setContact] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [concern, setConcern] = useState("");
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "simulating" | "success">("idle");
  const [appointmentId, setAppointmentId] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Field selection toggle
  const toggleField = (id: string) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
    setExpandedTutorKey(null); // Reset sub-tutor expand state when switching groups
  };

  // Generate mock appointment ID
  const generateAppointmentId = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TS-${dateStr}-${rand}`;
  };

  // Submit Handler calling real API endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !contact.trim() || !grade || selectedFields.length === 0) {
      alert("请填写完整的预约信息（姓名、联系方式、年级并至少选择一个学科）");
      return;
    }

    setIsSubmitting(true);
    setSubmitPhase("simulating");

    const apptId = generateAppointmentId();
    setAppointmentId(apptId);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          contact: contact.trim(),
          grade,
          selectedFields,
          concern: concern.trim(),
          appointmentId: apptId,
        }),
      });

      if (!res.ok) throw new Error("预约保存失败");
      
      // Delay slightly to allow simulation animation
      setTimeout(() => {
        setSubmitPhase("success");
        setIsSubmitting(false);
      }, 2500);

    } catch (err) {
      console.error(apptId, err);
      alert("提交预约接口失败，请检查网络后再试");
      setIsSubmitting(false);
      setSubmitPhase("idle");
    }
  };

  // Canvas interference wave during success/simulation
  useEffect(() => {
    if (submitPhase === "idle") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let h = (canvas.height = 220);

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = canvas.parentElement?.clientWidth || 600;
      h = canvas.height = 220;
    };
    window.addEventListener("resize", handleResize);

    const stars: { x: number; y: number; speed: number; amp: number; phase: number; r: number; color: string }[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 0.5 + Math.random() * 1.5,
        amp: 5 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
        r: Math.random() * 1.8 + 0.4,
        color: Math.random() > 0.4 ? "rgba(197, 160, 89, 0.7)" : "rgba(46, 117, 182, 0.6)",
      });
    }

    let phase = 0;

    const render = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.15)"; 
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      phase += 0.045;
      ctx.lineWidth = 1.5;

      ctx.strokeStyle = "rgba(197, 160, 89, 0.65)";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.015 + phase) * 25 + Math.sin(x * 0.005 - phase * 0.7) * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(46, 117, 182, 0.55)";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.cos(x * 0.018 - phase * 0.8) * 22 + Math.sin(x * 0.008 + phase * 0.5) * 12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (const s of stars) {
        s.x += s.speed;
        if (s.x > w) s.x = 0;
        
        const waveY = h / 2 + Math.sin(s.x * 0.015 + phase) * 20;
        const currentY = waveY + Math.sin(phase * 1.5 + s.phase) * s.amp;

        ctx.fillStyle = s.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, currentY, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [submitPhase]);

  return (
    <div className="space-y-16">
      
      {/* 1. Accordion Tutor groups */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-xs text-bridge-muted font-serif tracking-widest uppercase mb-1">Tutor Roster</p>
          <h2 className="text-xl md:text-2xl font-serif text-bridge-blue-dark font-bold tracking-wider">
            科学导师团队成员
          </h2>
        </div>

        {TUTOR_GROUPS.map((group) => {
          const isExpanded = expandedGroupId === group.id;
          return (
            <div 
              key={group.id} 
              className="border border-white/60 bg-white/20 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/30 transition-all focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span>
                  <div>
                    <h3 className="font-serif text-sm md:text-base font-bold text-stone-850 tracking-wider">
                      {group.name}
                    </h3>
                    <p className="text-[10px] md:text-xs text-bridge-muted font-serif tracking-wide mt-0.5">
                      {group.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-bridge-blue bg-bridge-blue/10 px-2 py-0.5 rounded-full font-semibold">
                    {group.tutors.length}位导师
                  </span>
                  <span className={`text-stone-500 text-xs transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-6 border-t border-stone-200/40 bg-stone-50/30 animate-slide-down">
                  <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                    {group.tutors.map((tutor, idx) => {
                      const tutorKey = `${group.id}_${idx}`;
                      const isTutorExpanded = expandedTutorKey === tutorKey;
                      
                      // 解析大方向和小方向
                      const fieldParts = tutor.field.split(" / ");
                      const mainField = fieldParts[0];
                      const subField = fieldParts[1] || "";
                      
                      return (
                        <GlassCard 
                          key={idx} 
                          className="border border-white/50 hover:border-bridge-gold/30 hover:shadow-sm transition-all duration-300 p-4 relative overflow-hidden group cursor-pointer"
                          onClick={() => setExpandedTutorKey(isTutorExpanded ? null : tutorKey)}
                        >
                          <div className="absolute -right-10 -bottom-10 w-20 h-20 bg-bridge-blue/5 rounded-full group-hover:bg-bridge-gold/5 transition-all duration-700 blur-xl" />
                          
                          {/* Row Header */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 flex-1">
                              <h4 className="font-serif text-sm md:text-base font-bold text-stone-850 tracking-wider min-w-[120px]">
                                {tutor.school}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] md:text-xs text-bridge-blue font-serif font-semibold bg-bridge-blue/5 px-2 py-0.5 rounded border border-bridge-blue/10">
                                  {mainField}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-serif border ${tutor.tagColor}`}>
                                {tutor.role}
                              </span>
                              <span className={`text-stone-400 text-xs transition-transform duration-300 ${isTutorExpanded ? "rotate-180" : ""}`}>
                                ▼
                              </span>
                            </div>
                          </div>
                          
                          {/* Second Level Accordion Content */}
                          {isTutorExpanded && (
                            <div className="mt-4 pt-3 border-t border-stone-200/40 animate-slide-down text-left select-none">
                              {subField && (
                                <p className="text-[10px] md:text-xs text-stone-500 font-serif leading-relaxed">
                                  <strong className="text-stone-700">细分研究方向：</strong>{subField}
                                </p>
                              )}
                              <p className="text-xs text-stone-600 leading-relaxed font-serif pt-2.5 italic border-l-2 border-bridge-gold/30 pl-3 bg-amber-50/15 rounded-r mt-2">
                                “{tutor.quote}”
                              </p>
                            </div>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Booking Section (#consult) */}
      <div id="consult" className="pt-8 scroll-mt-24">
        <GlassCard className="border border-bridge-gold/30 shadow-[0_4px_24px_rgba(197,160,89,0.06)] bg-gradient-to-b from-amber-50/10 to-transparent p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-bridge-gold/15 text-bridge-gold text-[9px] font-serif tracking-widest px-4 py-1.5 uppercase rounded-bl border-l border-b border-bridge-gold/20 select-none animate-pulse">
            1v1 星轨引航申请舱
          </div>

          {submitPhase === "idle" || submitPhase === "simulating" ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="font-serif text-xl md:text-2xl text-amber-900 tracking-widest font-bold">
                  预约 1v1 真人导师深度导航
                </h3>
                <p className="text-xs md:text-sm text-bridge-muted leading-relaxed mt-2 font-serif">
                  破除大学数理科研与升学信息差。导师将结合您的素质报告或聊天轨迹，进行 2 次 45 分钟的深度通话。
                </p>
              </div>

              {submitPhase === "simulating" ? (
                <div className="py-12 flex flex-col items-center justify-center gap-6">
                  <div className="relative w-full max-w-lg bg-[#0f172a] rounded-xl overflow-hidden border border-bridge-gold/30">
                    <canvas ref={canvasRef} className="w-full block" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 text-center px-4">
                      <div className="w-6 h-6 border-2 border-bridge-gold border-t-transparent rounded-full animate-spin" />
                      <span className="font-serif text-xs text-bridge-gold tracking-widest animate-pulse">
                        正在分析思维干涉波形，配置最契合的清北硕博导师组...
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-serif text-bridge-muted animate-pulse">
                    物理星探已在匹配队列，请稍候。
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-serif text-stone-700 tracking-widest">
                        来访学生/家长称呼 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="例：张同学 或 李妈妈"
                        className="px-4 py-2 bg-white/70 border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-sm font-sans"
                      />
                    </div>

                    {/* Contact input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-serif text-stone-700 tracking-widest">
                        联系电话 / 微信 ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="微信ID优先，方便助理建群对接"
                        className="px-4 py-2 bg-white/70 border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* Grade dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-serif text-stone-700 tracking-widest">
                      当前所处学业阶段 <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="px-4 py-2 bg-white/70 border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-sm font-serif text-stone-700"
                    >
                      <option value="">-- 请选择您的年级阶段 --</option>
                      <option value="high1">高中一年级（新高考选科探索中）</option>
                      <option value="high2">高中二年级（数理物理拔高/遭遇瓶颈）</option>
                      <option value="high3">高中三年级（高考冲刺/强基计划规划）</option>
                      <option value="graduated">高考毕业生（正处于专业志愿填报/衔接期）</option>
                      <option value="college">大学低年级（面临专业分流或科研保研焦虑）</option>
                      <option value="parent">家长代填（为孩子寻求长线升学规划）</option>
                    </select>
                  </div>

                  {/* Fields checkboxes */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-serif text-stone-700 tracking-widest">
                      偏好或想要对话的数理大方向（可多选） <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FIELDS_OPTIONS.map((field) => (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => toggleField(field.id)}
                          className={`px-4 py-2 border rounded text-left transition-all duration-300 text-xs font-serif flex items-center justify-between
                            ${
                              selectedFields.includes(field.id)
                                ? "bg-amber-500/10 border-bridge-gold text-amber-950 font-bold"
                                : "bg-white/40 border-stone-200 text-stone-600 hover:bg-white/70"
                            }
                          `}
                        >
                          <span>{field.label}</span>
                          {selectedFields.includes(field.id) && (
                            <span className="text-bridge-gold text-xs">✦</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Concern textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-serif text-stone-700 tracking-widest">
                      学业现状 / 遭遇的最核心瓶颈描述（选填）
                    </label>
                    <textarea
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                      placeholder="例：孩子平时做难题很有灵性，但总觉得做普通作业无聊，考试马虎。或者：对大学里的理论物理方向非常憧憬，但不太了解真实的学术环境和日常科研到底在做什么..."
                      rows={3}
                      className="px-4 py-2.5 bg-white/70 border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-sm font-sans"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="text-center pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-bridge-gold text-white rounded font-serif tracking-[0.2em] text-sm hover:bg-amber-600 transition-all shadow-[0_4px_16px_rgba(197,160,89,0.25)] disabled:opacity-50 cursor-pointer"
                    >
                      提交星轨预约
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            // Success view with WeChat assistant guide
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6 animate-scale-in">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-bridge-gold/40 shadow-[0_0_15px_rgba(197,160,89,0.2)]">
                <span className="text-2xl text-bridge-gold">✦</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-serif text-xl md:text-2xl text-amber-900 tracking-widest font-bold">
                  星轨引航预约成功
                </h3>
                <span className="inline-block font-mono text-xs text-bridge-gold border border-bridge-gold/30 bg-amber-50/5 px-3 py-1 rounded select-all font-semibold tracking-wider">
                  预约工单单号：{appointmentId}
                </span>
              </div>

              {/* Simulation Graph */}
              <div className="w-full max-w-lg bg-[#0f172a] rounded-xl overflow-hidden border border-bridge-gold/30 p-2">
                <canvas ref={canvasRef} className="w-full block rounded-lg" />
              </div>

              <div className="bg-stone-50/80 p-6 rounded-lg border border-stone-200/40 text-stone-700 max-w-lg text-xs md:text-sm leading-relaxed text-justify space-y-3 font-serif">
                <p>
                  <strong>尊敬的 {studentName}：</strong>
                </p>
                <p>
                  系统已记录您的 1v1 学术引航申请，检测到您选择偏好：【{selectedFields.map(f => FIELDS_OPTIONS.find(o => o.id === f)?.label.split(" (")[0]).join("、")}】。
                </p>
                <p className="text-amber-900 font-bold bg-amber-500/5 p-3 rounded border border-amber-500/15">
                  👉 <strong>下一步对接：</strong><br />
                  请立即复制您的预约单号，并添加主理人助理微信：<code className="bg-white px-2 py-0.5 rounded font-mono text-xs select-all text-bridge-gold border border-stone-200">13360455457</code>，备注您的称呼与单号。助理将在微信上为您建立专属对话群，并排期腾讯会议时间。
                </p>
              </div>

              <button
                onClick={() => setSubmitPhase("idle")}
                className="px-6 py-2 border border-stone-300 hover:border-stone-500 text-stone-500 hover:text-stone-700 text-xs font-serif tracking-widest rounded transition-all bg-white/50 cursor-pointer"
              >
                重新填写预约
              </button>
            </div>
          )}
        </GlassCard>
      </div>

    </div>
  );
}
