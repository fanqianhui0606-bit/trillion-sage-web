"use client";

import { useState, useEffect } from "react";
import type { WheelData, CompetencyVector } from "@/lib/types";

interface Sector {
  id: string;
  name: string;
  parentName: string;
  start: number; // 角度 0–360
  end: number;
  color: string;
  activeColor: string;
}

const MAJOR_SECTORS: Sector[] = [
  // 数学区 (0–60)
  { id: "L2a", name: "数学与统计", parentName: "数学", start: 0, end: 30, color: "rgba(46, 117, 182, 0.15)", activeColor: "rgba(46, 117, 182, 0.85)" },
  { id: "L2h", name: "力学与装备", parentName: "数学", start: 30, end: 60, color: "rgba(46, 117, 182, 0.15)", activeColor: "rgba(46, 117, 182, 0.85)" },
  // 物理区 (60–120)
  { id: "L2b", name: "物理与天文", parentName: "物理", start: 60, end: 80, color: "rgba(107, 33, 168, 0.15)", activeColor: "rgba(107, 33, 168, 0.85)" },
  { id: "L2e", name: "地球与行星", parentName: "物理", start: 80, end: 100, color: "rgba(107, 33, 168, 0.15)", activeColor: "rgba(107, 33, 168, 0.85)" },
  { id: "L2n", name: "航空与力学", parentName: "物理", start: 100, end: 120, color: "rgba(107, 33, 168, 0.15)", activeColor: "rgba(107, 33, 168, 0.85)" },
  // 化学区 (120–180)
  { id: "L2c", name: "化学与化工", parentName: "化学", start: 120, end: 140, color: "rgba(22, 163, 74, 0.15)", activeColor: "rgba(22, 163, 74, 0.85)" },
  { id: "L2g", name: "材料与器件", parentName: "化学", start: 140, end: 160, color: "rgba(22, 163, 74, 0.15)", activeColor: "rgba(22, 163, 74, 0.85)" },
  { id: "L2k", name: "化工与制药", parentName: "化学", start: 160, end: 180, color: "rgba(22, 163, 74, 0.15)", activeColor: "rgba(22, 163, 74, 0.85)" },
  // 生物区 (180–240)
  { id: "L2d", name: "生物与技术", parentName: "生物", start: 180, end: 200, color: "rgba(220, 38, 38, 0.15)", activeColor: "rgba(220, 38, 38, 0.85)" },
  { id: "L2l", name: "生物医学工", parentName: "生物", start: 200, end: 220, color: "rgba(220, 38, 38, 0.15)", activeColor: "rgba(220, 38, 38, 0.85)" },
  { id: "L2m", name: "环境与发展", parentName: "生物", start: 220, end: 240, color: "rgba(220, 38, 38, 0.15)", activeColor: "rgba(220, 38, 38, 0.85)" },
  // 计算机区 (240–300)
  { id: "L2p", name: "计算机智能", parentName: "计算机", start: 240, end: 260, color: "rgba(234, 179, 8, 0.15)", activeColor: "rgba(234, 179, 8, 0.85)" },
  { id: "L2o", name: "智能控制", parentName: "计算机", start: 260, end: 280, color: "rgba(234, 179, 8, 0.15)", activeColor: "rgba(234, 179, 8, 0.85)" },
  { id: "L2q", name: "交叉与智能", parentName: "计算机", start: 280, end: 300, color: "rgba(234, 179, 8, 0.15)", activeColor: "rgba(234, 179, 8, 0.85)" },
  // 工程区 (300–360)
  { id: "L2f", name: "微电与光电", parentName: "工程", start: 300, end: 320, color: "rgba(249, 115, 22, 0.15)", activeColor: "rgba(249, 115, 22, 0.85)" },
  { id: "L2i", name: "能源与物性", parentName: "工程", start: 320, end: 340, color: "rgba(249, 115, 22, 0.15)", activeColor: "rgba(249, 115, 22, 0.85)" },
  { id: "L2j", name: "土木与海洋", parentName: "工程", start: 340, end: 360, color: "rgba(249, 115, 22, 0.15)", activeColor: "rgba(249, 115, 22, 0.85)" }
];

const SUBJECT_SECTORS = [
  { name: "数学", start: 0, end: 60, color: "rgba(46, 117, 182, 0.08)" },
  { name: "物理", start: 60, end: 120, color: "rgba(107, 33, 168, 0.08)" },
  { name: "化学", start: 120, end: 180, color: "rgba(22, 163, 74, 0.08)" },
  { name: "生物", start: 180, end: 240, color: "rgba(220, 38, 38, 0.08)" },
  { name: "计算机", start: 240, end: 300, color: "rgba(234, 179, 8, 0.08)" },
  { name: "工程", start: 300, end: 360, color: "rgba(249, 115, 22, 0.08)" }
];

