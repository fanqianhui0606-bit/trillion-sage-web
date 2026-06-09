import type { Metadata } from "next";
import { ZCOOL_XiaoWei } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WelcomeSplash from "@/components/shared/WelcomeSplash";
import "./globals.css";

const zcoolXiaoWei = ZCOOL_XiaoWei({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "千殊教育",
  description: "数理素质测评与学术规划 — 发现你的天赋方向",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${zcoolXiaoWei.className} relative min-h-screen`}>
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-bridge-gradient-top from-0% via-bridge-gradient-bottom via-72% to-[#f4f4f7] to-100%" />
        <WelcomeSplash />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

