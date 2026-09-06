import SectionTitle from "@/components/shared/SectionTitle";
import GlassCard from "@/components/shared/GlassCard";

const PROMISES = [
  {
    title: "信息真实",
    desc: "所有的咨询信息都来自一线的高校、研究所、大厂、科技公司的真实岗位经验，绝对真实。",
  },
  {
    title: "资历专业",
    desc: "所有讲师学长都来自全国各985高校或国外同等水平高校，资历专业可查验！",
  },
  {
    title: "流程透明",
    desc: "所有产品和服务都流程化、透明化、信息化，做到真正专业高效、公开透明、服务后可溯源！",
  },
];

export default function PromiseSection() {
  return (
    <section id="promise" className="min-h-screen flex items-center py-24 px-6 scroll-mt-16">
      <div className="max-w-5xl mx-auto w-full">
        <SectionTitle
          title="千殊承诺"
          subtitle="千殊承诺，做不到全额退款！"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROMISES.map((item) => (
            <GlassCard key={item.title} className="text-center">
              <h3 className="text-lg font-bold text-bridge-blue mb-3">{item.title}</h3>
              <p className="text-bridge-muted text-sm leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