// 辅助函数：角度转弧度，且减去 90 度使 0 度在圆正上方
function degToRad(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

// 弧度绘制路径公式
function getSectorPath(cx: number, cy: number, rIn: number, rOut: number, startAngle: number, endAngle: number) {
  const sRad = degToRad(startAngle);
  const eRad = degToRad(endAngle);
  
  const x1_in = cx + rIn * Math.cos(sRad);
  const y1_in = cy + rIn * Math.sin(sRad);
  const x2_in = cx + rIn * Math.cos(eRad);
  const y2_in = cy + rIn * Math.sin(eRad);
  
  const x1_out = cx + rOut * Math.cos(sRad);
  const y1_out = cy + rOut * Math.sin(sRad);
  const x2_out = cx + rOut * Math.cos(eRad);
  const y2_out = cy + rOut * Math.sin(eRad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `
    M ${x1_out} ${y1_out}
    A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out}
    L ${x2_in} ${y2_in}
    A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x1_in} ${y1_in}
    Z
  `;
}

interface SubjectWheelProps {
  onHoverMajor: (profile: CompetencyVector | null, title?: string, intro?: string) => void;
}

export default function SubjectWheel({ onHoverMajor }: SubjectWheelProps) {
  const [wheelData, setWheelData] = useState<WheelData | null>(null);
  const [hoveredMajorId, setHoveredMajorId] = useState<string | null>(null);
  const [hoveredMajorName, setHoveredMajorName] = useState<string>("数理学科");
  const [hoveredMajorIntro, setHoveredMajorIntro] = useState<string>("悬停二级专业大类，即可在 3D 模型中实时交互联动其数理画像。");

  useEffect(() => {
    fetch("/data/wheel-data.json")
      .then((r) => r.json())
      .then(setWheelData)
      .catch((e) => console.error("学科轮盘载入数据失败", e));
  }, []);

  const handleHover = (sector: Sector | null) => {
    if (!sector) {
      setHoveredMajorId(null);
      setHoveredMajorName("数理学科");
      setHoveredMajorIntro("悬停二级专业大类，即可在 3D 模型中实时交互联动其数理画像。");
      onHoverMajor(null);
      return;
    }

    setHoveredMajorId(sector.id);
    setHoveredMajorName(sector.name);
    
    // 从 wheelData 获取该二级专业并获取官方介绍
    const l2 = wheelData?.level2.find((m) => m.id === sector.id);
    const intro = l2?.officialIntro || "暂无介绍。";
    setHoveredMajorIntro(intro);

    if (l2?.profile) {
      onHoverMajor(l2.profile, sector.name, intro);
    }
  };

  const cx = 200;
  const cy = 200;

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full select-none">
      {/* SVG Wheel Wrapper */}
      <div className="relative w-full max-w-[380px] aspect-square rounded-full shadow-glass border border-white/25 bg-white/5 backdrop-blur-md p-2 flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-full transform transition-transform duration-500 hover:scale-[1.02]">
          {/* 1. 内环 一级学科 (r = 55 -> 100) */}
          {SUBJECT_SECTORS.map((s) => {
            const pathD = getSectorPath(cx, cy, 55, 100, s.start, s.end);
            // 计算文字中心位置与旋转
            const mid = (s.start + s.end) / 2;
            const textR = 77.5;
            const tx = cx + textR * Math.cos(degToRad(mid));
            const ty = cy + textR * Math.sin(degToRad(mid));
            
            return (
              <g key={s.name} className="group/subject">
                <path
                  d={pathD}
                  fill={s.color}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                  className="transition-all duration-300 hover:fill-bridge-blue/20"
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill="#C5A059"
                  className="text-xs font-bold pointer-events-none select-none tracking-wider"
                  transform={`rotate(${mid}, ${tx}, ${ty})`}
                >
                  {s.name}
                </text>
              </g>
            );
          })}

          {/* 2. 外环 二级专业 (r = 105 -> 165) */}
          {MAJOR_SECTORS.map((s) => {
            const isHovered = hoveredMajorId === s.id;
            const pathD = getSectorPath(cx, cy, 105, 165, s.start, s.end);
            
            // 计算文字中心位置与旋转
            const mid = (s.start + s.end) / 2;
            const textR = 135;
            const tx = cx + textR * Math.cos(degToRad(mid));
            const ty = cy + textR * Math.sin(degToRad(mid));

            // 文字如果是朝下的，旋转 180 度使其正立 (90 - 270度之间)
            const rotateAngle = mid > 90 && mid < 270 ? mid + 180 : mid;

            return (
              <g
                key={s.id}
                onMouseEnter={() => handleHover(s)}
                onMouseLeave={() => handleHover(null)}
                className="cursor-pointer group/major"
              >
                <path
                  d={pathD}
                  fill={isHovered ? s.activeColor : s.color}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.2"
                  className="transition-all duration-300 ease-out transform origin-center hover:scale-[1.01]"
                  style={{
                    filter: isHovered ? "drop-shadow(0 0 6px rgba(46,117,182,0.4))" : "none"
                  }}
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={isHovered ? "#ffffff" : "#2E75B6"}
                  className="text-[10px] font-semibold pointer-events-none tracking-tight transition-colors duration-300"
                  transform={`rotate(${rotateAngle}, ${tx}, ${ty})`}
                >
                  {s.name}
                </text>
              </g>
            );
          })}

          {/* 3. 中心圆指示区 (r = 50) */}
          <circle
            cx={cx}
            cy={cy}
            r="50"
            fill="rgba(10, 15, 24, 0.85)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
            className="backdrop-blur-sm"
          />
          
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#ffffff"
            className="text-xs font-bold pointer-events-none max-w-[80px]"
          >
            {hoveredMajorName}
          </text>
        </svg>
      </div>

      {/* Description Panel */}
      <div className="mt-6 w-full max-w-[380px] min-h-[90px] p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300">
        <h4 className="text-sm font-bold text-bridge-gold mb-1">
          {hoveredMajorName}
        </h4>
        <p className="text-xs text-bridge-muted leading-relaxed">
          {hoveredMajorIntro}
        </p>
      </div>
    </div>
  );
}
