"use client";

import { useState, useEffect, useRef } from "react";
import Button from "./Button";

interface Message {
  sender: "ai" | "user";
  text: string;
  agentName?: string;
  borderColor?: string;
}

interface CozyChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CozyChatModal({ isOpen, onClose }: CozyChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [turn, setTurn] = useState(1);
  const [showReport, setShowReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize opening message
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Lock scroll
      setMessages([
        {
          sender: "ai",
          text: "你好呀。其实我观察你很久了，我发现你在处理那些复杂的逻辑时，眼神里有一种特别的安静。那种感觉，就像是一个人在月球上修补一段坏掉的信号，虽然厉害，但好像也有点寂寞。别担心，我不是来考你的，也不需要你表现得‘很优秀’。我只是好奇：在那些你觉得‘理所应当’的公式和逻辑里，有没有哪一个瞬间，让你觉得世界突然变得温柔了一点？或者你其实只觉得它们很无聊？",
          agentName: "主理人 · 温润导航员",
          borderColor: "border-bridge-gold/30 shadow-[0_0_12px_rgba(197,160,89,0.15)]",
        },
      ]);
      setTurn(1);
      setShowReport(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Background candle flickering & star dust animation
  useEffect(() => {
    if (!isOpen) return;
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

    // Star dust particles
    const dust: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 35; i++) {
      dust.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        speed: 0.003 + Math.random() * 0.005,
      });
    }

    // Flicker factor for candlelight simulation
    let flicker = 1.0;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Candlelight glow simulation (Radial gradient in bottom center)
      flicker += (Math.random() - 0.5) * 0.08;
      if (flicker > 1.25) flicker = 1.25;
      if (flicker < 0.8) flicker = 0.8;

      const grad = ctx.createRadialGradient(
        w / 2, h * 0.95, 20,
        w / 2, h * 0.85, 300 * flicker
      );
      grad.addColorStop(0, "rgba(245, 222, 179, 0.12)"); // Wheat / warm glow
      grad.addColorStop(0.4, "rgba(197, 160, 89, 0.04)"); // Amber gold
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Render star dust
      for (const d of dust) {
        d.alpha += d.speed;
        if (d.alpha > 0.65 || d.alpha < 0.05) d.speed *= -1;
        ctx.fillStyle = `rgba(197, 160, 89, ${Math.max(0, d.alpha)})`; // Gold tone stars
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
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInputValue("");
    setIsTyping(true);

    // Mock multi-turn conversation flow based on custom instructions
    setTimeout(() => {
      let aiResponse = "";
      let agentName = "主理人 · 温润导航员";
      let borderStyle = "border-bridge-gold/30 shadow-[0_0_12px_rgba(197,160,89,0.15)]";

      if (turn === 1) {
        aiResponse = "我懂了。其实很多像你一样聪明的孩子都觉得课本上的步骤极度冗余，甚至觉得把它写出来是对自己智商的一种羞辱。你平时是怎么打发这些无聊作业的？是拖到最后一刻，还是随便应付一下？你觉得这种‘应付’是对规则的叛逆，还是对你昂贵智力资源的自我保护？";
        setTurn(2);
      } else if (turn === 2) {
        // Invite Physics Expert (switching color and name)
        agentName = "物理星探 · 常数与交互 (物理 PhD 学姐)";
        borderStyle = "border-sky-400/40 shadow-[0_0_16px_rgba(56,189,248,0.2)]";
        aiResponse = "主理人刚才悄悄把我拉进来了，说看到你对‘战略性应付’很有直觉。既然我们在学校划水把脑力省下来了，我们来聊点硬核的。如果让你修改宇宙的一个基本常数，比如光速 c 稍微慢了一半，或者引力常数 G 稍微大一点，你觉得你每天早上起床刷牙时会看到什么现象？你最舍不得抹掉的又是哪一条常数？";
        setTurn(3);
      } else {
        // Invitation to consensus/report
        aiResponse = "哈哈，你脑子里对物质世界的‘颗粒感’非常有灵性。我用光子撞击你思维所得的波函数开始收敛了。AI 的算力是有局限的，但我们的真人学长学姐在等你。我已经将你刚才的思维干涉轨迹打包，你可以点击下方直接生成你的《底逻辑与天赋星图报告》，或者直接免测评费，一键升级连接真实的清北硕博导师，聊聊你在学校之外，到底能走多远。";
        setTurn(4);
        setShowReport(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiResponse,
          agentName,
          borderColor: borderStyle,
        },
      ]);
      setIsTyping(false);
    }, 1500); // 1.5s delay to simulate typing
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0d16] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Background Canvas for Candles & Star Dust */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Main Glass Panel Chat Box */}
      <div 
        className="relative z-10 w-full max-w-4xl h-[85vh] bg-stone-900/60 backdrop-blur-[24px] border border-amber-500/20 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-scale-in"
        style={{ boxShadow: "0 0 30px rgba(197, 160, 89, 0.1)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/10 flex items-center justify-between bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-bridge-gold animate-pulse" />
            <h2 className="font-serif text-bridge-gold tracking-widest text-sm md:text-base">
              发掘你的光 —— 赛博星光漫游
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-bridge-gold transition-colors font-serif text-xs px-3 py-1 border border-stone-700/60 rounded-md bg-stone-800/40 hover:bg-amber-500/10"
          >
            返回主页
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] md:max-w-[70%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start animate-slide-up"
              }`}
            >
              {/* Agent Name Tag */}
              {msg.sender === "ai" && msg.agentName && (
                <span className="text-[10px] md:text-xs font-serif text-bridge-gold/70 mb-1.5 ml-2 tracking-wider">
                  {msg.agentName}
                </span>
              )}

              {/* Chat Bubble */}
              <div
                className={`p-4 rounded-lg text-sm md:text-base leading-relaxed tracking-wide ${
                  msg.sender === "user"
                    ? "bg-amber-900/30 text-amber-100 border border-amber-500/20 rounded-tr-none shadow-[0_4px_12px_rgba(197,160,89,0.05)]"
                    : `bg-stone-900/80 text-stone-200 border rounded-tl-none ${msg.borderColor}`
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="mr-auto items-start flex flex-col max-w-[70%] animate-pulse">
              <span className="text-xs font-serif text-bridge-gold/50 mb-1.5 ml-2 tracking-wider">
                Agent 正在思考并编织回答...
              </span>
              <div className="bg-stone-950/40 p-4 border border-stone-800/50 rounded-lg rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-bridge-gold/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-bridge-gold/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-bridge-gold/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Report output & upsell card */}
          {showReport && (
            <div className="max-w-[95%] md:max-w-[85%] mx-auto mt-8 p-6 bg-amber-950/15 backdrop-blur-md border border-bridge-gold/20 rounded-xl flex flex-col items-center gap-6 animate-fade-in shadow-[0_0_24px_rgba(197,160,89,0.08)]">
              <span className="text-xs font-serif text-bridge-gold/70 tracking-[0.25em]">
                星尘轨迹 · 最终波函数收敛报告
              </span>
              
              {/* Interference Wave Graphic (HTML Canvas effect simulation) */}
              <div className="w-full h-20 bg-stone-950/80 rounded border border-stone-800/60 overflow-hidden relative flex items-center justify-center">
                {/* Wave Lines */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-bridge-gold/80 to-transparent animate-pulse" />
                <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent top-1/3 blur-[1px]" />
                <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent bottom-1/3 blur-[1px]" />
                
                <span className="relative z-10 font-serif text-xs md:text-sm text-bridge-gold/95 drop-shadow-[0_0_6px_rgba(197,160,89,0.8)] tracking-widest uppercase">
                  偏差警报：量表测验显示「分析稳定性强」，但聊天显示「眼高手低与高频直觉」。
                </span>
              </div>

              {/* Upsell Content */}
              <p className="text-stone-300 font-serif text-xs md:text-sm leading-loose text-center max-w-xl">
                你在测验中的逻辑骨架非常稳定，但你与星探的对话，却投射出对平庸公式生理性厌恶的「高阶思维偏差」。这种骨架与灵魂直觉的冲突，是拔尖人才常见的思维阵痛。
                我们已自动将你的双重报告归入档案。建议你直接预约清华/北大/科大的硕博导师通话，为你解密你的双重星图。
              </p>

              {/* Premium Link Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button href="/team#consult" variant="primary">
                  一键升级连接导师 (真人一对一)
                </Button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-stone-700 hover:border-stone-500 rounded text-stone-400 hover:text-stone-200 transition-all text-xs font-serif tracking-widest bg-stone-900/30"
                >
                  暂不需要，返回
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input Bar */}
        {!showReport && (
          <form onSubmit={handleSend} className="p-4 border-t border-amber-500/10 bg-black/10 flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              placeholder={isTyping ? "等待 Agent 编织回答中..." : "在此输入你最真实的直觉和吐槽，同类在听..."}
              className="flex-1 px-4 py-2 bg-stone-900/80 border border-stone-800 rounded-md focus:border-bridge-gold/50 focus:outline-none text-stone-200 text-sm tracking-wide transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="px-6 py-2 bg-bridge-gold text-stone-950 font-serif text-sm tracking-widest rounded-md hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-bridge-gold transition-all duration-300"
            >
              发送
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
