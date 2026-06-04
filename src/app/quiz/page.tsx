import type { Metadata } from "next";
import QuizPageClient from "./QuizPageClient";

export const metadata: Metadata = {
  title: "数理素质测评 — 千殊教育",
  description:
    "由 985 理工硕博学长团制作，8 维免费测评 + 14 维专业测评，科学计分模型，3D 素质图景与专业推荐。",
};

export default function QuizPage() {
  return <QuizPageClient />;
}
