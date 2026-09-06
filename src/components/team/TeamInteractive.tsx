"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";
import { TUTOR_PROFILES, pickTutorBatch, type TutorProfile } from "@/lib/tutors-data";

const CONSULT_FLOW = [
  { step: "01", title: "初次建档", desc: "添加小助理微信 TrillionSage，沟通选科、分数与理科方向期望，建立专属档案。" },
  { step: "02", title: "锁定套餐", desc: "依据学情推荐最契合的咨询套餐，确认服务范围与导师排期。" },
  { step: "03", title: "素质测验", desc: "完成数理素质测验【专业版】，生成 14 维能力画像与 Top5 专业推荐。" },
  { step: "04", title: "导师匹配", desc: "按专业方向与性格特征匹配 985 硕博导师，提前同步测验报告。" },
  { step: "05", title: "1v1 深度咨询", desc: "腾讯会议深度通话，解答专业内容、升学路径与行业前景。" },
  { step: "06", title: "定制路线", desc: "导师出具个性化发展路线建议，含会议纪要与学术寄语。" },
  { step: "07", title: "心理疏导", desc: "白银/黄金套餐可预约北大资深心理导师，缓解升学焦虑。" },
  { step: "08", title: "长效陪伴", desc: "加入千殊专属社群，硕博学长长期在线答疑与跟踪。" },
];

const GRADE_OPTIONS = [
  { value: "high1", label: "高中一年级（新高考选科探索中）" },
  { value: "high2", label: "高中二年级（数理物理拔高 / 遭遇瓶颈）" },
  { value: "high3", label: "高中三年级（高考冲刺 / 强基计划规划）" },
  { value: "graduated", label: "高考毕业生（正处于志愿填报 / 衔接期）" },
  { value: "college", label: "大学低年级（面临专业分流或保研焦虑）" },
  { value: "parent", label: "家长代填（为孩子寻求长线升学规划）" },
];

