import type { Metadata } from "next";
import GlassCard from "@/components/shared/GlassCard";
import SectionTitle from "@/components/shared/SectionTitle";
import Button from "@/components/shared/Button";

export const metadata: Metadata = {
  title: "服务项目与规划咨询 — 千殊教育",
  description: "桥梁计划 · 一对一专业咨询规划服务及家长服务流程。由 985 数理硕博学长团队及北大心理辅导师为您保驾护航。",
};

const INDIVIDUAL_PRODUCTS = [
  {
    name: "一对一专业咨询",
    desc: "由 985 金牌数理工硕博学长与学生/家长进行 1v1 深度在线咨询（腾讯会议），获取大学专业学习内容、学科底层逻辑、竞赛条件及行业前沿风向，避免信息差导致决策失误。",
    tag: "依指定学长背景略有差异",
    price: "1499 - 1899",
    unit: "次"
  },
  {
    name: "数理素质测验【专业版】",
    desc: "14 维全面客观能力自检与思维习惯检测，生成三维素质模型网络图景。基于数理素质、学科兴趣与价值导向进行多维加权拟合，匹配推荐最契合的理工科专业方向。",
    tag: "包含详细素质报告与目录参考",
    price: "499",
    unit: "份"
  },
  {
    name: "数理科学线上衔接营",
    desc: "聚焦 8 种最具发展潜力的数理前沿专业（如半导体材料、人工智能、量子计算、生物技术等），采用 3+1 科学模式（学科全景、发展潜力、职业图景 + 核心基础原理）线上直播授课与社群答疑。",
    tag: "春季营 / 暑假营集中开展",
    price: "2499",
    unit: "期"
  }
];

const PACKAGES = [
  {
    name: "水晶套餐",
    price: "1999",
    features: [
      "数理素质测验【专业版】与 Top5 专业推荐",
      "985/双一流数理工科硕博学长 1v1 在线深度咨询 (1次)",
      "匹配对应方向学长在线答疑，破除专业认知信息差",
      "会后提供详细咨询会议记录与学长专属寄语"
    ]
  },
  {
    name: "白银套餐",
    price: "2499",
    popular: true,
    features: [
      "数理素质测验【专业版】与 Top5 专业推荐",
      "985/双一流数理工科硕博学长 1v1 在线深度咨询 (1次)",
      "匹配对应方向学长在线答疑，破除专业认知信息差",
      "千殊联盟北大资深导师 1v1 心理疏导与规划 (1次)",
      "舒缓高中学业压力与生涯规划焦虑，保驾护航"
    ]
  },
  {
    name: "黄金套餐",
    price: "4799",
    recommended: true,
    features: [
      "数理素质测验【专业版】与 Top5 专业推荐",
      "985/双一流数理工科硕博学长 1v1 在线深度咨询 (3次)",
      "多次长线跟踪指导，深入剖析专业学科底层逻辑",
      "千殊联盟北大资深导师 1v1 心理疏导与规划 (1次)",
      "专属社群跟踪答疑与学业成长长期关怀"
    ]
  }
];

