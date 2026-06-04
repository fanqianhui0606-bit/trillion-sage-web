export default function QuizLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-bridge-blue/30 border-t-bridge-blue rounded-full animate-spin mx-auto mb-4" />
        <p className="text-bridge-muted">加载测验数据...</p>
      </div>
    </div>
  );
}
