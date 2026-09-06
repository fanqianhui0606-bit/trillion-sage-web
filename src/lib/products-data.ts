/** 产品与套餐数据 — 同步自《桥梁计划_志愿咨询套餐》与《数理学科线上营一览表》 */

export interface SingleProduct {
  name: string;
  desc: string;
  price: string;
  priceNote?: string;
}

export interface ServicePackage {
  name: string;
  alias: string;
  price: string;
  features: string[];
  highlight?: "popular" | "recommended";
}

export interface CampMajor {
  field: string;
  highlight: string;
  lecturer: string;
}

export const SINGLE_PRODUCTS: SingleProduct[] = [
  {
    name: "一对一专业咨询",
    desc: "由 985 金牌硕博学长和学生、学生家长进行 1v1 专业咨询，获取大学专业与行业前沿信息，为孩子的未来买单。",
    price: "1499 - 1899",
    priceNote: "依指定背景不同有差异",
  },
  {
    name: "数理素质测验【专业版】",
    desc: "4 向 14 维全面检测学生的数理素质，推荐适合的数理工专业。",
    price: "499",
  },
  {
    name: "数理科学线上营",
    desc: "聚焦 8 种最具发展潜力的数理专业，学长用 3+1 科学模式线上讲解不同专业的信息差，拆解学科底层逻辑，分享行业与学科发展趋势。限额 40 人 / 期，附赠数理素质测验【专业版】、灵魂聊天共振及 1v1 学长专业咨询体验卡。",
    price: "2799",
    priceNote: "单价 · 限额 40 人 / 期 · 附赠全套增值服务",
  },
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    name: "水晶套餐",
    alias: "教育规划",
    price: "1999",
    features: [
      "数理素质测验【专业版】",
      "专业推荐",
      "1v1 专业学长咨询卡 1 次",
    ],
  },
  {
    name: "白银套餐",
    alias: "教育规划",
    price: "2499",
    highlight: "popular",
    features: [
      "数理素质检测【专业版】",
      "专业推荐",
      "1v1 专业学长咨询卡 1 次",
      "联盟北大心理辅导卡 1 次",
    ],
  },
  {
    name: "黄金套餐",
    alias: "教育规划",
    price: "4799",
    highlight: "recommended",
    features: [
      "数理素质检测【专业版】",
      "专业推荐",
      "1v1 专业学长咨询卡 3 次",
      "联盟北大心理辅导卡 1 次",
    ],
  },
  {
    name: "数理科学线上营",
    alias: "学科拓展",
    price: "2799",
    features: [
      "数理线上营（8 天 · 8 大专业 · 3+1 科学模式）",
      "【附赠】数理素质测验【专业版】（价值 499 元）",
      "【附赠】灵魂聊天共振（深度思维激荡）",
      "【附赠】30min 学长 1 对 1 专业咨询体验卡（价值 888 元）",
    ],
  },
];

/** 为什么选择我们 */
export const WHY_US: string[] = [
  "985 硕博专业背书，一流学府经历加持，品质认证。",
  "学长在各研究所与大厂的一线工作，给孩子一个机会 1v1 对接一手科技研发与市场咨询，掌握行业与科学前沿风向，避免让孩子掉队科学技术发展的浪潮。",
  "学长与高中生年龄差距小，沟通亲切、思维无代沟。",
];

/** 咨询可解答的典型问题 */
export const CONSULT_QUESTIONS: string[] = [
  "大学专业课内容学什么？难度如何、好毕业吗？",
  "国内这个专业推荐哪几所大学？",
  "需要考多少分能选择这个专业？竞赛条件如何？",
  "该专业就业方向有哪些？好不好就业？",
  "这个专业好不好考研 / 保研 / 考公 / 考编？",
  "这些行业未来发展如何，容易被 AI 冲击吗？",
  "该领域发展现状如何？",
  "国内大学现在学制有什么改革？",
  "留学经历、留学方向、科研经历与科研生活如何？",
];

