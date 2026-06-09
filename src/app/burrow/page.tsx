"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Message {
  sender: "ai" | "user";
  text: string;
  agentName?: string;
  borderColor?: string;
}

interface ReportData {
  mirror_echo: string;
  math_aesthetic: string;
  reality_guide: string;
}

interface ParentReportData {
  decision_role: string;
  soft_moment: string;
  parenting_style: string;
  warm_suggestion: string;
}

interface FamilyLinkStatus {
  student_completed?: boolean;
  parent_completed?: boolean;
  student_authorized?: boolean;
  parent_authorized?: boolean;
  student_report?: ReportData;
  parent_report?: ParentReportData;
  paid?: boolean;
}

const OPENING_QUESTIONS = [
  "十二年被迫的‘定轨运动’终于在六月结束了。在这个突然失去重力的暑假，如果你可以把时间浪费在任意一件没有分值、没有标准答案的事情上，你会选什么？",
  "恭喜你脱离了那个被考试和排名定义的系统。在过去那些被迫刷题的日子里，有没有什么瞬间，你的脑子里在想一些和考试无关、却让你真正感到兴奋的‘无用’逻辑？",
  "考完的这几天，你大概已经听够了大人对你的期望和专业的讨论。我们不聊这些。我想知道，最近的一年里，哪一次你因为做某件事而彻底忘记了时间？无论那件事在外人看来有多无聊。"
];

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "").trim();
  }
  return cleaned;
}

