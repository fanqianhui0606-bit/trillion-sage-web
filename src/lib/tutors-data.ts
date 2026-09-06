export interface TutorProfile {
  /** 姓氏（去人名化：仅保留姓，展示为「x 学长」） */
  surname: string;
  school: string;
  role: string;
  field: string;
  /** 校徽图片路径；缺失时回退为文字徽标 */
  badgeImage?: string;
  /** 无校徽时的文字徽标与配色 */
  badgeText: string;
  badgeColor: string;
}

const BADGE = {
  pku: "/images/badges/pku.png",
  thu: "/images/badges/thu.webp",
  cas: "/images/badges/cas.png",
  lzu: "/images/badges/lzu.png",
  sysu: "/images/badges/sysu.png",
  nju: "/images/badges/nju.png",
  whu: "/images/badges/whu.png",
  tongji: "/images/badges/tongji.png",
  cau: "/images/badges/cau.png",
  ustc: "/images/badges/ustc.png",
  nankai: "/images/badges/nankai.png",
  scu: "/images/badges/scu.png",
  dut: "/images/badges/dut.png",
  edinburgh: "/images/badges/edinburgh.png",
  macquarie: "/images/badges/macquarie.png",
  naoc: "/images/badges/naoc.png",
  caep: "/images/badges/caep.png",
} as const;