const SERVICE_TIMELINES = [
  {
    stage: "A. 前期沟通阶段",
    duration: "约 1–3 个工作日 (名额锁定)",
    color: "border-green-500/30",
    textColor: "text-green-400",
    dotColor: "bg-green-500",
    steps: [
      {
        num: "A-1",
        title: "初次沟通 · 了解情况",
        desc: "与引导助理进行一对一沟通，登记基本信息，了解学生当前年级、学科强弱、兴趣方向与规划诉求，推荐合适的套餐选项。",
        by: "双方沟通"
      },
      {
        num: "A-2",
        title: "选择套餐 · 明确合约",
        desc: "明确本次咨询服务包含的具体内容（是否含测验、1v1咨询次数、心理辅导等）以及服务合约总额与交付标准。",
        by: "双方确认"
      },
      {
        num: "A-3",
        title: "登记基本档案",
        desc: "登记来访时间、学生姓名/昵称、学校年级、家长联系方式等必要建档信息，便于后续安排学长匹配与档案长期留存。",
        by: "学生/家长填写"
      },
      {
        num: "A-4",
        title: "确认参与意愿",
        desc: "确认学生自愿参与测验与规划咨询；未成年学生需家长一并进行知情确认，阅读并同意知情书后方可进入下一环节。",
        by: "勾选确认"
      },
      {
        num: "A-5",
        title: "支付款项或定金",
        desc: "除【数理素质测验专业版】需直接全额支付 ￥499 外，其余教育咨询套餐可先支付 10% 定金锁定咨询名额。定金一经确认即建立正式名额锁闭。",
        by: "家长支付 · 我方确认"
      }
    ]
  },
  {
    stage: "B. 过程跟进阶段",
    duration: "约 1–4 周 (服务交付)",
    color: "border-blue-500/30",
    textColor: "text-blue-400",
    dotColor: "bg-blue-500",
    steps: [
      {
        num: "B-1",
        title: "匹配 985 硕博学长与协调时间",
        desc: "我方根据学生具体的选科、学科兴趣及未来意向，在千殊学长团库中精心筛选背景匹配的 985/双一流硕博学长，协商确定腾讯会议时间。",
        by: "我方安排 · 双方协调"
      },
      {
        num: "B-2",
        title: "结清尾款",
        desc: "在线咨询服务开始前，家长结清剩余尾款（合约总额减去已付定金），我方确认到账后进入核心服务阶段。",
        by: "家长支付 · 我方确认"
      },
      {
        num: "B-3",
        title: "数理素质测验与专业推荐",
        desc: "学生登录网站输入姓名与分配的专业版兑换码，完成 42 题测评与 5 科兴趣自评，自动生成 14 维个人客观数理素质报告及匹配解读。",
        by: "学生完成 · 我方交付报告"
      },
      {
        num: "B-4",
        title: "1v1 学长在线咨询会",
        desc: "通过腾讯会议进行 1v1 深入咨询。会议前学生提交最关心的 3-5 个具体问题；会议中由硕博学长详细解答，会后输出会议记录与专属寄语。",
        by: "双方参与 · 学长主讲"
      },
      {
        num: "B-5",
        title: "北大心理辅导（若套餐含）",
        desc: "白银与黄金套餐用户特享：预约千殊联盟北大资深心理咨询师，进行 1 次线上心理舒缓与规划辅导，缓和家长与学生的未来焦虑。",
        by: "我方安排 · 心理师主导"
      }
    ]
  },
  {
    stage: "C. 服务完成阶段",
    duration: "服务结案",
    color: "border-amber-500/30",
    textColor: "text-amber-400",
    dotColor: "bg-amber-500",
    steps: [
      {
        num: "C-1",
        title: "服务交付检验",
        desc: "我方团队核对套餐内所有项目（报告、咨询记录、心理辅导）是否均已保质保量交付，并汇总总时长与最终反馈。",
        by: "我方检验"
      },
      {
        num: "C-2",
        title: "赠送配套产品",
        desc: "赠送本学期配套数理衔接参考资料、升学目录复盘说明包等附属附加产品，一并发送至家长邮箱或微信。",
        by: "我方安排"
      },
      {
        num: "C-3",
        title: "学生与家长结案确认",
        desc: "学生和家长勾选确认全部交付物完成无误；系统记录完结时间，归入千殊学生档案，结案记录，并可导出服务流程表备查。",
        by: "勾选确认完结"
      }
    ]
  }
];

