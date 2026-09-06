import Button from "@/components/shared/Button";
import GlassCard from "@/components/shared/GlassCard";
import SectionTitle from "@/components/shared/SectionTitle";

const FEATURES = [
  {
    title: "光环效益",
    desc: "孩子获得和多位资深高科技人才沟通交流的机会，利于培养孩子高考目标和成长目标，致力成为像我们一样的国家高科技人才。",
  },
  {
    title: "顶峰嗅觉",
    desc: "讲座聚焦8种最具发展潜力的数理专业，该领域专业人才学长，一眼看清未来科技起飞方向。",
  },
  {
    title: "鹰览视角",
    desc: "我们使用千殊独有3+1科学模式讲解，从「学科前景」、「发展潜力」、「研途经历」三种维度辅助一个科学原理，帮助孩子获得全面鹰览视角。",
  },
];

const QUICK_FACTS = [
  { label: "聚焦专业", value: "8 种" },
  { label: "营期时长", value: "8 天" },
  { label: "招生限额", value: "40 人" },
  { label: "开营时间", value: "2026 秋季" },
];

export default function ProgramsPreviewSection() {
  return (
    <section id="programs-preview" className="min-h-screen flex items-center py-24 px-6 scroll-mt-16">
      <div className="max-w-5xl mx-auto w-full">
        <SectionTitle
          title="数理线上营"
          subtitle="聚焦8种最具发展潜力的数理专业，资深学长用3+1科学模式讲解、在线直播讲座，未来科技起飞方向一目了然。"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {FEATURES.map((item) => (
            <GlassCard key={item.title} className="text-center">
              <h3 className="text-lg font-bold text-bridge-blue mb-3">{item.title}</h3>
              <p className="text-bridge-muted text-sm leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="border border-bridge-gold/25 bg-gradient-to-r from-amber-50/20 to-transparent mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {QUICK_FACTS.map((f) => (
              <div key={f.label}>
                <p className="text-xl font-bold text-bridge-gold font-mono">{f.value}</p>
                <p className="text-xs text-bridge-muted mt-1">{f.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/programs" variant="secondary">
            了解更多
          </Button>
          <Button href="/downloads/programs-overview.pdf" variant="primary" download>
            查看线上营信息
          </Button>
        </div>
      </div>
    </section>
  );
}