/** 团队讲师名单 — 同步自 public/data/团队流动名单.xlsx（去人名化，仅保留姓氏） */
export const TUTOR_PROFILES: TutorProfile[] = [
  { surname: "胡", school: "兰州大学 & 中科院数学所（联培）", role: "硕士毕业", field: "分析相对论 / 天文", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "林", school: "清华大学", role: "博士在读", field: "数学 / 代数几何", badgeImage: BADGE.thu, badgeText: "清华", badgeColor: "bg-purple-700" },
  { surname: "周", school: "清华大学", role: "博士在读", field: "化学 / 有机化学", badgeImage: BADGE.thu, badgeText: "清华", badgeColor: "bg-purple-700" },
  { surname: "范", school: "中科院数学所", role: "博士在读", field: "分析相对论 / 天文", badgeImage: BADGE.cas, badgeText: "中科院", badgeColor: "bg-blue-700" },
  { surname: "冀", school: "北京大学", role: "博士在读", field: "凝聚态物理", badgeImage: BADGE.pku, badgeText: "北大", badgeColor: "bg-red-600" },
  { surname: "杜", school: "南京大学", role: "博士在读", field: "柔性电子材料", badgeImage: BADGE.nju, badgeText: "南大", badgeColor: "bg-red-700" },
  { surname: "蒋", school: "兰州大学 & 中科院理论所（联培）", role: "博士在读", field: "理论物理 - 全息 ADS/CFT", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "董", school: "兰州大学 & 中科院理论所（联培）", role: "博士在读", field: "理论物理 - 广相 / 引力波", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "莫", school: "中山大学", role: "博士在读", field: "计算相对论", badgeImage: BADGE.sysu, badgeText: "中大", badgeColor: "bg-green-700" },
  { surname: "方", school: "武汉大学", role: "博士在读", field: "电子信息", badgeImage: BADGE.whu, badgeText: "武大", badgeColor: "bg-emerald-700" },
  { surname: "杨", school: "中国科学技术大学", role: "硕士在读", field: "天文探测", badgeImage: BADGE.ustc, badgeText: "中科大", badgeColor: "bg-blue-800" },
  { surname: "梁", school: "中科院数学所", role: "博士在读", field: "理论物理 - 引力 / 天文", badgeImage: BADGE.cas, badgeText: "中科院", badgeColor: "bg-blue-700" },
  { surname: "郝", school: "兰州大学 + 湖南师范大学", role: "博士在读", field: "计算相对论", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "张", school: "中科院数学所", role: "博士在读", field: "数学物理 - 计算相对论", badgeImage: BADGE.cas, badgeText: "中科院", badgeColor: "bg-blue-700" },
  { surname: "李", school: "兰州大学", role: "博士在读", field: "凝聚态 - 磁性材料", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "陈", school: "中国工程物理研究院", role: "博士在读", field: "量子场论 / 引力", badgeImage: BADGE.caep, badgeText: "中物院", badgeColor: "bg-gray-700" },
  { surname: "康", school: "兰州大学 & 航天 501 所", role: "硕士在读", field: "航天材料", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "闫", school: "中科院数学所", role: "博士后", field: "计算相对论", badgeImage: BADGE.cas, badgeText: "中科院", badgeColor: "bg-blue-700" },
  { surname: "胡", school: "中科院数学所", role: "博士在读", field: "数学物理 - 计算相对论", badgeImage: BADGE.cas, badgeText: "中科院", badgeColor: "bg-blue-700" },
  { surname: "刘", school: "中科院数学所", role: "博士在读", field: "密码学", badgeImage: BADGE.cas, badgeText: "中科院", badgeColor: "bg-blue-700" },
  { surname: "杨", school: "中科院高能所", role: "博士在读", field: "高能计算 / 天文探测", badgeImage: BADGE.cas, badgeText: "高能所", badgeColor: "bg-cyan-700" },
  { surname: "杨", school: "兰州大学", role: "博士在读", field: "发光材料", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "宋", school: "国家天文台", role: "博士在读", field: "理论物理 - 引力波 / 黑洞物理", badgeImage: BADGE.naoc, badgeText: "天文台", badgeColor: "bg-slate-700" },
  { surname: "笪", school: "麦考瑞大学 & 悉尼大学", role: "硕士毕业", field: "金融 / 会计 / 数据科学", badgeImage: BADGE.macquarie, badgeText: "麦考瑞", badgeColor: "bg-orange-700" },
  { surname: "杨", school: "爱丁堡大学", role: "硕士毕业", field: "金融科技 / 计算机", badgeImage: BADGE.edinburgh, badgeText: "爱丁堡", badgeColor: "bg-amber-700" },
  { surname: "任", school: "兰州大学", role: "硕士毕业", field: "物理学", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "段", school: "兰州大学", role: "硕士毕业", field: "大气科学 + 无人机", badgeImage: BADGE.lzu, badgeText: "兰大", badgeColor: "bg-blue-600" },
  { surname: "苏", school: "中国农业大学", role: "博士在读", field: "生物合成 + 分析", badgeImage: BADGE.cau, badgeText: "中农大", badgeColor: "bg-green-600" },
  { surname: "严", school: "同济大学", role: "硕士毕业", field: "土木 / 结构设计", badgeImage: BADGE.tongji, badgeText: "同济", badgeColor: "bg-teal-700" },
  { surname: "贺", school: "北京大学", role: "博士毕业", field: "临床心理学", badgeImage: BADGE.pku, badgeText: "北大", badgeColor: "bg-red-600" },
  { surname: "王", school: "大连理工大学", role: "博士在读", field: "材料科学与工程", badgeImage: BADGE.dut, badgeText: "大工", badgeColor: "bg-sky-700" },
  { surname: "武", school: "四川大学 + 兰州大学", role: "硕士在读", field: "生信分析与深度学习", badgeImage: BADGE.scu, badgeText: "川大", badgeColor: "bg-rose-700" },
  { surname: "陈", school: "南开大学", role: "博士在读", field: "人工智能 - 理论计算催化", badgeImage: BADGE.nankai, badgeText: "南开", badgeColor: "bg-purple-700" },
  { surname: "郎", school: "中科院煤化所", role: "博士在读", field: "多相催化 / 纳米材料合成", badgeImage: BADGE.cas, badgeText: "煤化所", badgeColor: "bg-stone-700" },
  { surname: "方", school: "中科院自动化所 + 国科大", role: "博士在读", field: "人工智能 / 计算机", badgeImage: BADGE.cas, badgeText: "自动化所", badgeColor: "bg-indigo-700" },
];

export function pickTutorBatch(all: TutorProfile[], offset: number, count = 14): TutorProfile[] {
  if (all.length <= count) return all;
  const result: TutorProfile[] = [];
  for (let i = 0; i < count; i++) {
    result.push(all[(offset + i) % all.length]);
  }
  return result;
}
