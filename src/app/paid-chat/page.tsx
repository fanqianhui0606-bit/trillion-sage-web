"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

interface WaveParameters {
  amplitude: number;
  frequency: number;
  phase_shift: number;
}

interface ReportData {
  is_conflict: boolean;
  similarity: number;
  explanation: string;
  wave_parameters: WaveParameters;
  upsell_card: {
    title: string;
    mismatch_detected: boolean;
    cta_url: string;
  };
}

// 智能体配置参数 (色谱、头像、中性描述)
const AGENT_CONFIGS: Record<string, { name: string; title: string; color: string; border: string; bg: string; dot: string; glow: string }> = {
  manager: {
    name: "主理人",
    title: "生涯规划导师",
    color: "text-amber-800",
    border: "border-amber-350/35",
    bg: "bg-amber-500/10",
    dot: "bg-amber-600",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]"
  },
  physics: {
    name: "物理专家",
    title: "宇宙微观探索者",
    color: "text-indigo-900",
    border: "border-indigo-350/35",
    bg: "bg-indigo-500/10",
    dot: "bg-indigo-600",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]"
  },
  math: {
    name: "数学专家",
    title: "极致纯逻辑架构师",
    color: "text-stone-850",
    border: "border-stone-400/40",
    bg: "bg-stone-500/10",
    dot: "bg-stone-700",
    glow: "shadow-[0_0_15px_rgba(120,113,108,0.2)]"
  },
  biology: {
    name: "生化专家",
    title: "复杂系统负熵构建者",
    color: "text-emerald-900",
    border: "border-emerald-350/35",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-600",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
  },
  algorithm: {
    name: "算法专家",
    title: "复杂度限界计算家",
    color: "text-cyan-950",
    border: "border-cyan-350/35",
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
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");

  // 报告生成状态
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamReaderRef = useRef<ReadableStreamDefaultReader | null>(null);

  // 初始化 IDs 与缓存激活码
  useEffect(() => {
    const cachedCode = localStorage.getItem("tsg_paid_code");
    if (cachedCode) {
      setActivationCode(cachedCode);
    }
    // 随机分配会话和用户 ID
    setSessionId("sess_" + Math.random().toString(36).substring(2, 11));
    setUserId("usr_" + Math.random().toString(36).substring(2, 11));
  }, []);

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
      // 通过发一条空的 stream 请求（包含单条打招呼历史）来检验密钥有效性
      const res = await fetch("/api/paid-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stream",
          session_id: sessionId,
          user_id: userId,
          activation_code: activationCode.trim().toUpperCase(),
          current_agent: "manager",
          inherit_data: false,
          history: [{ role: "user", content: "hello" }]
        })
      });

      if (res.ok) {
        setIsUnlocked(true);
        localStorage.setItem("tsg_paid_code", activationCode.trim().toUpperCase());
        // 开启第一条欢迎信息
        setMessages([
          {
            sender: "ai",
            text: "相干共振已锁定。我是主理人。在这里，我们将以理性的纯净、物理常数、生化负熵以及算法极限的视角，探查你的心智结构。告诉我，在这场没有满分标准答案的对弈中，你现在最想打破的世俗定轨是什么？",
            agentId: "manager",
            agentName: "主理人",
            borderColor: "border-amber-300/30"
          }
        ]);
        setTurns(1);
      } else {
        const errData = await res.json().catch(() => ({}));
        setVerifyError(errData.error || "激活码无效。请检查拼写或付款状态。");
      }
    } catch (err) {
      console.error(err);
      setVerifyError("网络错误，无法连接到大模型网关。");
    } finally {
      setIsVerifying(false);
    }
  };

  // 发送消息
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const newMessages = [...messages, { sender: "user" as const, text: userText }];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    // 映射 Next.js 结构至 python 服务端期待的 {"role": "user"|"assistant", "content": "..."}
    const historyPayload = newMessages.map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));

    try {
      const res = await fetch("/api/paid-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stream",
          session_id: sessionId,
          user_id: userId,
          activation_code: activationCode.trim().toUpperCase(),
          current_agent: currentAgentId,
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
          agentId: currentAgentId,
          agentName: AGENT_CONFIGS[currentAgentId].name,
          borderColor: AGENT_CONFIGS[currentAgentId].border
        }
      ]);

      const reader = res.body.getReader();
      streamReaderRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";
      let tempAgentId = currentAgentId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        // 保留最后一个可能未完的 line
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const dataObj = JSON.parse(jsonStr);
            if (dataObj.event === "handoff") {
              tempAgentId = dataObj.agent;
              setCurrentAgentId(tempAgentId);
              setMessages((prev) => {
                const nextList = [...prev];
                const lastIdx = nextList.length - 1;
                nextList[lastIdx].agentId = tempAgentId;
                nextList[lastIdx].agentName = AGENT_CONFIGS[tempAgentId].name;
                nextList[lastIdx].borderColor = AGENT_CONFIGS[tempAgentId].border;
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
            }
          } catch {
            // 解析单行 JSON 出错，忽略或等待 buffer 完整
          }
        }
      }

      setTurns((prev) => prev + 1);
    } catch (err) {
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

  // 生成最后的偏差与干涉报告
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const historyPayload = messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch("/api/paid-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "report",
          session_id: sessionId,
          user_id: userId,
          activation_code: activationCode.trim().toUpperCase(),
          history: historyPayload
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

  // 动态绘制 Canvas 星轨干涉图景
  useEffect(() => {
    if (!reportData || !waveCanvasRef.current) return;
    const canvas = waveCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const w = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const h = (canvas.height = 180);

    const { amplitude, frequency, phase_shift } = reportData.wave_parameters;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // 绘制背景参考轴
      ctx.strokeStyle = "rgba(46, 117, 182, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // 绘制相干干涉波动线（主线 - 发光效果）
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(107, 70, 193, 0.4)";
      ctx.strokeStyle = "rgba(107, 70, 193, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        // 余弦拟合波形：波幅与频率受相似度控制
        const y = h / 2 + Math.sin(x * frequency + t) * amplitude * Math.cos(x * 0.005 + phase_shift);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 绘制辅助波（淡金参考波）
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(197, 160, 89, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * (frequency * 0.8) - t * 0.7) * (amplitude * 0.6) * Math.sin(x * 0.008);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      t += 0.035; // 波动速度
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [reportData]);

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
    <div className="min-h-screen bg-gradient-to-b from-bridge-gradient-top from-0% via-bridge-gradient-bottom via-72% to-[#f4f4f7] to-100% flex flex-col pt-16 relative overflow-hidden">
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
                  placeholder="TSG_ADMIN_PAGE 或 12位激活码"
                  disabled={isVerifying}
                  className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 focus:outline-none text-xs font-mono tracking-wider transition-all disabled:opacity-50 text-stone-800"
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
                微信扫码关注官方公众号「<strong>桥梁计划Bridge</strong>」，发送你的测验关联码，获取付款解锁激活码。体验用户可输入后门码 <code className="bg-indigo-100/60 px-1 py-0.5 rounded font-mono text-[9px] text-indigo-700">TSG_ADMIN_PAGE</code> 直接进入。
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 2. 核心多智能体对弈聊天室 */}
      {isUnlocked && (
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 relative z-10 flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 bg-white/75 backdrop-blur-[24px] border border-bridge-blue/20 rounded-xl shadow-[0_12px_40px_rgba(46,117,182,0.05)] flex flex-col overflow-hidden relative">
            
            {/* 顶部智能体控制权指示器 */}
            <div className={`px-6 py-3.5 border-b border-bridge-blue/10 flex items-center justify-between transition-all duration-500 bg-white/50 backdrop-blur-md`}>
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${activeAgent.dot} ${activeAgent.glow} transition-all duration-500`} />
                <div className="flex flex-col">
                  <h1 className="font-serif text-stone-850 text-sm tracking-wider font-bold">
                    星航相干室
                  </h1>
                  <span className="text-[9px] text-stone-500 font-serif">
                    当前对弈角色：<strong className={`${activeAgent.color} font-semibold transition-colors duration-500`}>{activeAgent.name}</strong> ({activeAgent.title})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-stone-600 font-mono bg-stone-100 border border-stone-200/50 px-2 py-0.5 rounded">
                  对弈步数: {turns}/20
                </span>
                <Link
                  href="/"
                  className="text-stone-600 hover:text-indigo-650 transition-colors font-serif text-[10px] px-2.5 py-1 border border-stone-300 rounded bg-stone-100 hover:bg-stone-200"
                >
                  官网首页
                </Link>
              </div>
            </div>

            {/* 消息滚动框 */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-250">
              {!reportData && messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] md:max-w-[78%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  {msg.sender === "ai" && msg.agentName && (
                    <span className="text-[10px] font-serif text-stone-600 mb-1 ml-2.5 tracking-wider font-bold">
                      {msg.agentName}
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
                    {activeAgent.name} 对弈思考中...
                  </span>
                  <div className={`bg-white/60 p-4 border rounded-lg rounded-tl-none flex items-center gap-1.5 ${activeAgent.border}`}>
                    <span className={`w-1.5 h-1.5 ${activeAgent.dot} rounded-full animate-bounce`} style={{ animationDelay: "0ms" }} />
                    <span className={`w-1.5 h-1.5 ${activeAgent.dot} rounded-full animate-bounce`} style={{ animationDelay: "150ms" }} />
                    <span className={`w-1.5 h-1.5 ${activeAgent.dot} rounded-full animate-bounce`} style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* 20轮限制已满，触发报告生成 */}
              {turns >= 20 && !reportData && (
                <div className="animate-fade-in w-full max-w-lg mx-auto py-10 px-6 bg-white/80 border border-indigo-200/50 rounded-xl shadow-lg flex flex-col items-center text-center gap-5">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 text-xl">
                    🪐
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-stone-850 tracking-wider">
                      20 轮对弈收敛完成
                    </h3>
                    <p className="text-[11px] text-bridge-muted leading-relaxed mt-2 font-serif">
                      您的数理、物感、生化负熵和极简算法等 14 维元直觉参数已被充分探针。现在即可生成星轨干涉相消的冲突学情报告。
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded font-serif text-xs tracking-widest shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {isGeneratingReport ? "生成干涉图景中..." : "生成星轨干涉分析报告"}
                  </button>
                </div>
              )}

              {/* 3. 展示最终干涉分析报告 */}
              {reportData && (
                <div className="animate-fade-in w-full flex flex-col items-center pb-12">
                  <div
                    ref={reportRef}
                    className="w-full max-w-2xl bg-[#FAF7F2] p-8 md:p-10 rounded-xl border border-indigo-200/40 relative shadow-2xl"
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
                      {/* 动态波形渲染区域 */}
                      <div className="bg-white/80 p-4 border border-indigo-200/20 rounded-lg text-center relative overflow-hidden">
                        <span className="absolute top-1.5 left-2.5 text-[8px] font-mono text-indigo-500/60 tracking-wider">
                          COHERENCE WAVEFORMS (相干干涉图景)
                        </span>
                        <span className="absolute top-1.5 right-2.5 text-[8px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          主客观相似度: {Math.round(reportData.similarity * 100)}%
                        </span>
                        <div className="pt-5 pb-2">
                          <canvas ref={waveCanvasRef} className="w-full h-[180px]" />
                        </div>
                      </div>

                      {/* 冲突类型指示 */}
                      <div>
                        <h4 className="text-xs font-serif text-indigo-950 mb-2 border-b border-indigo-250 pb-2 font-bold flex items-center gap-1.5">
                          <span>◆</span> 相位偏差探测：{reportData.is_conflict ? "检测到显著主客观偏离" : "思维结构高度自洽"}
                        </h4>
                        <p className="text-stone-750 text-xs leading-loose font-serif text-justify whitespace-pre-wrap">
                          {reportData.explanation}
                        </p>
                      </div>

                      {/* 过来人寄语签名 */}
                      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200/60 mt-4">
                        <h4 className="text-[10px] font-serif text-stone-800 mb-2 font-bold flex items-center gap-1.5">
                          <span>💡</span> 行星轨迹的去中心化启航
                        </h4>
                        <p className="text-stone-600 text-[11px] leading-relaxed font-serif italic">
                          “完美完全对称的系统，就像是一朵没有香气的人造花。正是因为测量干预、前提条件的特殊性、以及主观直觉同客观考卷之间的偏差振荡，你的特立独行才具备了具体的生命力。接受智力差异，在此基础上以平等的姿态真诚地向下兼容，去连接这个不那么快、不那么透明的世界吧。”
                        </p>
                        <p className="text-right text-indigo-950/70 text-[10px] font-serif font-bold mt-3">
                          —— 桥梁计划·数理生化算法博士导师团
                        </p>
                      </div>
                    </div>
                    {/* 免责声明 */}
                    <div className="border-t border-indigo-200/20 pt-4 mt-6 text-[9px] text-stone-400 font-serif leading-relaxed text-center">
                      免责声明：本报告由 AI 语言模型自动生成。其内容仅作为数理逻辑直觉探索之参考，不构成任何心理诊断、治疗方案或专业选科决策之绝对依据。如有情绪危机，请及时寻求专业诊疗。
                    </div>
                  </div>

                  {/* 动作 */}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className="px-5 py-2 bg-stone-100 hover:bg-stone-200 border border-indigo-500/30 text-indigo-950 font-serif text-xs rounded transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isDownloading ? "生成中..." : "⬇ 保存并导出星轨干涉 PDF"}
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 对话输入栏 with Disclaimer */}
            {!reportData && turns < 20 && (
              <div className="flex flex-col border-t border-bridge-blue/10 bg-white/30">
                <form onSubmit={handleSend} className="p-4 flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isTyping}
                    placeholder={isTyping ? "等待对弈响应..." : "在此输入你最真实的科学与逻辑直觉..."}
                    className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-md focus:border-indigo-400 focus:outline-none text-stone-850 text-sm tracking-wide transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !inputValue.trim()}
                    className="px-6 py-2 bg-indigo-650 text-white font-serif text-xs tracking-[0.25em] rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-650 transition-all duration-300 cursor-pointer"
                  >
                    发送对弈
                  </button>
                </form>
                <p className="text-[10px] text-stone-400 font-serif text-center pb-2 px-4 select-none">
                  免责声明：本服务为 AI 辅助思维探索，非专业心理咨询或医学诊断。若面临情绪崩溃或心理危机，请寻求专业咨询或医疗热线帮助。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
