"use client";

import Button from "@/components/shared/Button";
import GlassCard from "@/components/shared/GlassCard";

export default function QuizLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-4xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-bridge-blue text-center mb-2">
          数理素质测评
        </h1>
        <p className="text-bridge-muted text-center text-sm mb-10">
          由 985 理工硕博学长团制作，基于科学计分模型，帮你找到最适合的理工专业方向
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free edition */}
          <GlassCard className="text-center py-10 px-6 flex flex-col items-center">
            <span className="inline-block px-3 py-1 text-sm rounded-md bg-green-100/60 text-green-700 font-semibold mb-3">
              体验版
            </span>
            <h3 className="text-xl font-bold text-bridge-blue mb-1">免费测评</h3>
            <p className="text-bridge-muted text-sm mb-4">面向所有用户开放</p>

            <ul className="text-left text-sm text-bridge-muted space-y-2 mb-8">
              <li>· 18 道精选题目</li>
              <li>· 8 维数理素质评估</li>
              <li>· 约 5 分钟完成</li>
              <li>· Top5 专业方向推荐</li>
              <li>· 参考 2026 教育部本科专业目录</li>
            </ul>

            <div className="mt-auto">
              <Button href="/quiz?edition=simple" variant="primary">
                开始免费测评
              </Button>
            </div>
          </GlassCard>

          {/* Full edition */}
          <GlassCard className="text-center py-10 px-6 flex flex-col items-center">
            <span className="inline-block px-3 py-1 text-sm rounded-md bg-bridge-blue/10 text-bridge-blue font-semibold mb-3">
              完整版
            </span>
            <h3 className="text-xl font-bold text-bridge-blue mb-1">专业测评</h3>
            <p className="text-bridge-muted text-sm mb-4">更全面的素质画像</p>

            <ul className="text-left text-sm text-bridge-muted space-y-2 mb-8">
              <li>· 35 道精选题目</li>
              <li>· 14 维全面评估</li>
              <li>· 约 15 分钟完成</li>
              <li>· 价值导向分析</li>
              <li>· 全部 17 个专业匹配值</li>
            </ul>

            <div className="mt-auto">
              <Button href="/quiz?edition=user" variant="secondary">
                开始完整测评
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
