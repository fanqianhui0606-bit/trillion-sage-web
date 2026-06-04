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
        serif: [
          "Songti SC",
          "SimSun",
          "STSong",
          "Noto Serif SC",
          "Source Han Serif SC",
          "Georgia",
          "serif",
        ],
        sans: [
          "Noto Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
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
      },
    },
  },
  plugins: [],
};
export default config;
