"use client";

import { useEffect, useState } from "react";
import QuizEngine from "@/components/quiz/QuizEngine";
import QuizLanding from "@/components/quiz/QuizLanding";

function detectEditionFromURL(): string | null {
  if (typeof window === "undefined") return null;
  const e = new URLSearchParams(window.location.search).get("edition") || "";
  const lower = e.toLowerCase();
  if (lower === "simple" || lower === "简易" || lower === "体验" || lower === "免费") return "simple";
  if (lower === "user" || lower === "完整" || lower === "专业") return "user";
  if (lower === "inspect" || lower === "检验") return "inspect";
  return null; // no edition → show landing
}

export default function QuizPageClient() {
  const [edition, setEdition] = useState<string | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    setEdition(detectEditionFromURL());
  }, []);

  // Loading state
  if (edition === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-bridge-blue/30 border-t-bridge-blue rounded-full animate-spin" />
      </div>
    );
  }

  // No edition param → show landing with two buttons
  if (edition === null) {
    return <QuizLanding />;
  }

  // Has edition → launch quiz directly
  return <QuizEngine edition={edition} />;
}
