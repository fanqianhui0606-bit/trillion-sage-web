import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bridge-blue": "#2E75B6",
        "bridge-blue-dark": "#245F94",
        "bridge-blue-light": "#5A9FD4",
        "bridge-text": "#1A1A1A",
        "bridge-muted": "#4A4A4A",
        "bridge-gold": "#C5A059",
        "bridge-gradient-top": "#A5A8C7",
        "bridge-gradient-bottom": "#EBEBEF",
        "bridge-panel": "rgba(255, 255, 255, 0.3)",
        "bridge-panel-border": "rgba(255, 255, 255, 0.95)",
        "bridge-3d-bg": "#0A0F18",
      },
      fontFamily: {
        // 思源黑体（Noto Sans SC / Source Han Sans）
        sans: [
          "Noto Sans SC",
          "Source Han Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
        // 全站统一黑体；保留 serif 别名以免旧 class 回退到宋体
        serif: [
          "Noto Sans SC",
          "Source Han Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
        // 鸿雷拙书简体 — 「桥梁计划」「千殊教育」
        brand: [
          "HongLeiZhuoShu",
          "Noto Sans SC",
          "sans-serif",
        ],
        // 江西拙楷 — 测验总评正文
        zhuokai: [
          "jiangxizhuokai",
          "Noto Sans SC",
          "sans-serif",
        ],
      },
      // 相对默认再上调一档，配合 html 112.5% 形成「正文+1 / 标题可再+1」
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        sm: ["1rem", { lineHeight: "1.5rem" }],
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.5rem", { lineHeight: "2rem" }],
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "4xl": ["3rem", { lineHeight: "1" }],
        "5xl": ["3.75rem", { lineHeight: "1" }],
        "6xl": ["4.5rem", { lineHeight: "1" }],
        "7xl": ["6rem", { lineHeight: "1" }],
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        glass: "0 4px 16px rgba(46, 117, 182, 0.08)",
        "glass-lg": "0 8px 32px rgba(46, 117, 182, 0.12)",
      },
      gridTemplateColumns: {
        "14": "repeat(14, minmax(0, 1fr))",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "bar-grow": "barGrow 0.8s ease-out",
        "spin-slow": "spin 20s linear infinite",
        "ty-logo": "tyLogoIn 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards",
        "ty-spark": "tySpark 1.5s ease-out var(--sd, 0ms) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        barGrow: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        tyLogoIn: {
          "0%": { opacity: "0", transform: "scale(0.4)" },
          "60%": { opacity: "1", transform: "scale(1.12)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        tySpark: {
          "0%": { opacity: "0", transform: "rotate(var(--ang)) translateY(0) scale(1)" },
          "15%": { opacity: "1" },
          "100%": {
            opacity: "0",
            transform: "rotate(var(--ang)) translateY(-72px) scale(0.3)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
