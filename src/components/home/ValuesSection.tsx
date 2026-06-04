import SectionTitle from "@/components/shared/SectionTitle";
import GlassCard from "@/components/shared/GlassCard";

const VALUES = [
  {
    title: "前瞻认知",
    desc: "基于数学物理前沿视角，帮助学生建立对学科本质的深层理解，而非应付考试的短期技巧。",
  },
  {
    title: "学术社群",
    desc: "汇聚来自世界一流高校的硕博导师，构建持续的学术交流与成长社群。",
  },
  {
    title: "精准规划",
    desc: "通过数理素质测评科学定位能力结构，匹配最适合的专业方向与学术路径。",
  },
];

export default function ValuesSection() {
  return (
    <section id="values" className="py-24 px-6">
      <SectionTitle
        title="我们的理念"
        subtitle="以学术素养为核心，为每一位学生定制通向顶尖大学的长线方案"
      />
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {VALUES.map((v) => (
          <GlassCard key={v.title} className="text-center">
            <h3 className="text-lg font-bold text-bridge-blue mb-3">
              {v.title}
            </h3>
            <p className="text-bridge-muted text-sm leading-relaxed">{v.desc}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
