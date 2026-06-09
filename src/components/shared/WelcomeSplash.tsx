"use client";

import { useState, useEffect, useRef } from "react";
import greetingsData from "../../../public/data/greetings.json";

interface Greeting {
  id: number;
  text: string;
}

interface GreetingsJson {
  student: Greeting[];
  parent: Greeting[];
}

const data = greetingsData as unknown as GreetingsJson;

export default function WelcomeSplash() {
  const [visible, setVisible] = useState(false);
  const [identity, setIdentity] = useState<"student" | "parent" | null>(null);
  const [selectedGreeting, setSelectedGreeting] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const splashRef = useRef<HTMLDivElement | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent welcome splash showing repeatedly in the same session
    const hasVisited = sessionStorage.getItem("visited_welcome_splash_2.0");
    if (hasVisited) {
      setVisible(false);
      return;
    }
    setVisible(true);

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  // Handle identity choice and trigger greeting fade-in
  const handleSelectIdentity = (type: "student" | "parent") => {
    setIdentity(type);
    
    // Choose a random greeting from the selected list
    const list = data[type];
    const randomIdx = Math.floor(Math.random() * list.length);
    setSelectedGreeting(list[randomIdx].text);

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    // Auto dismiss after 5.5 seconds (display greeting for 4.2s + fade out 1.8s)
    dismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, 5500);
  };

  // Canvas particle animation
  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle classes
    class Sparkle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      decay: number;
      size: number;
      color: string;

      constructor(x: number, y: number, vx: number, vy: number) {
        this.x = x;
        this.y = y;
        this.vx = vx + (Math.random() - 0.5) * 1.5;
        this.vy = vy + (Math.random() - 0.5) * 1.5;
        this.alpha = 1.0;
        this.decay = 0.012 + Math.random() * 0.012; // Slower particles decay
        this.size = 1 + Math.random() * 2.5;
        this.color = `rgba(197, 160, 89, ${Math.random() * 0.4 + 0.6})`; // Golden shade
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.015; // light gravity
        this.vx *= 0.985; // friction
        this.vy *= 0.985;
        this.alpha -= this.decay;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.shadowBlur = 10;
        c.shadowColor = "#C5A059";
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    class Butterfly {
      x!: number;
      y!: number;
      targetX!: number;
      targetY!: number;
      speed!: number;
      scale!: number;
      wingAngle: number;
      wingDir: number;
      angle: number;

      constructor() {
        this.reset(true);
        this.wingAngle = 0;
        this.wingDir = 1;
        this.angle = 0;
      }

      reset(init = false) {
        this.x = init ? -50 - Math.random() * 200 : -50;
        this.y = Math.random() * (height * 0.7) + height * 0.15;
        this.targetX = width + 100;
        this.targetY = this.y + (Math.random() - 0.5) * 200;
        this.speed = 2.0 + Math.random() * 2.5; // Slightly slower, more gentle flutter
        this.scale = 0.5 + Math.random() * 0.5;
        this.angle = 0;
      }

      update(sparkles: Sparkle[]) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
          this.reset();
        } else {
          const moveAngle = Math.atan2(dy, dx);
          this.angle = moveAngle;
          this.x += Math.cos(moveAngle) * this.speed;
          this.y += Math.sin(moveAngle) * this.speed + Math.sin(Date.now() * 0.004) * 0.6; // wave flutter
        }

        this.wingAngle += 0.22 * this.wingDir;
        if (this.wingAngle > 1 || this.wingAngle < -0.2) {
          this.wingDir *= -1;
        }

        if (Math.random() < 0.55) {
          sparkles.push(new Sparkle(this.x, this.y, -Math.cos(this.angle) * 1.0, -Math.sin(this.angle) * 1.0));
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle + Math.PI / 2);
        c.scale(this.scale, this.scale);

        c.shadowBlur = 18;
        c.shadowColor = "#C5A059";
        c.fillStyle = "rgba(197, 160, 89, 0.95)"; // Gold
        
        const wScale = Math.cos(this.wingAngle * Math.PI / 2);

        // Left Wing
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(-15 * wScale, -15, -25 * wScale, -5, -20 * wScale, 15);
        c.bezierCurveTo(-12 * wScale, 20, -5 * wScale, 12, 0, 0);
        c.fill();

        // Right Wing
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(15 * wScale, -15, 25 * wScale, -5, 20 * wScale, 15);
        c.bezierCurveTo(12 * wScale, 20, 5 * wScale, 12, 0, 0);
        c.fill();

        // Antennas
        c.strokeStyle = "rgba(197, 160, 89, 0.7)";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(0, -2);
        c.quadraticCurveTo(-4, -10, -5, -15);
        c.moveTo(0, -2);
        c.quadraticCurveTo(4, -10, 5, -15);
        c.stroke();

        c.restore();
      }
    }

    const sparkles: Sparkle[] = [];
    const butterflies = [new Butterfly(), new Butterfly()];

    // Ambient background stars
    const ambientStars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 45; i++) {
      ambientStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.5 + 0.1,
        speed: 0.004 + Math.random() * 0.008,
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background ambient stars
      for (const star of ambientStars) {
        star.alpha += star.speed;
        if (star.alpha > 0.8 || star.alpha < 0.1) star.speed *= -1;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, star.alpha)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update & Draw sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.update();
        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
        } else {
          s.draw(ctx);
        }
      }

      // Update & Draw butterflies
      for (const b of butterflies) {
        b.update(sparkles);
        b.draw(ctx);
      }

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [visible]);

  const handleDismiss = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    if (splashRef.current) {
      splashRef.current.classList.add("opacity-0");
      splashRef.current.style.transform = "scale(1.025)"; // Smooth expansion dissolve
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("visited_welcome_splash_2.0", "true");
      }, 1800); // 1.8s fade out transition
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={splashRef}
      onClick={identity !== null ? handleDismiss : undefined}
      className={`fixed inset-0 z-[100] bg-gradient-to-b from-bridge-gradient-top from-0% via-bridge-gradient-bottom via-72% to-[#f4f4f7] to-100% flex flex-col items-center justify-center transition-all duration-[1800ms] ease-out select-none ${identity !== null ? "cursor-pointer" : ""}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      {/* Container wrapper */}
      <div className="relative z-10 max-w-2xl px-8 text-center flex flex-col items-center gap-8 w-full">
        
        {/* Subtle Title Badge */}
        <div className="text-bridge-blue-dark/60 text-[10px] tracking-[0.25em] font-serif uppercase">
          桥梁计划 · 给高考后你的小礼物
        </div>

        {identity === null ? (
          // Selection Step
          <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-md">
            <h2 className="text-lg md:text-xl font-serif text-stone-800 leading-relaxed tracking-wider">
              在这个被常数精细调节的宇宙里，你是：
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={() => handleSelectIdentity("student")}
                className="px-6 py-3 border border-bridge-blue/40 rounded-md font-serif text-sm text-bridge-blue hover:text-bridge-blue-dark hover:border-bridge-blue hover:bg-bridge-blue/10 transition-all duration-500 backdrop-blur-sm"
              >
                探寻星轨的少年 (学生)
              </button>
              
              <button
                onClick={() => handleSelectIdentity("parent")}
                className="px-6 py-3 border border-amber-600/40 rounded-md font-serif text-sm text-amber-800 hover:text-amber-900 hover:border-amber-600 hover:bg-amber-600/10 transition-all duration-500 backdrop-blur-sm"
              >
                静候回音的守护者 (家长)
              </button>
            </div>
          </div>
        ) : (
          // Greeting text display
          <div className="flex flex-col items-start gap-6 animate-fade-in w-full max-w-xl mx-auto">
            <h1 
              style={{
                fontFamily: '"Noto Serif SC", "Source Han Serif SC", "SimSun", "STSong", "Songti SC", serif',
                textJustify: 'inter-character'
              }}
              className="text-base md:text-lg text-stone-850 leading-loose tracking-wide transition-all text-justify whitespace-pre-wrap w-full font-serif"
            >
              {selectedGreeting}
            </h1>

            {/* Signature */}
            <div 
              style={{
                fontFamily: '"Noto Serif SC", "Source Han Serif SC", "SimSun", "STSong", "Songti SC", serif'
              }}
              className="text-stone-600 text-xs md:text-sm tracking-widest text-right w-full mt-4 pr-4 font-serif"
            >
              —— 桥梁计划主理人
            </div>
            
            {/* Click to skip text during greeting */}
            <div 
              onClick={handleDismiss}
              className="mt-6 text-stone-400 text-[10px] font-serif hover:text-stone-600 cursor-pointer animate-pulse transition-all self-center"
            >
              点击屏幕任意位置跳过并进入网站
            </div>
          </div>
        )}
      </div>

      {/* Top right skip button (always available) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-8 right-8 z-[110] px-3 py-1.5 border border-stone-300 rounded-md font-serif text-[10px] text-stone-500 hover:text-stone-850 hover:border-stone-400 hover:bg-stone-100 transition-all duration-300 backdrop-blur-sm"
      >
        跳过寄语
      </button>
    </div>
  );
}
