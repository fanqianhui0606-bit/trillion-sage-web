"use client";

import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import GlassCard from "@/components/shared/GlassCard";

interface Message {
  sender: "user" | "ai";
  text: string;
  agentId?: string;
  agentName?: string;
  borderColor?: string;
}

interface ExpertAnalysis {
  agent_id: string;
  agent_name: string;
  discipline: string;
  perspective: string;
}

interface ReportData {
  expert_analyses: ExpertAnalysis[];
  manager_summary: string;
  talent_directions: string[];
  similarity: number;
  quiz_comparison?: string;
}

// 智能体配置参数 (色谱、头像、中性描述)
const AGENT_CONFIGS: Record<string, { name: string; category: string; color: string; border: string; bg: string; dot: string; glow: string }> = {
  manager: {
    name: "主理人",
    category: "",
    color: "text-amber-800",
    border: "border-amber-300/30",
    bg: "bg-amber-500/10",
    dot: "bg-amber-600",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]"
  },
  physics: {
    name: "观测者",
    category: "物理",
    color: "text-indigo-900",
    border: "border-indigo-300/30",
    bg: "bg-indigo-500/10",
    dot: "bg-indigo-600",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]"
  },
  math: {
    name: "孤点",
    category: "数学",
    color: "text-stone-800",
    border: "border-stone-400/40",
    bg: "bg-stone-500/10",
    dot: "bg-stone-700",
    glow: "shadow-[0_0_15px_rgba(120,113,108,0.2)]"
  },
  biology: {
    name: "栖息者",
    category: "生物",
    color: "text-emerald-900",
    border: "border-emerald-300/30",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-600",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
  },
  algorithm: {
    name: "终端",
    category: "计算机",
    color: "text-cyan-900",
    border: "border-cyan-300/30",
    bg: "bg-cyan-500/10",
    dot: "bg-cyan-600",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]"
  }
};

