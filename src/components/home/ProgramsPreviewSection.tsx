import Button from "@/components/shared/Button";
import GlassCard from "@/components/shared/GlassCard";

const PREVIEW_MAJORS = [
  "数学与统计 · 机器学习与预测",
  "凝聚态物理 · 半导体与量子材料",
  "量子信息 · 量子计算飞跃",
  "天文学 · 黑洞与深空探索",
  "电子信息 · 芯片与信号处理",
  "材料科学 · 下一代智能材料",
  "应用数学 · 密码与现代数学",
  "计算机 / AI · 人工智能底层与应用",
  "生物技术 · 基因编辑与创新药",
];

export default function ProgramsPreviewSection() {
  return (
    <section id="programs-preview" className="min-h-screen flex items-center px-6">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-bridge-text text-center leading-tight">
          数理学科线上衔接营
        </h2>
        <p className="mt-3 text-center text-bridge-muted text-sm">
          —— 响应国家号召，培养未来高科技人才 ——
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <GlassCard className="text-center">
            <h4 className="text-lg font-bold text-bridge-blue mb-2">985 硕博团队</h4>
            <p className="text-bridge-muted text-sm leading-relaxed">
              千殊本/硕/博名师授课，涵盖高校教授、国家实验室博士、中科院直博等
            </p>
          </GlassCard>
          <GlassCard className="text-center">
            <h4 className="text-lg font-bold text-bridge-blue mb-2">3+1 教学模型</h4>
            <p className="text-bridge-muted text-sm leading-relaxed">
              学科全景 × 发展潜力 × 职业图景 + 核心原理精讲，帮助锚定专业方向
            </p>
          </GlassCard>
          <GlassCard className="text-center">
            <h4 className="text-lg font-bold text-bridge-blue mb-2">线上直播</h4>
            <p className="text-bridge-muted text-sm leading-relaxed">
              腾讯会议互动直播 + 社群答疑 + 可选的 1 对 1 专业咨询
            </p>
          </GlassCard>
        </div>

        <GlassCard className="mt-6">
          <h4 className="text-base font-bold text-bridge-blue mb-3 text-center">
            聚焦 9 个高发展潜力理工专业
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
            {PREVIEW_MAJORS.map((m) => (
              <p key={m} className="text-sm text-bridge-muted">
                {m}
              </p>
            ))}
          </div>
        </GlassCard>

        <div className="text-center mt-8">
          <Button href="/programs" variant="primary">
            了解更多
          </Button>
        </div>
      </div>
    </section>
  );
}
