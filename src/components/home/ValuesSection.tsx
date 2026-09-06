import Image from "next/image";
import SectionTitle from "@/components/shared/SectionTitle";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";

const VALUES = [
  {
    title: "明灯指引",
    desc: "打破百年来高中到大学的无形信息壁垒，帮助莘莘学子看清脚下去路，点燃未来梦想的光。",
  },
  {
    title: "长效赋能",
    desc: "从高考志愿到考研考博、从学科分流到出国留学，千殊一路守护、长效赋能。",
  },
  {
    title: "社群陪伴",
    desc: "所有参加过千殊咨询套餐的学生都可以免费加入千殊专属社群，社群内与多名千殊硕博学长互动交流。",
  },
];

export default function ValuesSection() {
  return (
    <section id="values" className="min-h-screen flex items-center py-24 px-6 scroll-mt-16">
      <div className="max-w-5xl mx-auto w-full">
        <SectionTitle
          title="千殊理念"
          subtitle="帮助千万学子找到梦想专业，赋能千万家庭长效发展，成就国家高科技人才！"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <GlassCard key={v.title} className="text-center">
              <h3 className="text-lg font-bold text-bridge-blue mb-3">{v.title}</h3>
              <p className="text-bridge-muted text-sm leading-relaxed">{v.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* 团队介绍 · 校徽展示墙 */}
        <div className="mt-8 rounded-xl overflow-hidden border border-white/70 shadow-glass">
          <Image
            src="/images/team-badge-wall.png"
            alt="千殊团队讲师皆来自北京大学、清华大学、中科院、兰州大学、武汉大学、中山大学、同济大学、南京大学、中国农业大学等顶级学府"
            width={1024}
            height={568}
            className="w-full h-auto object-contain"
            priority={false}
          />
        </div>

        <div className="text-center mt-8">
          <Button href="/about/origin" variant="primary">
            我们的初心
          </Button>
        </div>
      </div>
    </section>
  );
}
