import SectionTitle from "@/components/shared/SectionTitle";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";
import { SERVICE_PACKAGES } from "@/lib/products-data";

const FEATURES = [
  {
    title: "专业资深",
    desc: "四十余名985硕博学长，从北京大学、清华大学、中科院到中大、南大，各个985及具国外留学经历的硕博生千殊都有。",
  },
  {
    title: "核导覆盖",
    desc: "覆盖涵盖数学、物理、生物、计算机等多个理工大类学科，从深空探测、电子科技到人工智能、自动化等专业具备核弹打击范围的专业覆盖。",
  },
  {
    title: "1v1定制",
    desc: "针对学生1对1定制化咨询方案，从兴趣导向到职业方向，每位导师深度咨询后推荐一份定制化发展路线。",
  },
];

export default function ConsultationSection() {
  return (
    <section
      id="consultation"
      className="min-h-screen flex items-center py-24 px-6 relative overflow-hidden scroll-mt-16"
    >
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-bridge-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto w-full">
        <SectionTitle
          title="1v1咨询引航"
          subtitle="我们不做低端教学，而是成为你的人生导师——985硕博学长1v1深度咨询，精准规划你的大学路径。"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {FEATURES.map((item) => (
            <GlassCard key={item.title} className="text-center">
              <h3 className="text-lg font-bold text-bridge-blue mb-3">{item.title}</h3>
              <p className="text-bridge-muted text-sm leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="border border-white/60 mb-10">
          <p className="text-xs text-bridge-muted text-center mb-4 tracking-wider">教育规划套餐</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {SERVICE_PACKAGES.filter((pkg) => pkg.alias === "教育规划").map((pkg) => (
              <div key={pkg.name}>
                <p className="text-sm font-bold text-stone-800">【{pkg.name}】</p>
                <p className="text-xl font-bold font-mono text-bridge-gold mt-1">￥{pkg.price}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-bridge-muted text-center mt-4">
            详细内容见
            <a href="/programs" className="text-bridge-blue hover:underline mx-1">
              咨询产品与套餐
            </a>
          </p>
        </GlassCard>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/team" variant="primary">
            查看导师名单
          </Button>
          <Button href="/tracker" variant="accent">
            进入咨询流程平台
          </Button>
        </div>
      </div>
    </section>
  );
}
