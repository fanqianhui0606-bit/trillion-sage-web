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

  // 来自咨询流程的一键跳转参数：激活码 / 姓名 / 返回地址
  const autoCode = searchParams.get("code") || undefined;
  const autoName = searchParams.get("name") || undefined;
  const returnTo = searchParams.get("return") || undefined;

  // 携带激活码时，默认进入专业版
  if (edition === null && autoCode) {
    edition = "user";
  }

  // No edition param → show landing with two buttons
  if (edition === null) {
    return <QuizLanding />;
  }

  // Has edition → launch quiz directly
  return (
    <QuizEngine
      edition={edition}
      autoCode={autoCode}
      autoName={autoName}
      returnTo={returnTo}
    />
  );
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

