"use client";

export default function QuizError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-bridge-blue mb-3">测验加载失败</h2>
        <p className="text-bridge-muted text-sm mb-6">
          {error.message || "发生了未知错误，请刷新页面重试"}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-lg bg-bridge-blue text-white font-semibold text-sm hover:bg-bridge-blue-dark transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
