import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WelcomeSplash from "@/components/shared/WelcomeSplash";
import "@fontsource/noto-sans-sc/chinese-simplified-400.css";
import "@fontsource/noto-sans-sc/chinese-simplified-500.css";
import "@fontsource/noto-sans-sc/chinese-simplified-700.css";
import "@/styles/honglei.font.css";
import "@/styles/jxzk.font.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "千殊教育",
  description: "数理素质测评与学术规划 — 发现你的天赋方向",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="relative min-h-screen font-sans">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-bridge-gradient-top from-0% via-bridge-gradient-bottom via-72% to-[#f4f4f7] to-100%" />
        <WelcomeSplash />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