function TutorCard({ tutor }: { tutor: TutorProfile }) {
  return (
    <GlassCard className="flex items-center gap-3 px-4 py-3 border border-white/50 hover:border-bridge-gold/40 hover:shadow-glass transition-all duration-300">
      {tutor.badgeImage ? (
        <span className="flex-shrink-0 w-12 h-12 rounded-full bg-white/80 border border-white flex items-center justify-center overflow-hidden">
          <Image
            src={tutor.badgeImage}
            alt={`${tutor.school} 校徽`}
            width={44}
            height={44}
            className="object-contain w-10 h-10"
          />
        </span>
      ) : (
        <span
          className={`flex-shrink-0 w-12 h-12 rounded-full ${tutor.badgeColor} text-white text-[11px] font-bold flex items-center justify-center leading-none text-center px-1`}
          aria-hidden
        >
          {tutor.badgeText}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-bold text-stone-800">{tutor.school}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200 flex-shrink-0">
            {tutor.role}
          </span>
        </div>
        <p className="text-xs text-bridge-muted mt-0.5 truncate">
          <span className="text-bridge-blue font-semibold">{tutor.surname} 学长</span> · {tutor.field}
        </p>
      </div>
    </GlassCard>
  );
}

export default function TeamInteractive() {
  const [offset, setOffset] = useState(0);
  const [flowOpen, setFlowOpen] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [contact, setContact] = useState("");
  const [grade, setGrade] = useState("");
  const [concern, setConcern] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "simulating" | "success">("idle");
  const [appointmentId, setAppointmentId] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const batch = pickTutorBatch(TUTOR_PROFILES, offset, 14);
  const leftCol = batch.slice(0, 7);
  const rightCol = batch.slice(7, 14);

  const refreshTutors = () => setOffset((prev) => (prev + 7) % TUTOR_PROFILES.length);

  const generateAppointmentId = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TS-${dateStr}-${rand}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !contact.trim() || !grade) {
      alert("请填写完整的预约信息（称呼、联系方式、学业阶段）");
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
          concern: concern.trim(),
          appointmentId: apptId,
        }),
      });

      if (!res.ok) throw new Error("预约保存失败");

      setTimeout(() => {
        setSubmitPhase("success");
        setIsSubmitting(false);
      }, 2200);
    } catch (err) {
      console.error(apptId, err);
      alert("提交预约接口失败，请检查网络后再试");
      setIsSubmitting(false);
      setSubmitPhase("idle");
    }
  };

  useEffect(() => {
    if (submitPhase === "idle") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let w = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let h = (canvas.height = 200);

    const handleResize = () => {
      w = canvas.width = canvas.parentElement?.clientWidth || 600;
      h = canvas.height = 200;
    };
    window.addEventListener("resize", handleResize);

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 0.5 + Math.random() * 1.5,
      amp: 5 + Math.random() * 15,
      phase: Math.random() * Math.PI * 2,
      r: Math.random() * 1.8 + 0.4,
      color: Math.random() > 0.4 ? "rgba(197, 160, 89, 0.7)" : "rgba(46, 117, 182, 0.6)",
    }));

    let phase = 0;
    const render = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.15)";
      ctx.fillRect(0, 0, w, h);

      phase += 0.045;
      ctx.lineWidth = 1.5;

      ctx.strokeStyle = "rgba(197, 160, 89, 0.65)";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.015 + phase) * 22 + Math.sin(x * 0.005 - phase * 0.7) * 12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(46, 117, 182, 0.55)";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.cos(x * 0.018 - phase * 0.8) * 20 + Math.sin(x * 0.008 + phase * 0.5) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (const s of stars) {
        s.x += s.speed;
        if (s.x > w) s.x = 0;
        const waveY = h / 2 + Math.sin(s.x * 0.015 + phase) * 18;
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
    <div className="space-y-14">
      {/* 导师名单 */}
      <div>
        <h3 className="text-xl font-bold text-bridge-blue text-center mb-6">导师名单</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-3">
            {leftCol.map((tutor, i) => (
              <TutorCard key={`l-${offset}-${i}`} tutor={tutor} />
            ))}
          </div>
          <div className="space-y-3">
            {rightCol.map((tutor, i) => (
              <TutorCard key={`r-${offset}-${i}`} tutor={tutor} />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center mt-6">
          <button
            type="button"
            onClick={refreshTutors}
            className="w-11 h-11 rounded-full border-2 border-bridge-blue/30 text-bridge-blue hover:bg-bridge-blue/10 hover:border-bridge-blue hover:rotate-180 transition-all duration-500 text-lg"
            aria-label="点击刷新查看更多讲师名单"
          >
            ↻
          </button>
          <p className="text-xs text-bridge-muted mt-2">点击刷新查看更多讲师名单</p>
        </div>

        <p className="text-xs text-bridge-muted text-center mt-4 leading-relaxed">
          * 为保障一线青年学者的科研精力，导师名单均作去人名化处理，资历可在咨询过程中查验。
        </p>
      </div>

      {/* 咨询流程 */}
      <div>
        <button
          type="button"
          onClick={() => setFlowOpen(!flowOpen)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-bridge-blue/25 bg-white/40 hover:bg-white/60 transition-all"
        >
          <span className="text-base font-bold text-bridge-blue">查看我们的咨询流程</span>
          <span className="text-bridge-muted text-xl leading-none">{flowOpen ? "−" : "+"}</span>
        </button>

        {flowOpen && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            {CONSULT_FLOW.map((item) => (
              <GlassCard key={item.step} className="relative border border-white/50">
                <span className="text-2xl font-bold text-bridge-blue/15 absolute top-3 right-4 leading-none">
                  {item.step}
                </span>
                <h4 className="text-sm font-bold text-bridge-blue mb-1.5 pr-10">{item.title}</h4>
                <p className="text-xs text-bridge-muted leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* 预约申请 */}
      <div id="consult" className="scroll-mt-24">
        <GlassCard className="border border-bridge-gold/30 shadow-[0_4px_24px_rgba(197,160,89,0.06)] bg-gradient-to-b from-amber-50/10 to-transparent p-8 md:p-12">
          {submitPhase === "success" ? (
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6 animate-scale-in">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-bridge-gold/40">
                <span className="text-2xl text-bridge-gold">✦</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl text-amber-900 tracking-widest font-bold">预约提交成功</h3>
                <span className="inline-block font-mono text-xs text-bridge-gold border border-bridge-gold/30 px-3 py-1 rounded select-all font-semibold tracking-wider">
                  预约工单单号：{appointmentId}
                </span>
              </div>

              <div className="w-full max-w-lg bg-[#0f172a] rounded-xl overflow-hidden border border-bridge-gold/30 p-2">
                <canvas ref={canvasRef} className="w-full block rounded-lg" />
              </div>

              <div className="bg-white/60 p-6 rounded-lg border border-stone-200/50 text-stone-700 max-w-lg text-sm leading-relaxed text-justify space-y-3">
                <p>
                  <strong>尊敬的 {studentName}：</strong>
                </p>
                <p>系统已记录您的 1v1 咨询引航申请，助理将在 1 个工作日内与您联系。</p>
                <p className="text-amber-900 font-semibold bg-amber-500/5 p-3 rounded border border-amber-500/15">
                  下一步：请复制您的预约单号，添加千殊小助理微信
                  <code className="bg-white px-2 py-0.5 mx-1 rounded font-mono text-bridge-blue border border-stone-200 select-all">
                    TrillionSage
                  </code>
                  ，备注称呼与单号，助理将为您建立专属对话群并排期腾讯会议。
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSubmitPhase("idle")}
                className="px-6 py-2 border border-stone-300 hover:border-stone-500 text-stone-500 hover:text-stone-700 text-xs tracking-widest rounded transition-all bg-white/50"
              >
                重新填写预约
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-2xl text-amber-900 tracking-widest font-bold">
                  预约 1v1 硕博导师深度引航
                </h3>
                <p className="text-sm text-bridge-muted leading-relaxed mt-3">
                  破除大学数理科研与升学信息差。导师将结合您的素质测验报告，进行深度通话与路径规划。
                </p>
              </div>

              {submitPhase === "simulating" ? (
                <div className="py-12 flex flex-col items-center justify-center gap-6">
                  <div className="relative w-full max-w-lg bg-[#0f172a] rounded-xl overflow-hidden border border-bridge-gold/30">
                    <canvas ref={canvasRef} className="w-full block" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 text-center px-4">
                      <div className="w-6 h-6 border-2 border-bridge-gold border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-bridge-gold tracking-widest animate-pulse">
                        正在为您配置最契合的 985 硕博导师组…
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="appt-name" className="text-xs text-stone-700 tracking-widest">
                        来访学生 / 家长称呼 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="appt-name"
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="例：张同学 或 李妈妈"
                        className="px-4 py-2 bg-white/70 border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="appt-contact" className="text-xs text-stone-700 tracking-widest">
                        联系电话 / 微信 ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="appt-contact"
                        type="text"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="微信 ID 优先，方便助理建群对接"
                        className="px-4 py-2 bg-white/70 border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="appt-grade" className="text-xs text-stone-700 tracking-widest">
                      当前所处学业阶段 <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="appt-grade"
                      required
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="px-4 py-2 bg-white/70 border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-sm text-stone-700"
                    >
                      <option value="">-- 请选择您的年级阶段 --</option>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="appt-concern" className="text-xs text-stone-700 tracking-widest">
                      学业现状 / 遭遇的最核心瓶颈描述（选填）
                    </label>
                    <textarea
                      id="appt-concern"
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                      placeholder="例：孩子做难题很有灵性，但总觉得普通作业无聊、考试马虎；或：对理论物理方向非常憧憬，但不了解真实的科研日常。"
                      rows={3}
                      className="px-4 py-2.5 bg-white/70 border border-stone-200 rounded focus:border-bridge-gold/50 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-bridge-gold text-white rounded-lg tracking-[0.2em] text-sm font-semibold hover:bg-amber-600 transition-all shadow-[0_4px_16px_rgba(197,160,89,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      提交预约申请
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* 联系方式与套餐下载 */}
      <GlassCard className="border border-white/60 p-8 text-center">
        <p className="text-base text-stone-700">
          如需咨询请添加千殊小助理微信：
          <span className="font-mono font-bold text-bridge-blue ml-1 select-all">TrillionSage</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          <Button href="/downloads/gaokao-consulting-package.pdf" variant="secondary" download>
            查看高考咨询套餐
          </Button>
          <Button href="/tracker" variant="accent">
            进入咨询流程平台
          </Button>
        </div>

        <p className="text-xs text-bridge-muted mt-6 leading-relaxed max-w-xl mx-auto">
          与北大资深心理咨询室合作，关注孩子的成长焦虑与家庭沟通，为升学决策提供心理支持。
        </p>
      </GlassCard>

      <div className="text-center">
        <Link href="/" className="text-sm text-bridge-blue hover:text-bridge-blue-dark border-b border-bridge-blue/30 pb-0.5 transition-colors">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