export default function PaidChatPage() {
  // 基础鉴权状态
  const [activationCode, setActivationCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // 对话流状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [turns, setTurns] = useState(0);
  const [currentAgentId, setCurrentAgentId] = useState("manager");
  const [agentTurns, setAgentTurns] = useState<Record<string, number>>({ manager: 0, physics: 0, math: 0, biology: 0, algorithm: 0 });
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");

  // 报告生成状态
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const rippleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamReaderRef = useRef<ReadableStreamDefaultReader | null>(null);

  // 显示名：主理人不带括号，其他角色显示"称号（学科）"
  const getDisplayName = (agentId: string) => {
    const cfg = AGENT_CONFIGS[agentId];
    if (!cfg) return agentId;
    return cfg.category ? `${cfg.name}（${cfg.category}）` : cfg.name;
  };

  // 初始化 IDs 与缓存激活码
  useEffect(() => {
    const cachedCode = localStorage.getItem("tsg_paid_code");
    if (cachedCode) {
      setActivationCode(cachedCode);
    }
    setSessionId("sess_" + Math.random().toString(36).substring(2, 11));
    setUserId("usr_" + Math.random().toString(36).substring(2, 11));
  }, []);

  // 加载历史会话
  const loadSession = async (code: string) => {
    try {
      const res = await fetch(`/api/paid-chat?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.session) {
          const s = data.session;
          // Restore messages
          const restored: Message[] = s.messages.map((m: { role: string; content: string }) => ({
            sender: m.role === "user" ? "user" : "ai",
            text: m.content,
            agentId: s.currentAgent || "manager",
            agentName: AGENT_CONFIGS[s.currentAgent]?.name || "主理人",
            borderColor: AGENT_CONFIGS[s.currentAgent]?.border || "border-amber-300/30",
          }));
          if (restored.length > 0) {
            setMessages(restored);
            setTurns(restored.filter(m => m.sender === "user").length);
            setCurrentAgentId(s.currentAgent || "manager");
            if (s.agentTurns) setAgentTurns(s.agentTurns);
          }
          return true;
        }
      }
    } catch { /* ignore */ }
    return false;
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, reportData]);

  // 验证码校验
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      setVerifyError("请输入有效的激活密钥");
      return;
    }
    setVerifyError("");
    setIsVerifying(true);

    try {
      // 用 GET 验证（admin code 直接通过，正式码走 backend）
      const verifyRes = await fetch(`/api/paid-chat?code=${encodeURIComponent(activationCode.trim().toUpperCase())}`);
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setIsUnlocked(true);
        localStorage.setItem("tsg_paid_code", activationCode.trim().toUpperCase());

        // Try to load existing session
        const hasSession = await loadSession(activationCode.trim().toUpperCase());
        if (!hasSession) {
          // Delay opening message for natural feel
          setIsTyping(true);
          setTimeout(() => triggerOpening(), 1500);
        }
      } else {
        setVerifyError("激活码无效。请检查拼写或付款状态。");
      }
    } catch (err) {
      console.error(err);
      setVerifyError("网络错误，无法连接到大模型网关。");
    } finally {
      setIsVerifying(false);
    }
  };

  // 核心流式发送逻辑
  const performStreamSend = async (historyPayload: { role: string; content: string }[], sendingAgentId: string) => {
    const res = await fetch("/api/paid-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "stream",
        session_id: sessionId,
        user_id: userId,
        activation_code: activationCode.trim().toUpperCase(),
        current_agent: sendingAgentId,
        inherit_data: true,
        history: historyPayload
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "大模型网关拒绝访问");
    }

    if (!res.body) throw new Error("无法读取流式响应数据");

    // 初始化占位的 AI 消息
    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: "",
        agentId: sendingAgentId,
        agentName: AGENT_CONFIGS[sendingAgentId].name,
        borderColor: AGENT_CONFIGS[sendingAgentId].border
      }
    ]);

    const reader = res.body.getReader();
    streamReaderRef.current = reader;
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    let tempAgentId = sendingAgentId;
    let handoffOccurred = false;
    let handoffTargetId = "";

    try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim() || !line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") continue;

        try {
          const dataObj = JSON.parse(jsonStr);
          if (dataObj.event === "handoff") {
            // Agent ID 校验：只接受合法 ID
            const validIds = ["manager", "physics", "math", "biology", "algorithm"];
            const validatedId = validIds.includes(dataObj.agent) ? dataObj.agent : tempAgentId;
            tempAgentId = validatedId;
            handoffOccurred = true;
            handoffTargetId = validatedId;
            setCurrentAgentId(validatedId);
            setMessages((prev) => {
              const nextList = [...prev];
              const lastIdx = nextList.length - 1;
              nextList[lastIdx].agentId = validatedId;
              nextList[lastIdx].agentName = AGENT_CONFIGS[validatedId].name;
              nextList[lastIdx].borderColor = AGENT_CONFIGS[validatedId].border;
              return nextList;
            });
          } else if (dataObj.event === "token") {
            fullText += dataObj.text;
            setMessages((prev) => {
              const nextList = [...prev];
              const lastIdx = nextList.length - 1;
              nextList[lastIdx].text = fullText;
              return nextList;
            });
          } else if (dataObj.event === "report_ready") {
            setIsTyping(false);
            streamReaderRef.current = null;
            setTimeout(() => handleGenerateReport(), 500);
            return;
          }
        } catch {
          // 解析单行 JSON 出错，忽略或等待 buffer 完整
        }
      }
    }

    // Handoff fallback：如果切换后消息极短（空白发言），自动让新角色补发
    if (handoffOccurred && fullText.trim().length < 10) {
      // 移除空白占位消息
      setMessages((prev) => prev.slice(0, -1));
      // 自动触发新角色发言
      setIsTyping(false);
      setTimeout(async () => {
        try {
          // 用对话历史 + 系统指令触发新角色开场
          const followHistory = [...historyPayload, { role: "user", content: "。" }];
          await performStreamSend(followHistory, handoffTargetId);
        } catch { /* fallback 失败静默 */ }
      }, 300);
      return;
    }

    } catch (err) {
      if ((err as Error)?.name === "AbortError") return; // stream cancelled by user
      throw err;
    }

    setTurns((prev) => prev + 1);
    setAgentTurns((prev) => ({ ...prev, [sendingAgentId]: (prev[sendingAgentId] || 0) + 1 }));
  };

  // AI 开场触发：验证通过后自动获取主理人开场白
  const triggerOpening = async () => {
    setIsTyping(true);
    try {
      await performStreamSend([], "manager");
      setTurns(1);
    } catch (err) {
      console.error(err);
      setMessages([{
        sender: "ai",
        text: "抱歉，连接出现了一些波动。请刷新页面重试。",
        agentId: "manager",
        agentName: "主理人",
        borderColor: "border-amber-300/30"
      }]);
    } finally {
      setIsTyping(false);
      streamReaderRef.current = null;
    }
  };

  // 检测是否为切换意图的短消息
  const detectSwitchIntent = (text: string): string | null => {
    const t = text.trim();
    const patterns: [RegExp, string][] = [
      [/想(和|跟|找|切换|换).*?(物理|观测|程朗)/i, "physics"],
      [/想(和|跟|找|切换|换).*?(数学|孤点|简之)/i, "math"],
      [/想(和|跟|找|切换|换).*?(生物|生化|栖息|苏野)/i, "biology"],
      [/想(和|跟|找|切换|换).*?(计算|算法|终端|归也|计算机)/i, "algorithm"],
      [/想(和|跟|找|切换|换).*?(主理|manager|温澜)/i, "manager"],
    ];
    for (const [re, agent] of patterns) {
      if (re.test(t)) return agent;
    }
    if (/^(物理|数学|生物|计算|算法|主理)/.test(t) && t.length <= 5) {
      const map: Record<string, string> = { "物理": "physics", "数学": "math", "生物": "biology", "计算": "algorithm", "算法": "algorithm", "主理": "manager" };
      return map[t] || null;
    }
    return null;
  };

  // 发送消息
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue("");

    // If stream is active, cancel it and clean up placeholder
    if (isTyping && streamReaderRef.current) {
      try { streamReaderRef.current.cancel(); } catch { /* ignore */ }
      streamReaderRef.current = null;
      // Remove the in-progress AI placeholder message
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === "ai" && last.text === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }

    // Detect switch intent and update agent
    const switchTarget = detectSwitchIntent(userText);
    if (switchTarget && switchTarget !== currentAgentId) {
      setCurrentAgentId(switchTarget);
    }
    const sendingAgent = switchTarget || currentAgentId;

    const newMessages = [...messages.filter(m => !(m.sender === "ai" && m.text === "")), { sender: "user" as const, text: userText }];
    setMessages(newMessages);
    setIsTyping(true);

    const historyPayload = newMessages.map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));

    try {
      await performStreamSend(historyPayload, sendingAgent);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return; // stream cancelled, ignore
      console.error(err);
      const message = err instanceof Error ? err.message : "无法拉取后台流数据";
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `（相干通道受到强引力波折射，对弈阻尼增高: ${message}）`,
          agentName: "系统终端",
          borderColor: "border-red-500/20"
        }
      ]);
    } finally {
      setIsTyping(false);
      streamReaderRef.current = null;
    }
  };

  // 生成报告
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const historyPayload = messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      // Check for existing quiz scores to enable comparison
      let quizScores: Record<string, number> | null = null;
      try {
        const stored = localStorage.getItem("tsg_paid_quiz_scores");
        if (stored) quizScores = JSON.parse(stored);
      } catch { /* ignore */ }

      const res = await fetch("/api/paid-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "report",
          session_id: sessionId,
          user_id: userId,
          activation_code: activationCode.trim().toUpperCase(),
          history: historyPayload,
          quiz_scores: quizScores
        })
      });

      if (!res.ok) throw new Error("获取报告数据失败");
      const rData = (await res.json()) as ReportData;
      setReportData(rData);
    } catch (err) {
      console.error(err);
      alert("生成报告失败，请稍后重试。");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 共振涟漪：基于对话历史生成彩色同心圆波纹
  useEffect(() => {
    if (!reportData || !rippleCanvasRef.current || messages.length === 0) return;
    const canvas = rippleCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const w = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const h = (canvas.height = 200);

    // 每个角色对应的涟漪风格
    const agentRippleStyles: Record<string, { color: string; speed: number; decay: number; lineWidth: number; jitter: number; doubleRing: boolean }> = {
      manager:   { color: "rgba(245,158,11,__A__)",   speed: 0.4, decay: 0.003, lineWidth: 0.8, jitter: 0, doubleRing: false },
      physics:   { color: "rgba(99,102,241,__A__)",    speed: 0.25, decay: 0.002, lineWidth: 1.0, jitter: 0, doubleRing: false },
      math:      { color: "rgba(120,113,108,__A__)",   speed: 0.35, decay: 0.004, lineWidth: 0.6, jitter: 0, doubleRing: false },
      biology:   { color: "rgba(16,185,129,__A__)",    speed: 0.3, decay: 0.003, lineWidth: 0.8, jitter: 1.5, doubleRing: false },
      algorithm: { color: "rgba(6,182,212,__A__)",     speed: 0.5, decay: 0.006, lineWidth: 0.7, jitter: 0, doubleRing: true },
    };

    // 为每条消息生成一个涟漪
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      maxRadius: number;
      agentId: string;
    }

    const ripples: Ripple[] = [];
    const cols = Math.min(messages.length, 12); // 最多12列
    const rowCount = Math.ceil(messages.length / cols);
    const cellW = w / cols;
    const cellH = h / rowCount;

    messages.forEach((msg, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const agentId = msg.agentId || "manager";
      ripples.push({
        x: cellW * col + cellW / 2 + (Math.random() - 0.5) * cellW * 0.3,
        y: cellH * row + cellH / 2 + (Math.random() - 0.5) * cellH * 0.3,
        radius: 0,
        opacity: 0.5,
        maxRadius: Math.min(cellW, cellH) * 0.35,
        agentId,
      });
    });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // 深色背景
      ctx.fillStyle = "rgba(15,15,25,0.03)";
      ctx.fillRect(0, 0, w, h);

      for (const ripple of ripples) {
        const style = agentRippleStyles[ripple.agentId] || agentRippleStyles.manager;
        ripple.radius += style.speed;
        ripple.opacity -= style.decay;

        if (ripple.radius >= ripple.maxRadius || ripple.opacity <= 0) {
          ripple.radius = 0;
          ripple.opacity = 0.5;
        }

        const alpha = Math.max(0, ripple.opacity);
        const colorStr = style.color.replace("__A__", alpha.toFixed(3));
        const jx = style.jitter ? (Math.random() - 0.5) * style.jitter : 0;
        const jy = style.jitter ? (Math.random() - 0.5) * style.jitter : 0;

        ctx.strokeStyle = colorStr;
        ctx.lineWidth = style.lineWidth;
        ctx.beginPath();
        ctx.arc(ripple.x + jx, ripple.y + jy, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        // 双环效果（终端）
        if (style.doubleRing) {
          const innerR = ripple.radius * 0.65;
          if (innerR > 0) {
            ctx.strokeStyle = colorStr.replace("__A__", (alpha * 0.6).toFixed(3));
            ctx.lineWidth = style.lineWidth * 0.6;
            ctx.beginPath();
            ctx.arc(ripple.x + jx, ripple.y + jy, innerR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [reportData, messages]);

  // 背景星屑粒子与蜡烛微动发光
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.5 + 0.1,
        speed: 0.0025 + Math.random() * 0.004
      });
    }

    let flicker = 1.0;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      flicker += (Math.random() - 0.5) * 0.06;
      if (flicker > 1.2) flicker = 1.2;
      if (flicker < 0.85) flicker = 0.85;

      const grad = ctx.createRadialGradient(
        w / 2, h * 0.9, 10,
        w / 2, h * 0.8, 320 * flicker
      );
      grad.addColorStop(0, "rgba(99, 102, 241, 0.09)"); // Indgo/Purple hint
      grad.addColorStop(0.5, "rgba(197, 160, 89, 0.03)"); // Gold hint
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.alpha += p.speed;
        if (p.alpha > 0.7 || p.alpha < 0.05) p.speed *= -1;
        ctx.fillStyle = `rgba(107, 70, 193, ${Math.max(0, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 保存 PDF 报告
  const handleDownloadPDF = async () => {
    if (!reportRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FAF7F2"
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`星轨干涉-学情与直觉偏差分析报告-${userId}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("生成 PDF 失败，请检查浏览器兼容性。");
    } finally {
      setIsDownloading(false);
    }
  };

  const activeAgent = AGENT_CONFIGS[currentAgentId];

  return (
    <div className="h-screen flex flex-col pt-16 relative overflow-hidden">
      {/* 动态绘图粒子背景 */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 1. 激活认证层 */}
      {!isUnlocked && (
        <div className="flex-1 flex items-center justify-center p-4 z-10 relative">
          <GlassCard className="max-w-md w-full border border-white/60 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-scale-in">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-xl shadow-inner">
              🌌
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-serif text-xl font-bold text-stone-850 tracking-widest">
                星航 · 智能体对弈室
              </h2>
              <p className="text-xs text-bridge-muted font-serif leading-relaxed max-w-xs mx-auto">
                这里运行着由物理、数学、生化、算法博士语料提炼的 Swarm 专家组，我们将与你的认知底色进行无套路对弈。
              </p>
            </div>

            <form onSubmit={handleVerify} className="w-full space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-serif font-bold text-stone-600 block pl-1">
                  输入专属激活密钥 (Activation Key)
                </label>
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => {
                    setActivationCode(e.target.value);
                    setVerifyError("");
                  }}
                  placeholder="请输入您的专属激活码"
                  disabled={isVerifying}
                  className="w-full px-4 py-2.5 bg-white border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-xs font-mono tracking-wider transition-all disabled:opacity-50 text-stone-800 shadow-sm"
                />
                {verifyError && (
                  <p className="text-[10px] text-red-500 font-serif font-semibold mt-1.5 pl-1">
                    ⚠ {verifyError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-serif text-xs tracking-[0.2em] rounded-lg shadow transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? "建立相干相连..." : "开启多角色对弈之旅"}
              </button>
            </form>

            <div className="w-full border-t border-stone-200/50 pt-4 mt-2">
              <p className="text-[10px] text-stone-500 font-serif leading-relaxed">
                💡 <strong>激活码获取途径：</strong><br />
                微信扫码关注官方公众号「<strong>桥梁计划Bridge</strong>」，获取付费解锁激活码。
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 2. 核心多智能体对弈聊天室 */}
      {isUnlocked && !reportData && (
        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto relative z-10 overflow-hidden">
          {/* Header — fixed below navbar */}
          <div className="px-6 py-3 border-b-2 border-indigo-200/60 flex items-center justify-between bg-white/60 backdrop-blur-md shrink-0 rounded-t-xl">
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${activeAgent.dot} ${activeAgent.glow} transition-all duration-500`} />
                <div className="flex flex-col">
                  <h1 className="font-serif text-stone-850 text-sm tracking-wider font-bold">
                    星航相干室
                  </h1>
                  <span className="text-[9px] text-stone-500 font-serif">
                    当前对弈角色：<strong className={`${activeAgent.color} font-semibold transition-colors duration-500`}>{getDisplayName(currentAgentId)}</strong>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 border-2 border-indigo-200 px-2.5 py-0.5 rounded font-semibold">
                  {getDisplayName(currentAgentId)} · {agentTurns[currentAgentId] || 0}/20 轮
                </span>
                {turns > 0 && (
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors font-serif text-[11px] px-3 py-1.5 border-2 border-indigo-300 rounded-md bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 font-semibold"
                  >
                    {isGeneratingReport ? "生成中..." : "生成报告"}
                  </button>
                )}
              </div>
            </div>

            {/* Messages — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-white/40">
              {!reportData && messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] md:max-w-[78%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  {msg.sender === "ai" && msg.agentName && (
                    <span className="text-[10px] font-serif text-stone-600 mb-1 ml-2.5 tracking-wider font-bold">
                      {msg.agentId ? getDisplayName(msg.agentId) : msg.agentName}
                    </span>
                  )}
                  <div
                    className={`p-4 rounded-lg text-sm md:text-base leading-relaxed tracking-wide transition-all duration-500 ${
                      msg.sender === "user"
                        ? "bg-indigo-50 text-stone-850 border border-indigo-150 rounded-tr-none shadow-sm"
                        : `bg-white text-stone-850 border rounded-tl-none shadow-sm ${msg.borderColor || "border-stone-200"}`
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="mr-auto items-start flex flex-col max-w-[70%]">
                  <span className="text-[10px] font-serif text-stone-500 mb-1 ml-2.5 tracking-wider font-bold">
                    {getDisplayName(currentAgentId)} 对弈思考中...
                  </span>
                  <div className={`bg-white/60 p-4 border rounded-lg rounded-tl-none flex items-center gap-1.5 ${activeAgent.border}`}>
                    <span className={`w-1.5 h-1.5 ${activeAgent.dot} rounded-full animate-bounce`} style={{ animationDelay: "0ms" }} />
                    <span className={`w-1.5 h-1.5 ${activeAgent.dot} rounded-full animate-bounce`} style={{ animationDelay: "150ms" }} />
                    <span className={`w-1.5 h-1.5 ${activeAgent.dot} rounded-full animate-bounce`} style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* 报告在浮层中展示 */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input — fixed at bottom */}
            <div className="flex flex-col border-t-2 border-indigo-200/60 bg-white/60 backdrop-blur-md shrink-0 rounded-b-xl">
              <form onSubmit={handleSend} className="p-4 flex gap-2 items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isTyping}
                    placeholder={isTyping ? "等待响应..." : "输入你最真实的科学与逻辑直觉..."}
                    className="flex-1 px-3 py-2 bg-white border-2 border-indigo-200 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-stone-850 text-sm tracking-wide transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !inputValue.trim()}
                    className="px-5 py-2 bg-indigo-650 text-white font-serif text-xs tracking-[0.2em] rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-650 transition-all duration-300 cursor-pointer whitespace-nowrap"
                  >
                    开始对弈
                  </button>
                </form>
                <p className="text-[10px] text-stone-400 font-serif text-center pb-2 px-4 select-none">
                  本服务为 AI 辅助思维探索，非专业心理咨询或医学诊断。若面临情绪崩溃或心理危机，请寻求专业咨询或医疗热线帮助。
                </p>
            </div>
        </div>
      )}

      {/* 报告全屏浮层 */}
      {reportData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
          <div className="relative w-full max-w-2xl mx-4 my-auto animate-fade-in">
            {/* 关闭按钮 */}
            <button
              onClick={() => setReportData(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white border-2 border-indigo-300 rounded-full flex items-center justify-center text-indigo-600 hover:text-indigo-800 hover:border-indigo-500 shadow-sm transition-all font-bold"
            >
              ✕
            </button>

            <div
              ref={reportRef}
              className="bg-[#FAF7F2] p-8 md:p-10 rounded-xl border border-indigo-200/40 shadow-2xl"
            >
              {/* 框体装饰 */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-indigo-500/30 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-indigo-500/30 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-indigo-500/30 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-indigo-500/30 rounded-br-xl" />

              <div className="text-center mb-8">
                <h2 className="text-lg md:text-xl font-serif text-indigo-950 tracking-[0.2em] mb-1.5 font-bold">
                  ☄ 星轨相干 · 直觉干涉报告
                </h2>
                <p className="text-[10px] text-indigo-500/60 tracking-widest font-serif">
                  主观对弈直觉与客观量表能力之相位偏差模型
                </p>
              </div>

              <div className="space-y-8">
                {/* 共振涟漪 */}
                <div className="bg-white/80 p-4 border border-indigo-200/20 rounded-lg text-center relative overflow-hidden">
                  <span className="absolute top-1.5 left-2.5 text-[8px] font-mono text-indigo-500/60 tracking-wider">
                    RESONANCE RIPPLES (对话共振涟漪)
                  </span>
                  <span className="absolute top-1.5 right-2.5 text-[8px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    主客观相似度: {Math.round(reportData.similarity * 100)}%
                  </span>
                  <div className="pt-5 pb-2">
                    <canvas ref={rippleCanvasRef} className="w-full h-[200px]" />
                  </div>
                </div>

                {/* 专家分析卡片 */}
                {reportData.expert_analyses && reportData.expert_analyses.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-serif text-indigo-950 border-b border-indigo-250 pb-2 font-bold flex items-center gap-1.5">
                      <span>◆</span> 各学科视角下的思维特质
                    </h4>
                    {reportData.expert_analyses.map((analysis, i) => {
                      const cfg = AGENT_CONFIGS[analysis.agent_id];
                      const dotColor = cfg?.dot || "bg-stone-400";
                      return (
                        <div key={i} className="bg-white/80 p-4 rounded-lg border border-stone-200/60">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                            <span className="text-xs font-serif font-bold text-stone-800">
                              {analysis.agent_name}
                            </span>
                            <span className="text-[10px] text-stone-400 font-serif">
                              {analysis.discipline}视角
                            </span>
                          </div>
                          <p className="text-stone-700 text-xs leading-loose font-serif text-justify">
                            {analysis.perspective}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 主理人总评 */}
                {reportData.manager_summary && (
                  <div>
                    <h4 className="text-xs font-serif text-indigo-950 mb-2 border-b border-indigo-250 pb-2 font-bold flex items-center gap-1.5">
                      <span>◆</span> 主理人总评
                    </h4>
                    <p className="text-stone-750 text-xs leading-loose font-serif text-justify whitespace-pre-wrap">
                      {reportData.manager_summary}
                    </p>
                  </div>
                )}

                {/* 天赋方向 */}
                {reportData.talent_directions && reportData.talent_directions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-serif text-indigo-950 mb-2 border-b border-indigo-250 pb-2 font-bold flex items-center gap-1.5">
                      <span>◆</span> 天赋方向建议
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {reportData.talent_directions.map((dir, i) => (
                        <span key={i} className="text-[11px] font-serif bg-indigo-50 text-indigo-800 border border-indigo-200/50 px-3 py-1 rounded-full">
                          {dir}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 测验 vs AI 对话对比 */}
                {reportData.quiz_comparison && (
                  <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-200/40 mt-4">
                    <h4 className="text-[10px] font-serif text-indigo-800 mb-2 font-bold flex items-center gap-1.5">
                      <span>🔍</span> 你的测验和对话，为什么看起来不太一样？
                    </h4>
                    <p className="text-stone-700 text-[11px] leading-relaxed font-serif">
                      {reportData.quiz_comparison}
                    </p>
                  </div>
                )}

                {/* 过来人寄语 */}
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200/60 mt-4">
                  <h4 className="text-[10px] font-serif text-stone-800 mb-2 font-bold flex items-center gap-1.5">
                    <span>💡</span> 行星轨迹的去中心化启航
                  </h4>
                  <p className="text-stone-600 text-[11px] leading-relaxed font-serif italic">
                    &ldquo;完美完全对称的系统，就像是一朵没有香气的人造花。正是因为测量干预、前提条件的特殊性、以及主观直觉同客观考卷之间的偏差振荡，你的特立独行才具备了具体的生命力。接受智力差异，在此基础上以平等的姿态真诚地向下兼容，去连接这个不那么快、不那么透明的世界吧。&rdquo;
                  </p>
                  <p className="text-right text-indigo-950/70 text-[10px] font-serif font-bold mt-3">
                    —— 桥梁计划·数理生化算法博士导师团
                  </p>
                </div>
              </div>

              {/* 免责声明 */}
              <div className="border-t border-indigo-200/20 pt-4 mt-6 text-[9px] text-stone-400 font-serif leading-relaxed text-center">
                本报告由 AI 语言模型自动生成。其内容仅作为数理逻辑直觉探索之参考，不构成任何心理诊断、治疗方案或专业选科决策之绝对依据。如有情绪危机，请及时寻求专业诊疗。
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center gap-3 mt-8">
                <button
                  onClick={() => setReportData(null)}
                  className="px-5 py-2 bg-white border-2 border-indigo-300 hover:border-indigo-400 text-indigo-700 font-serif text-xs rounded transition-all font-semibold"
                >
                  ← 返回对话
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-serif text-xs rounded transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isDownloading ? "生成中..." : "⬇ 导出 PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
