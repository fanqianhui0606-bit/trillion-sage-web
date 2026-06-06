"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QuizEngine from "@/components/quiz/QuizEngine";
import QuizLanding from "@/components/quiz/QuizLanding";

function QuizPageInner() {
  const searchParams = useSearchParams();
  const rawEdition = (searchParams.get("edition") || "").toLowerCase();

  let edition: string | null = null;
  if (rawEdition === "simple" || rawEdition === "简易" || rawEdition === "体验" || rawEdition === "免费") {
    edition = "simple";
  } else if (rawEdition === "user" || rawEdition === "完整" || rawEdition === "专业") {
    edition = "user";
  } else if (rawEdition === "inspect" || rawEdition === "检验") {
    edition = "inspect";
  }

  // No edition param → show landing with two buttons
  if (edition === null) {
    return <QuizLanding />;
  }

  // Has edition → launch quiz directly
  return <QuizEngine edition={edition} />;
}

export default function QuizPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-bridge-blue/30 border-t-bridge-blue rounded-full animate-spin" />
        </div>
      }
    >
      <QuizPageInner />
    </Suspense>
  );
}