/** 线上营 · 8 种最具发展潜力的数理专业 */
export const CAMP_MAJORS: CampMajor[] = [
  { field: "凝聚态物理", highlight: "半导体底层逻辑与超导材料的未来", lecturer: "名校材料 / 物理博士" },
  { field: "量子物理 / 量子计算", highlight: "第二次量子革命与计算能力的飞跃", lecturer: "研究所量子场论物理在读博士" },
  { field: "引力天文", highlight: "从黑洞探测到深空探索的科研范式", lecturer: "天文台 / 中科院在读博士" },
  { field: "电子信息", highlight: "芯片设计与信号处理的学术前沿", lecturer: "电子系资深博士 / 硕士" },
  { field: "材料科学", highlight: "能源电池与新一代功能材料的研发", lecturer: "顶尖实验室博士后" },
  { field: "应用数学", highlight: "从竞赛到科研：现代数学的魅力与发展", lecturer: "中科院数学系直博生" },
  { field: "计算机科学 / 人工智能", highlight: "人工智能的应用能力与发展趋势", lecturer: "AI 前沿实验室硕博生 / 大厂研究员" },
  { field: "生物应用", highlight: "生物技术与制药的现代发展", lecturer: "高校生物博士" },
];

/** 线上营 · 3+1 科学模式 */
export const CAMP_DIMENSIONS = [
  {
    title: "学科全景",
    desc: "打破「数理学科就是做题」的偏见，由硕博学长带你看清大学数学、物理等学科不同细分领域的学习内容与学科逻辑。",
  },
  {
    title: "发展潜力",
    desc: "了解该领域专业的最新前沿和发展瓶颈，快速概览学习该专业的成本和发展去路（企业工作 / 升学 / 留学）。",
  },
  {
    title: "研途经历",
    desc: "分享真实的大厂工作与实验室科研生活、国际会议与找工作经历，帮助学生建立「科学精神」、增长「科技认识」。",
  },
];

export const CAMP_PRINCIPLE = {
  title: "1 个学科原理",
  desc: "每个专业选出一个核心基础原理（如量子隧穿效应、GLM 底层逻辑等），由讲师学长学姐用大学逻辑进行讲解。快速判断该学生是否具备学习该学科的兴趣和能力，同时培养线上营学员的科学素养。",
};

/** 线上营 · 营期基本信息 */
export const CAMP_INFO: { label: string; value: string }[] = [
  { label: "营期名称", value: "「桥梁计划」数理学科线上营" },
  { label: "授课讲师", value: "千殊 985 硕博专业讲师团队" },
  { label: "适合人群", value: "所有理科高中生（推荐成绩中游及以上的孩子）" },
  { label: "营期形式", value: "线上互动直播（腾讯会议）+ 社群答疑 + 1 对 1 专业咨询" },
  { label: "时间安排", value: "2026 年秋季学期" },
  { label: "营期时长", value: "总计 8 天，春 / 秋学期于周末及节假日开展" },
  { label: "营期价格", value: "2799 元 / 每学员（限额 40 人）" },
  { label: "附赠权益", value: "数理素质测验【专业版】+ 灵魂聊天共振 + 30min 学长 1 对 1 咨询体验卡" },
  { label: "线上报名", value: "添加千殊小客服微信 TrillionSage" },
];

export const CAMP_BONUS: string[] = [
  "附赠 1：原价 888 元 · 30min 学长 1 对 1 专业咨询体验卡",
  "附赠 2：原价 499 元 · 数理素质测验【专业版】全面检测与专业推荐",
  "附赠 3：灵魂聊天共振深度思维启发",
];

export const CAMP_GAINS =
  "孩子高质量获得和多位科技人才沟通交流的机会，在【培养孩子高考目标】之余，帮助孩子【拓展科学素养】、【了解大学专业】、【精准锚定科技兴趣】。";
