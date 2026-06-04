import type { Metadata } from "next";
import SectionTitle from "@/components/shared/SectionTitle";

export const metadata: Metadata = {
  title: "硕博团队 — 千殊教育",
  description: "一线科研导师阵容，所有导师均来自 985 高校或中科院系统",
};

const TEAM_VISIBLE = [
  { school: "北京大学", status: "博士在读", field: "凝聚态物理研究" },
  { school: "中科院数学所", status: "博士在读", field: "分析相对论 / 天体物理" },
  { school: "南京大学", status: "博士在读", field: "柔性电子与新型材料" },
  { school: "中国科学技术大学", status: "硕士在读", field: "深空探测与天文仪器" },
];

const TEAM_MORE = [
  { school: "兰州大学 & 中科院数学所", status: "硕士毕业", field: "分析相对论/天文" },
  { school: "兰州大学 & 中科院理论所", status: "博士在读", field: "理论-全息ADS/CFT" },
  { school: "兰州大学 & 中科院理论所", status: "博士在读", field: "理论-广相/引力波" },
  { school: "中山大学", status: "博士在读", field: "计算相对论" },
  { school: "武汉大学", status: "博士在读", field: "电子信息" },
  { school: "湖南师范大学", status: "博士在读", field: "计算相对论" },
  { school: "兰州大学 & 航天501所", status: "硕士在读", field: "航天材料" },
  { school: "国家天文台", status: "博士在读", field: "理论-引力波/黑洞物理" },
  { school: "中科院高能所", status: "博士在读", field: "高能计算/天文探测" },
];

function TeamRow({ school, status, field }: { school: string; status: string; field: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 p-4 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
      <span className="font-bold text-bridge-text min-w-[200px]">{school}</span>
      <span className="inline-block w-fit text-xs px-2 py-0.5 rounded-full bg-bridge-blue/10 text-bridge-blue font-medium">
        {status}
      </span>
      <span className="text-sm text-bridge-muted flex-1">{field}</span>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionTitle
          title="一线科研导师阵容"
          subtitle="所有导师均来自 985 高校或中科院系统，身处科研最前沿"
        />

        <div className="space-y-2 mb-8">
          {TEAM_VISIBLE.map((t, i) => (
            <TeamRow key={i} {...t} />
          ))}
          {TEAM_MORE.map((t, i) => (
            <TeamRow key={`more-${i}`} {...t} />
          ))}
        </div>

        <p className="text-center text-xs text-bridge-muted">
          以上为部分导师名单，团队持续扩充中。欢迎优秀硕博研究者加入。
        </p>
      </div>
    </div>
  );
}
