import SectionTitle from "@/components/shared/SectionTitle";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";

const TEAM_PREVIEW = [
  { school: "北京大学", status: "博士在读", field: "凝聚态物理研究" },
  { school: "中科院数学所", status: "博士在读", field: "分析相对论 / 天体物理" },
  { school: "南京大学", status: "博士在读", field: "柔性电子与新型材料" },
  { school: "中国科学技术大学", status: "硕士在读", field: "深空探测与天文仪器" },
];

export default function TeamPreviewSection() {
  return (
    <section id="team-preview" className="py-24 px-6">
      <SectionTitle
        title="一线科研导师阵容"
        subtitle="所有导师均来自 985 高校或中科院系统，身处科研最前沿"
      />

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {TEAM_PREVIEW.map((t, i) => (
          <GlassCard key={i} className="text-center">
            <p className="text-bridge-blue font-bold">{t.school}</p>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-bridge-blue/10 text-bridge-blue font-medium">
              {t.status}
            </span>
            <p className="text-xs text-bridge-muted mt-1">{t.field}</p>
          </GlassCard>
        ))}
      </div>

      <div className="text-center">
        <Button href="/team" variant="ghost">
          查看全部导师
        </Button>
      </div>
    </section>
  );
}