export default function ProgramsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 text-bridge-text">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-12 text-bridge-text">
          <div className="relative flex items-center justify-center p-2 rounded-full bg-white/40 border border-white/[0.95] backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.85)] w-20 h-20 md:w-24 md:h-24 mb-6 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <SectionTitle
            title="服务项目与咨询规划"
            subtitle="—— 响应国家号召，以专业硕博力量培养未来高科技人才 ——"
          />
        </div>

        {/* Intro */}
        <GlassCard className="mb-12 text-center p-8 border border-white/45">
          <p className="text-base text-slate-700 leading-relaxed font-serif">
            千殊教育旗下「桥梁计划」由一群专业的 <strong>985 数理工科硕博学长团队</strong> 组成。<br />
            我们专注服务于未来的科学技术人才，为高中生及家长提供科学、客观、极具前沿视野的数理学科教育咨询、素养测评与学业规划服务。
          </p>
        </GlassCard>

        {/* Part 1: Individual consulting products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 font-serif mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-bridge-blue rounded" />
            一、 咨询与测验产品
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INDIVIDUAL_PRODUCTS.map((prod) => (
              <GlassCard key={prod.name} className="flex flex-col h-full justify-between p-6 border border-white/40 hover:border-white/60 transition-all duration-300">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 border border-white/40 text-bridge-muted block w-fit mb-3">
                    {prod.tag}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 font-serif mb-3">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-bridge-muted leading-relaxed text-justify mb-4">
                    {prod.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-900/5 flex items-baseline justify-between mt-auto">
                  <span className="text-xs text-bridge-muted">单项价格</span>
                  <span className="text-xl font-bold font-mono text-bridge-gold">
                    ￥{prod.price} <span className="text-xs font-normal text-bridge-muted">/ {prod.unit}</span>
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Part 2: Packages products */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-800 font-serif mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-bridge-blue rounded" />
            二、 咨询规划套餐
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-md
                  ${pkg.popular 
                    ? 'border-bridge-gold bg-amber-500/10 shadow-[0_0_20px_rgba(197,160,89,0.25)] scale-[1.02] text-slate-800' 
                    : pkg.recommended
                      ? 'border-bridge-blue bg-bridge-blue/10 shadow-[0_0_20px_rgba(46,117,182,0.25)] text-slate-800'
                      : 'border-white/40 bg-white/20 hover:border-white/60 text-slate-800 shadow-glass'
                  }
                `}
              >
                {/* Badge tags */}
                {pkg.popular && (
                  <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded bg-bridge-gold text-slate-950 text-[10px] font-extrabold tracking-wider uppercase rounded-full">
                    本期主推 · 强力推荐
                  </span>
                )}
                {pkg.recommended && (
                  <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded bg-bridge-blue text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full">
                    极力推荐 · 长线跟踪
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-800 font-serif mb-2 pt-2">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold font-mono text-slate-800">￥{pkg.price}</span>
                    <span className="text-xs text-bridge-muted">/ 套餐全款</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-xs text-bridge-muted">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-justify leading-relaxed">
                        <span className="text-bridge-blue mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <Button 
                    href="/contact" 
                    variant={pkg.popular ? "primary" : pkg.recommended ? "primary" : "secondary"}
                    className="w-full text-center py-2"
                  >
                    立即预约
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-center text-bridge-muted/60 mt-4 italic">
            * 友情提示：白银/黄金套餐与北大资深心理咨询导师合作，针对学生成长焦虑与生涯摇摆提供专业辅导，名额有限，敬请提前预约。
          </p>
        </div>

        {/* Part 3: Parents timeline service flow */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white font-serif mb-2 flex items-center gap-2">
            <span className="w-1 h-6 bg-bridge-blue rounded" />
            三、 家长服务全流程时间轴
          </h2>
          <p className="text-xs text-bridge-muted mb-8 pl-3">
            在您报名千殊「桥梁计划」后，我们将按照以下 3 个主要阶段进行全程推进，流程透明、节点清晰。
          </p>

          <div className="space-y-10 relative pl-4 md:pl-8 border-l border-white/10 ml-2">
            {SERVICE_TIMELINES.map((timeline) => (
              <div key={timeline.stage} className="relative">
                
                {/* Stage tag */}
                <div className="absolute -left-[29px] md:-left-[45px] top-1 flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full ${timeline.dotColor} ring-4 ring-[#0a0f18]`} />
                </div>

                <div className="mb-4">
                  <h3 className={`text-lg font-bold ${timeline.textColor} font-serif flex items-center gap-2`}>
                    {timeline.stage}
                  </h3>
                  <span className="text-xs text-bridge-muted block mt-0.5 font-mono">
                    服务周期：{timeline.duration}
                  </span>
                </div>

                {/* Steps cards */}
                <div className="grid grid-cols-1 gap-4">
                  {timeline.steps.map((step) => (
                    <GlassCard key={step.num} className="p-4 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 mb-2 gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-bridge-blue/20 text-bridge-blue">
                            {step.num}
                          </span>
                          <h4 className="text-sm font-bold text-white font-serif">
                            {step.title}
                          </h4>
                        </div>
                        <span className="text-[10px] text-bridge-gold font-semibold font-sans bg-white/5 px-2 py-0.5 rounded border border-white/5 w-fit">
                          执行节点：{step.by}
                        </span>
                      </div>
                      <p className="text-xs text-bridge-muted leading-relaxed text-justify">
                        {step.desc}
                      </p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Deposit advice */}
          <GlassCard className="mt-8 border border-amber-500/20 bg-amber-500/5 p-4">
            <h4 className="text-sm font-bold text-amber-400 font-serif mb-2">【定金规则说明】</h4>
            <p className="text-xs text-bridge-muted leading-relaxed text-justify">
              本套餐服务定金为法律规定的「定金」性质。服务额锁定后，若因个人原因单方面放弃本次咨询，定金不予退还；若因我方原因未能提供约定服务，我们将双倍返还定金。服务全过程由助理引导及留痕，家长可随时导出流程进度卡备查。
            </p>
          </GlassCard>
        </div>

        {/* Contact info card */}
        <GlassCard className="text-center mb-8 p-8 border border-white/10">
          <h3 className="text-lg font-bold text-bridge-blue mb-3 font-serif">服务咨询与预约渠道</h3>
          <p className="text-sm text-slate-300 mb-4 font-sans">
            咨询联系队长胡老师：<strong className="text-bridge-gold font-mono">13360455457</strong>（微信号同名）
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-bridge-muted font-sans border-t border-white/5 pt-4">
            <span>官方网站：trillionsage.com</span>
            <span>公众号：桥梁计划Bridge</span>
            <span>千殊窗口小红书：TrillionSage千殊窗口</span>
            <span>桥梁计划小红书：桥梁计划BridgePlan</span>
            <span>bilibili：TrillionSage千殊</span>
          </div>
        </GlassCard>

        <div className="text-center">
          <Button href="/contact" variant="primary">
            立即预约一对一规划
          </Button>
        </div>
      </div>
    </div>
  );
}