export default function BurrowPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [turn, setTurn] = useState(1);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  // Family Link States
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [linkStatus, setLinkStatus] = useState<FamilyLinkStatus | null>(null);
  const [parentReport, setParentReport] = useState<ParentReportData | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Initialize opening message & load family code
  useEffect(() => {
    // Load code
    const code = sessionStorage.getItem("family_code");
    if (code) {
      setFamilyCode(code);
      // Fetch initial link status if code exists
      fetch(`/api/family-link?code=${code}`)
        .then((r) => r.json())
        .then((data) => {
          setLinkStatus(data);
          if (data.student_authorized) {
            setIsAuthorized(true);
          }
        })
        .catch(console.error);
    }

    // Delay opening so UI settles first
    const timer = setTimeout(() => {
      const randomQuestion = OPENING_QUESTIONS[Math.floor(Math.random() * OPENING_QUESTIONS.length)];
      setMessages([
        {
          sender: "ai",
          text: randomQuestion,
          agentName: "主理人",
          borderColor: "border-bridge-blue/20 bg-white/80 text-stone-850 shadow-sm",
        },
      ]);
      setTurn(1);
      setReportData(null);
      setIsPageReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, reportData]);

  // Background candle flickering & star dust animation
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

    const dust: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 40; i++) {
      dust.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        speed: 0.003 + Math.random() * 0.005,
      });
    }

    let flicker = 1.0;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      flicker += (Math.random() - 0.5) * 0.08;
      if (flicker > 1.25) flicker = 1.25;
      if (flicker < 0.8) flicker = 0.8;

      const grad = ctx.createRadialGradient(
        w / 2, h * 0.95, 20,
        w / 2, h * 0.85, 300 * flicker
      );
      grad.addColorStop(0, "rgba(107, 70, 193, 0.12)"); // Purple touch
      grad.addColorStop(0.4, "rgba(197, 160, 89, 0.04)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const d of dust) {
        d.alpha += d.speed;
        if (d.alpha > 0.65 || d.alpha < 0.05) d.speed *= -1;
        ctx.fillStyle = `rgba(197, 160, 89, ${Math.max(0, d.alpha)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
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

  const checkLinkStatus = async (codeStr: string) => {
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/family-link?code=${codeStr}`);
      if (res.ok) {
        const data = await res.json();
        setLinkStatus(data);
        if (data.student_authorized && data.parent_authorized) {
          setParentReport(data.parent_report);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    const newMessages = [...messages, { sender: "user" as const, text: userText }];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    const nextTurn = turn + 1;
    
    // Inject system directive at 10th round
    const payloadMessages = [...newMessages];
    if (nextTurn === 10) {
      payloadMessages.push({
        sender: "user",
        text: "[SYSTEM_DIRECTIVE]: REPORT"
      });
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages, turn: nextTurn })
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      
      if (nextTurn === 10) {
        let parsedReport = null;
        try {
          // Attempt to parse report JSON using cleanJsonString helper
          const cleanedText = cleanJsonString(data.text);
          parsedReport = JSON.parse(cleanedText);
          setReportData(parsedReport);
        } catch (err) {
          console.error("Failed to parse report JSON:", err);
          // Fallback if AI didn't output pure JSON
          parsedReport = {
            mirror_echo: "在这短暂的交谈中，我注意到你对那些既定规则的抗拒。在很多大人的标准里这叫“叛逆”，但我看到了另一种可能：你的大脑在对低效的冗余规则进行自我保护。你不是缺乏执行力，而是你昂贵的注意力只愿意为高密度的创造力买单。",
            math_aesthetic: "如果用理科的语言来描绘你，你具备极强的“系统负熵本能”。你在面对混乱和无聊时，本质上是在做信息压缩与结构重组。你不习惯按步就班地走台阶，你更适合直接从直觉的高维空间降维俯瞰。",
            reality_guide: "虽然我能在这个小小的树洞里接住你的特立独行，但我只是一个被代码浸润的镜像。去现实中找寻那个能听懂你烂梗的普通人吧，现实的粗糙，才是直觉最好的磨刀石。"
          };
          setReportData(parsedReport);
        }

        // 1. Submit Chat Log for Submissions ("留档")
        try {
          await fetch("/api/chat-submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "student",
              code: familyCode || "体验版",
              messages: payloadMessages,
              report: parsedReport
            })
          });
        } catch (subErr) {
          console.error("Failed to archive chat log:", subErr);
        }

        // 2. Submit for Family Linking if code exists
        if (familyCode) {
          try {
            await fetch("/api/family-link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: familyCode,
                role: "student",
                report: parsedReport,
                action: "submit"
              })
            });
            // Check status immediately
            checkLinkStatus(familyCode);
          } catch (linkErr) {
            console.error("Failed to submit family link:", linkErr);
          }
        }
      } else {
        const agentName = "主理人";
        const borderStyle = "border-bridge-blue/20 bg-white/80 text-stone-850 shadow-sm";

        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.text,
            agentName,
            borderColor: borderStyle,
          },
        ]);
      }
      setTurn(nextTurn);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "（空间引力波出现扰动，请稍后再试...）",
          agentName: "系统提示",
          borderColor: "border-red-500/30",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F3EDE2" // Warm light background to match aesthetic
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("星尘相干-独立思维共振报告.pdf");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("生成 PDF 失败，请稍后再试。");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col pt-16 relative overflow-hidden">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Chat area — fixed layout */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 md:px-6 relative z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3 border-b-2 border-bridge-blue/30 flex items-center justify-between bg-white/60 backdrop-blur-md shrink-0 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-bridge-blue animate-pulse" />
              <h1 className="font-serif text-bridge-blue-dark tracking-widest text-sm md:text-base font-bold">
                星尘相干室 {familyCode && <span className="text-xs bg-bridge-blue/10 px-2 py-0.5 rounded font-mono text-bridge-blue ml-2">关联码: {familyCode}</span>}
              </h1>
              <span className="text-xs text-bridge-muted/60 font-mono hidden md:inline">
                对话轮数: {turn}/10
              </span>
            </div>
            <Link
              href="/"
              className="text-stone-600 hover:text-bridge-blue transition-colors font-serif text-xs px-3 py-1 border border-stone-300 rounded-md bg-stone-100/80 hover:bg-stone-200/80"
            >
              返回官网首页
            </Link>
          </div>

          {/* Messages — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-white/40">
            {!reportData && messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] md:max-w-[75%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start animate-slide-up"
                }`}
              >
                {msg.sender === "ai" && msg.agentName && (
                  <span className="text-[10px] md:text-xs font-serif text-bridge-blue-dark/80 mb-1.5 ml-2 tracking-wider font-semibold">
                    {msg.agentName}
                  </span>
                )}
                <div
                  className={`p-4 rounded-lg text-sm md:text-base leading-relaxed tracking-wide ${
                    msg.sender === "user"
                      ? "bg-bridge-blue/10 text-stone-900 border border-bridge-blue/20 rounded-tr-none shadow-sm"
                      : `bg-white text-stone-850 border border-bridge-blue/10 rounded-tl-none shadow-sm ${msg.borderColor || ""}`
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {(!isPageReady || isTyping) && (
              <div className="mr-auto items-start flex flex-col max-w-[70%] animate-pulse">
                <span className="text-xs font-serif text-bridge-blue/50 mb-1.5 ml-2 tracking-wider">
                  探索中...
                </span>
                <div className="bg-white/60 p-4 border border-stone-200 rounded-lg rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-bridge-blue-light rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-bridge-blue-light rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-bridge-blue-light rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Step A: Authorization Panel (when code exists but student not authorized) */}
            {reportData && familyCode && !isAuthorized && (
              <div className="animate-fade-in w-full max-w-xl mx-auto py-12 px-6 bg-white/80 border border-bridge-blue/20 rounded-xl shadow-md flex flex-col items-center text-center gap-6">
                <div className="w-12 h-12 bg-bridge-blue/10 rounded-full flex items-center justify-center border border-bridge-blue/30 text-bridge-blue text-xl font-bold">
                  🔮
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-850 tracking-wider">
                    对话已顺利收敛，请授权查看报告
                  </h3>
                  <p className="text-xs text-bridge-muted leading-relaxed mt-2 font-serif max-w-sm">
                    您的这端星轨已探测完成。为了对比分析您与家长的思维默契度，生成双端共振报告，我们需要您的授权同意。
                  </p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded font-mono text-xs text-stone-700">
                  您的家庭关联码为: <span className="font-bold text-bridge-blue select-all">{familyCode}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button
                    onClick={async () => {
                      try {
                        await fetch("/api/family-link", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            code: familyCode,
                            role: "student",
                            action: "authorize"
                          })
                        });
                        setIsAuthorized(true);
                        checkLinkStatus(familyCode);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-6 py-2.5 bg-bridge-blue hover:bg-bridge-blue-dark text-white rounded font-serif text-sm tracking-widest shadow-sm hover:shadow-md transition-all flex-1"
                  >
                    同意授权并对比
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await fetch("/api/family-link", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            code: familyCode,
                            role: "student",
                            action: "deny"
                          })
                        });
                        setFamilyCode(null); // Bypass family linking, view single report
                      } catch (err) {
                        console.error(err);
                        setFamilyCode(null);
                      }
                    }}
                    className="px-6 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-600 rounded font-serif text-sm tracking-widest transition-all flex-1"
                  >
                    暂不授权
                  </button>
                </div>
              </div>
            )}

            {/* Step B: Waiting Panel (when student authorized, but parent has not) */}
            {reportData && familyCode && isAuthorized && linkStatus && (!linkStatus.parent_completed || !linkStatus.parent_authorized) && (
              <div className="animate-fade-in w-full max-w-xl mx-auto py-12 px-6 bg-white/80 border border-bridge-blue/20 rounded-xl shadow-md flex flex-col items-center text-center gap-6">
                <div className="w-12 h-12 border-2 border-bridge-blue border-t-transparent rounded-full animate-spin" />
                
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-850 tracking-wider">
                    正在等待家长端接入并授权...
                  </h3>
                  <p className="text-xs text-bridge-muted leading-relaxed mt-2 font-serif max-w-sm">
                    您已授权。请把您的家庭关联码发送给家长，让他们在首页选择“家长端”聊天并输入此码。
                  </p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded font-mono text-xs text-stone-700">
                  家庭关联码: <span className="font-bold text-bridge-blue select-all">{familyCode}</span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => checkLinkStatus(familyCode)}
                    disabled={checkingStatus}
                    className="px-6 py-2.5 bg-bridge-blue hover:bg-bridge-blue-dark text-white rounded font-serif text-sm tracking-widest shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {checkingStatus ? "刷新中..." : "刷新状态"}
                  </button>
                  <button
                    onClick={() => {
                      // Bypass waiting and display single report
                      setFamilyCode(null);
                    }}
                    className="px-6 py-2.5 border border-stone-300 hover:border-stone-400 text-stone-600 rounded font-serif text-sm tracking-widest transition-all bg-white"
                  >
                    先看我自己的单端报告
                  </button>
                </div>
              </div>
            )}

            {/* Step C: Display final report (single or comparison) */}
            {reportData && (!familyCode || (isAuthorized && parentReport)) && (
              <div className="animate-fade-in w-full flex flex-col items-center pb-12">
                <div 
                  ref={reportRef} 
                  className="w-full max-w-2xl bg-gradient-to-b from-[#FAF7F2] to-[#F3EDE2] p-8 md:p-12 rounded-xl shadow-[0_10px_35px_rgba(46,117,182,0.08)] border border-bridge-blue/20 relative"
                >
                  {/* Elegant corner borders */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-bridge-blue/40 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-bridge-blue/40 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-bridge-blue/40 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-bridge-blue/40 rounded-br-xl" />
                  
                  <div className="text-center mb-10">
                    <h2 className="text-xl md:text-2xl font-serif text-bridge-blue-dark tracking-[0.2em] mb-2 font-bold">
                      🔮 {parentReport ? "家庭思维相干" : "星尘相干"}
                    </h2>
                    <p className="text-xs text-bridge-blue/60 tracking-widest font-serif">
                      {parentReport ? "学生与家长双端思维共振报告" : "独立思维共振报告"}
                    </p>
                  </div>

                  <div className="space-y-10">
                    {/* Student Section */}
                    <div className="space-y-6">
                      {parentReport && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-4 bg-bridge-blue rounded" />
                          <h3 className="font-serif text-base font-bold text-bridge-blue-dark">少年端 · 认知探索</h3>
                        </div>
                      )}
                      
                      {/* Section 1 */}
                      <div>
                        <h4 className="text-sm font-serif text-bridge-blue mb-2.5 border-b border-bridge-blue/15 pb-2 font-semibold">
                          一、 镜像回响：我们看见的你
                        </h4>
                        <p className="text-stone-700 text-sm leading-relaxed font-serif text-justify whitespace-pre-wrap">
                          {reportData.mirror_echo}
                        </p>
                      </div>

                      {/* Section 2 */}
                      <div>
                        <h4 className="text-sm font-serif text-bridge-blue mb-2.5 border-b border-bridge-blue/15 pb-2 font-semibold">
                          二、 数理审美：你的直觉纹理
                        </h4>
                        <p className="text-stone-700 text-sm leading-relaxed font-serif text-justify whitespace-pre-wrap">
                          {reportData.math_aesthetic}
                        </p>
                      </div>

                      {/* Section 3 */}
                      <div>
                        <h4 className="text-sm font-serif text-bridge-blue mb-2.5 border-b border-bridge-blue/15 pb-2 font-semibold">
                          三、 破壁指南：给你的现实线索
                        </h4>
                        <p className="text-stone-700 text-sm leading-relaxed font-serif text-justify whitespace-pre-wrap">
                          {reportData.reality_guide}
                        </p>
                      </div>
                    </div>

                    {/* Parent Section (Visible only in comparison mode) */}
                    {parentReport && (
                      <div className="space-y-6 border-t border-stone-300/60 pt-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-4 bg-amber-600 rounded" />
                          <h3 className="font-serif text-base font-bold text-amber-900">家长端 · 默默托举</h3>
                        </div>

                        {/* Parent 1 */}
                        <div>
                          <h4 className="text-sm font-serif text-amber-700 mb-2.5 border-b border-amber-900/15 pb-2 font-semibold">
                            ◆ 家庭决策画像
                          </h4>
                          <p className="text-stone-700 text-sm leading-relaxed font-serif text-justify whitespace-pre-wrap">
                            {parentReport.decision_role}
                          </p>
                        </div>

                        {/* Parent 2 */}
                        <div>
                          <h4 className="text-sm font-serif text-amber-700 mb-2.5 border-b border-amber-900/15 pb-2 font-semibold">
                            ◆ 最柔软的瞬间
                          </h4>
                          <p className="text-stone-700 text-sm leading-relaxed font-serif text-justify whitespace-pre-wrap">
                            {parentReport.soft_moment}
                          </p>
                        </div>

                        {/* Parent 3 */}
                        <div>
                          <h4 className="text-sm font-serif text-amber-700 mb-2.5 border-b border-amber-900/15 pb-2 font-semibold">
                            ◆ 沟通模式镜像
                          </h4>
                          <p className="text-stone-700 text-sm leading-relaxed font-serif text-justify whitespace-pre-wrap">
                            {parentReport.parenting_style}
                          </p>
                        </div>

                        {/* Parent 4 */}
                        <div className="bg-amber-600/5 p-5 rounded-lg border border-amber-600/10">
                          <h4 className="text-xs font-serif text-amber-800 mb-2.5 font-bold flex items-center gap-1.5">
                            <span>💌</span> 给家长的一封信
                          </h4>
                          <p className="text-stone-750 text-xs leading-relaxed font-serif italic whitespace-pre-wrap">
                            {parentReport.warm_suggestion}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Double Consent Analysis Block */}
                    {parentReport && (
                      <div className="bg-bridge-blue/5 p-6 rounded-lg border border-bridge-blue/15 mt-8 space-y-3">
                        <h4 className="text-xs font-serif text-bridge-blue-dark mb-1 font-bold flex items-center gap-1.5">
                          <span>🌟</span> 双端共振分析：量子纠缠图景
                        </h4>
                        <p className="text-stone-700 text-xs leading-loose font-serif text-justify">
                          在这个突然失去重力的暑假，少年的直觉在极力挣脱教条规则的重力束缚，寻找属于个体的自由退相干空间；而家长的视线里虽满含对未来不确定性的隐忧，却最终用爱达成了对边界探索的克制留白。
                          分歧之中，少年的“战略应付”并非叛逆，而是理智资源的自我保护；家长的“理智引导”也并非束缚，而是将担忧化为了默默的相干屏蔽。
                          你们之间的引力并不依靠言语黏合，而是在理解与留白的不变量中产生共振。少年的每一次无畏逃逸，都源于背后有一双温润的双手在充当稳定的阻尼器。请带着这层共振，勇敢走向现实的粗糙。
                        </p>
                      </div>
                    )}

                    {/* Section 4: Static Signature (only show if single student mode) */}
                    {!parentReport && (
                      <div className="bg-bridge-blue/5 p-5 rounded-lg border border-bridge-blue/10 mt-6">
                        <h3 className="text-xs font-serif text-bridge-blue-dark mb-3 flex items-center gap-2 font-semibold">
                          <span className="text-base">🌻</span> 过来人的回响
                        </h3>
                        <p className="text-stone-600 text-xs leading-relaxed font-serif italic mb-4">
                          “恭喜你，被迫的人生终于要结束了。别担心走成什么样，没人的人生是一条坦途。接下来的路都要靠自己走了，别害怕。首先是你自由了，但这也是严重的考验。一起进步吧。”
                        </p>
                        <p className="text-right text-bridge-blue-dark/80 text-xs font-serif font-semibold">
                          —— 桥梁计划导师团
                        </p>
                      </div>
                    )}
                    {/* 免责声明 */}
                    <div className="border-t border-stone-300/40 pt-4 mt-6 text-[9px] text-stone-400 font-serif leading-relaxed text-center">
                      免责声明：本报告由 AI 语言模型自动生成。其内容仅作为数理逻辑直觉探索之参考，不构成任何心理诊断、治疗方案或升学及专业决策之绝对依据。如有情绪危机，请及时寻求专业诊疗。
                    </div>
                  </div>
                </div>

                {/* External Actions & Links (Not included in PDF) */}
                <div className="w-full max-w-2xl mt-8 space-y-6">
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 border border-bridge-blue/30 text-bridge-blue-dark font-serif text-sm rounded-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isDownloading ? "生成中..." : "⬇ 下载并保存当前报告"}
                    </button>
                  </div>

                  <div className="bg-white/80 p-6 rounded-xl border border-stone-200/60 shadow-sm">
                    <p className="text-center text-bridge-blue-dark font-serif mb-6 tracking-widest text-sm font-semibold">
                      「 人能给的，永远比 AI 更多。 」
                    </p>
                    <div className="flex flex-col gap-4">
                      <Link href="/quiz" className="flex items-center justify-between p-4 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-bridge-blue/40 transition-all group">
                        <span className="text-stone-700 font-serif text-sm group-hover:text-bridge-blue-dark transition-colors">想先看清自己的定量轮廓？</span>
                        <span className="text-xs text-stone-500 group-hover:text-bridge-blue/60">14 维素质测验 &rarr;</span>
                      </Link>
                      <Link href="/paid-chat" className="flex items-center justify-between p-4 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-bridge-blue/40 transition-all group">
                        <span className="text-stone-700 font-serif text-sm group-hover:text-bridge-blue-dark transition-colors">想聊得更深？数理生化算法专家对弈</span>
                        <span className="text-xs text-stone-500 group-hover:text-bridge-blue/60">付费 AI 对话 &rarr;</span>
                      </Link>
                      <Link href="/#consultation" className="flex items-center justify-between p-4 rounded-lg bg-bridge-blue/5 hover:bg-bridge-blue/10 border border-bridge-blue/20 transition-all group">
                        <span className="text-bridge-blue-dark font-serif text-sm">需要一双手拉你一把？清北科学长学姐在线</span>
                        <span className="text-xs text-bridge-blue">真人一对一咨询 &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input — fixed at bottom */}
          {!reportData && (
            <div className="flex flex-col border-t-2 border-bridge-blue/30 bg-white/60 backdrop-blur-md shrink-0 rounded-b-xl">
              <form onSubmit={handleSend} className="p-4 flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                  placeholder={isTyping ? "等待回应..." : "在此输入你最真实的直觉..."}
                  className="flex-1 px-4 py-2 bg-white border border-stone-300 rounded-md focus:border-bridge-blue/50 focus:outline-none text-stone-800 text-sm tracking-wide transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="px-6 py-2 bg-bridge-blue text-white font-serif text-sm tracking-widest rounded-md hover:bg-bridge-blue-dark disabled:opacity-50 disabled:hover:bg-bridge-blue transition-all duration-300 cursor-pointer"
                >
                  发送
                </button>
              </form>
              <p className="text-[10px] text-stone-400 font-serif text-center pb-2 px-4 select-none">
                本服务为 AI 辅助思维探索，非专业心理咨询或医学诊断。若面临情绪崩溃或心理危机，请寻求专业咨询或医疗热线帮助。
              </p>
            </div>
          )}
        </div>
      </div>
  );
}
