"use client";

import React, { useState, useRef, useEffect } from "react";
import GlassCard from "@/components/shared/GlassCard";

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
    school: "中科院数学所",
    role: "博士在读",
    field: "分析相对论 / 广义相对论引力波",
    quote: "极度质量比旋入 (EMRI) 中的引力波波形，是人类探测时空强引力场几何结构的终极交响乐。",
    group: "research",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
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
  {
    school: "清华大学",
    role: "顾问导师",
    field: "升学阻抗应对 / 焦虑释读与调适",
    quote: "很多时候，孩子的‘眼高手低’和‘无聊战略应付’，是他们用仅存的灵性在反抗教条化的刷题标准。",
    group: "advisor",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
];

const FIELDS_OPTIONS = [
  { id: "physics", label: "物理学 (理论/凝聚态/天体物理)" },
  { id: "math", label: "数学 (纯数/应用数学/分析)" },
  { id: "life", label: "生命科学 (生物信息/系统生物学)" },
  { id: "cs", label: "计算机与计算科学 (算法/人工智能)" },
  { id: "chem", label: "材料与微纳化学" },
  { id: "inter", label: "前沿交叉学科 (如数理金融、量子计算)" },
];

export default function ConsultationSection() {
  // Expand/collapse states for tutors
  const [expandedTutors, setExpandedTutors] = useState<Record<number, boolean>>({});

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

  const toggleTutorExpand = (index: number) => {
    setExpandedTutors(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleField = (id: string) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const generateAppointmentId = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TS-${dateStr}-${rand}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !contact.trim() || !grade || selectedFields.length === 0) {
      alert("请填写完整的预约信息（姓名、联系方式、年级并至少选择一个学科）");
      return;
    }

    setIsSubmitting(true);
    setSubmitPhase("simulating");

    setTimeout(() => {
      setAppointmentId(generateAppointmentId());
      setSubmitPhase("success");
      setIsSubmitting(false);
    }, 2800);
  };

  // Canvas wave animation
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
      ctx.fillStyle = "rgba(250, 247, 242, 0.15)"; // Soft background color of theme
      ctx.fillRect(0, 0, w, h);

      // Draw mathematical grid coordinate background
      ctx.strokeStyle = "rgba(46, 117, 182, 0.03)";
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

      // Draw interference waves
      phase += 0.04;
      ctx.lineWidth = 1.5;

      // Wave 1: Golden Wave
      ctx.strokeStyle = "rgba(197, 160, 89, 0.55)";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.015 + phase) * 20 + Math.sin(x * 0.005 - phase * 0.7) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Wave 2: Blue Wave
      ctx.strokeStyle = "rgba(46, 117, 182, 0.45)";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.cos(x * 0.018 - phase * 0.8) * 18 + Math.sin(x * 0.008 + phase * 0.5) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (const s of stars) {
        s.x += s.speed;
        if (s.x > w) s.x = 0;
        
        const waveY = h / 2 + Math.sin(s.x * 0.015 + phase) * 15;
        const currentY = waveY + Math.sin(phase * 1.5 + s.phase) * s.amp;

        ctx.fillStyle = s.color;
        ctx.shadowBlur = 2;
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

          {/* Right Column: Appointment Form (5 cols) */}
          <div className="lg:col-span-5">
            <GlassCard className="border border-bridge-gold/30 shadow-[0_4px_20px_rgba(197,160,89,0.06)] bg-white/60 p-6 md:p-8 rounded-xl relative overflow-hidden">
              
              {submitPhase === "idle" || submitPhase === "simulating" ? (
                <div>
                  <div className="mb-6">
                    <h3 className="font-serif text-md md:text-lg text-amber-950 font-bold tracking-wider">
                      申请 1v1 真人导师深度导航
                    </h3>
                    <p className="text-[10px] text-bridge-muted mt-1 leading-relaxed">
                      学长学姐将结合您的思维雷达图或聊天对弈简报，进行 2 次 45 分钟深度解惑与升学指引。
                    </p>
                  </div>

                  {submitPhase === "simulating" ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                      <div className="relative w-full bg-[#FAF7F2] rounded-lg overflow-hidden border border-bridge-gold/20 p-1">
                        <canvas ref={canvasRef} className="w-full block h-28" />
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-bridge-gold border-t-transparent rounded-full animate-spin" />
                          <span className="font-serif text-[10px] text-amber-900 tracking-wider animate-pulse">
                            正在融合思维干涉波形，为您匹配最契合的清北导师组...
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] font-serif text-bridge-muted animate-pulse">
                        预计耗时 3 秒，请静候。
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-serif font-bold text-stone-700 tracking-wider">
                          称呼 <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="例：张同学 或 李妈妈"
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-xs font-sans text-stone-850"
                        />
                      </div>

                      {/* Contact input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-serif font-bold text-stone-700 tracking-wider">
                          联系电话 / 微信 ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          placeholder="微信号优先，方便后续对接"
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-xs font-sans text-stone-850"
                        />
                      </div>

                      {/* Grade dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-serif font-bold text-stone-700 tracking-wider">
                          所处学业阶段 <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-xs font-serif text-stone-750"
                        >
                          <option value="">-- 请选择 --</option>
                          <option value="high1">高中一年级（新高考选科探索中）</option>
                          <option value="high2">高中二年级（数理遭遇瓶颈）</option>
                          <option value="high3">高中三年级（高考/强基计划规划）</option>
                          <option value="graduated">高考毕业生（专业志愿填报期）</option>
                          <option value="college">大学低年级（专业分流或科研焦虑）</option>
                          <option value="parent">家长代填（寻求长线升学规划）</option>
                        </select>
                      </div>

                      {/* Fields checkboxes */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-serif font-bold text-stone-700 tracking-wider">
                          偏好或想要对话的数理大方向（可多选） <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {FIELDS_OPTIONS.map((field) => (
                            <button
                              key={field.id}
                              type="button"
                              onClick={() => toggleField(field.id)}
                              className={`px-2 py-1.5 border rounded text-left transition-all duration-300 text-[10px] font-serif flex items-center justify-between
                                ${
                                  selectedFields.includes(field.id)
                                    ? "bg-amber-500/10 border-bridge-gold text-amber-950 font-bold"
                                    : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"
                                }
                              `}
                            >
                              <span className="truncate">{field.label.split(" (")[0]}</span>
                              {selectedFields.includes(field.id) && (
                                <span className="text-bridge-gold text-[8px]">✦</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Concern textarea */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-serif font-bold text-stone-700 tracking-wider">
                          瓶颈描述 (选填)
                        </label>
                        <textarea
                          value={concern}
                          onChange={(e) => setConcern(e.target.value)}
                          placeholder="例：对量子力学有兴趣，但不确定自己的数理直觉能否支撑以此为业..."
                          rows={2}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-xs font-sans text-stone-850"
                        />
                      </div>

                      {/* Submit button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-2 bg-bridge-gold hover:bg-amber-600 text-white rounded font-serif tracking-widest text-xs transition-all shadow-[0_4px_10px_rgba(197,160,89,0.2)]"
                        >
                          提交引航预约
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                // Success view
                <div className="flex flex-col items-center text-center gap-4 animate-scale-in">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center border border-bridge-gold/30">
                    <span className="text-lg text-bridge-gold">✦</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm text-amber-950 font-bold">星轨预约申请成功</h3>
                    <span className="inline-block font-mono text-[9px] text-bridge-gold border border-bridge-gold/30 bg-amber-500/5 px-2 py-0.5 rounded select-all font-semibold">
                      单号：{appointmentId}
                    </span>
                  </div>

                  <div className="w-full bg-[#FAF7F2] rounded-lg overflow-hidden border border-bridge-gold/20 p-1">
                    <canvas ref={canvasRef} className="w-full block h-24 rounded" />
                  </div>

                  <div className="bg-stone-50/80 p-4 rounded border border-stone-200/40 text-stone-700 text-[10px] leading-relaxed text-left space-y-2 font-serif">
                    <p>已锁定千殊引航预约席位。系统检测到您对【{selectedFields.map(f => FIELDS_OPTIONS.find(o => o.id === f)?.label.split(" (")[0]).join("、")}】的偏好投影。</p>
                    <p>助理将在 <strong>24 小时内</strong> 根据（{contact}）与您取得联系，确认一对一导航会议时间。</p>
                  </div>

                  <button
                    onClick={() => setSubmitPhase("idle")}
                    className="px-4 py-1.5 border border-stone-300 hover:border-stone-500 text-stone-500 hover:text-stone-700 text-[9px] font-serif rounded transition-all bg-white"
                  >
                    返回预约表单
                  </button>
                </div>
              )}

            </GlassCard>
          </div>

        </div>

      </div>
    </section>
  );
}
