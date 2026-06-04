import type { Metadata } from "next";
import GlassCard from "@/components/shared/GlassCard";
import SectionTitle from "@/components/shared/SectionTitle";
import Button from "@/components/shared/Button";

export const metadata: Metadata = {
  title: "数理学科线上衔接营 — 千殊教育",
  description: "桥梁计划 · 数理学科线上衔接营，聚焦 8 个高发展潜力理工专业，3+1 教学模式",
};

const MAJORS = [
  {
    name: "数学与统计",
    topic: "机器学习与预测",
    teacher: "高校教授 / 研究员博士",
  },
  {
    name: "凝聚态物理",
    topic: "半导体、芯片、超导与量子材料的未来",
    teacher: "高校博士 / 在读博士",
  },
  {
    name: "量子信息 / 量子计算",
    topic: "从量子纠缠到量子计算的飞跃",
    teacher: "研究机构在读博士",
  },
  {
    name: "天文学",
    topic: "从黑洞探测到深空探索的科研方式",
    teacher: "国家天文台 / 中科院在读博士",
  },
  {
    name: "电子信息 / 芯片",
    topic: "集成电路与信号处理学术前沿",
    teacher: "相关院系在读博士 / 硕士",
  },
  {
    name: "材料科学与新能源",
    topic: "下一代智能材料的研发",
    teacher: "国家实验室博士",
  },
  {
    name: "应用数学",
    topic: "从经典密码到现代数学的发展",
    teacher: "中科院数学系直博",
  },
  {
    name: "计算机科学 / 人工智能",
    topic: "AI 的学科底层与应用前沿",
    teacher: "AI 前沿实验室硕士 / 博士 / 研究员",
  },
  {
    name: "生物技术",
    topic: "基因编辑与创新药的发展",
    teacher: "高校生物博士",
  },
];

const DIMENSIONS = [
  {
    title: "学科全景",
    desc: "破除「学科刻板印象」，带你看大学学科的真实面貌。了解学科不同细分方向的学习内容与学术逻辑。",
  },
  {
    title: "发展潜力",
    desc: "了解本专业科研前沿、发展瓶颈。帮你评估学习该专业的成本与回报：就业 / 深造 / 转行路径清晰可见。",
  },
  {
    title: "职业图景",
    desc: "接触真实大厂、实验室体验，了解国际化 / 交叉学科 / 跨学科机会，建立「学科→职业」的认知地图。",
  },
];

export default function ProgramsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionTitle
          title="数理学科线上衔接营"
          subtitle="—— 响应国家号召，培养未来高科技人才 ——"
        />

        {/* Intro */}
        <GlassCard className="mb-8 text-center">
          <p className="text-bridge-text leading-relaxed text-sm">
            由 <strong>千殊 985 本 / 硕 / 博名师团队</strong> 授课，
            聚焦 <strong>9 个高发展潜力理工专业</strong>，
            以 <strong>3+1 教学模型</strong> 帮助学员带入信息密度、转换学科思维、锚定未来方向。
          </p>
        </GlassCard>

        {/* Suitable audience */}
        <GlassCard className="mb-8">
          <h3 className="text-lg font-bold text-bridge-blue mb-3">适合人群</h3>
          <ul className="text-sm text-bridge-muted space-y-1.5">
            <li>· 对数学、物理等基础学科感兴趣的高中学生及家长</li>
            <li>· 对科技前沿、科技创新、工程应用感兴趣的高中学生及家长</li>
            <li>· 想了解大学专业信息、准备做职业规划的高中学生及家长</li>
          </ul>
        </GlassCard>

        {/* Major list */}
        <GlassCard className="mb-8">
          <h3 className="text-lg font-bold text-bridge-blue mb-4">专业方向与主题</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bridge-blue/20 text-left">
                  <th className="py-2 pr-3 text-bridge-blue font-semibold whitespace-nowrap">专业方向</th>
                  <th className="py-2 pr-3 text-bridge-blue font-semibold whitespace-nowrap">讲座主题</th>
                  <th className="py-2 text-bridge-blue font-semibold whitespace-nowrap">授课师资</th>
                </tr>
              </thead>
              <tbody>
                {MAJORS.map((m, i) => (
                  <tr
                    key={m.name}
                    className={`border-b border-gray-100/50 ${i % 2 === 0 ? "bg-white/10" : ""}`}
                  >
                    <td className="py-2.5 pr-3 text-bridge-text font-medium whitespace-nowrap">
                      {m.name}
                    </td>
                    <td className="py-2.5 pr-3 text-bridge-muted">{m.topic}</td>
                    <td className="py-2.5 text-bridge-muted text-xs whitespace-nowrap">
                      {m.teacher}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* 3 dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {DIMENSIONS.map((d) => (
            <GlassCard key={d.title} className="text-center">
              <h4 className="text-base font-bold text-bridge-blue mb-2">{d.title}</h4>
              <p className="text-bridge-muted text-xs leading-relaxed">{d.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* 3+1 model */}
        <GlassCard className="mb-8">
          <h3 className="text-lg font-bold text-bridge-blue mb-3">3+1 教学模式</h3>
          <p className="text-bridge-muted text-sm leading-relaxed mb-3">
            以上 3 个维度贯穿全部专业讲座。此外，每个专业选取一个
            <strong>核心基础原理</strong>（如光电效应、GLM 底层逻辑等），
            由教师深入浅出讲解，帮助学员判断自己是否具备学习该学科的兴趣与潜力。
          </p>
          <p className="text-bridge-muted text-sm leading-relaxed">
            通过 0 成本 / 低成本系列讲座，学员和家长可获得了解专业信息、锚定兴趣方向、规划学习与职业路径的机会。
          </p>
        </GlassCard>

        {/* Schedule & format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <GlassCard>
            <h3 className="text-lg font-bold text-bridge-blue mb-3">营期安排</h3>
            <ul className="text-sm text-bridge-muted space-y-1.5">
              <li>· 一期 <strong>8 天</strong>，每周末 / 节假日开展</li>
              <li>· 春 / 暑假集中开展</li>
              <li>· 2026 春季学期：<strong>5 月 1 日 ~ 5 月 31 日</strong></li>
              <li>· 每周末 / 节假日上午 10:00</li>
              <li>· 开营前一周发送日程表与师资介绍</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-bold text-bridge-blue mb-3">授课形式</h3>
            <ul className="text-sm text-bridge-muted space-y-1.5">
              <li>· 线上直播（腾讯会议）</li>
              <li>· 互动直播 + 社群答疑</li>
              <li>· 1 对 1 专业咨询（可选）</li>
              <li>· 报名后加入微信社群</li>
              <li>· 开营前一周发布详细日程</li>
            </ul>
          </GlassCard>
        </div>

        {/* Contact */}
        <GlassCard className="text-center mb-8">
          <h3 className="text-lg font-bold text-bridge-blue mb-2">报名方式</h3>
          <p className="text-bridge-muted text-sm mb-3">
            联系衔接营微信：<strong className="text-bridge-blue">13360455457</strong>
          </p>
          <p className="text-bridge-muted text-xs">
            官网：trillionsage.com · 公众号：桥梁计划 Bridge · B 站：TrillionSage 千殊
          </p>
        </GlassCard>

        <div className="text-center">
          <Button href="/contact" variant="primary">
            咨询报名
          </Button>
        </div>
      </div>
    </div>
  );
}
