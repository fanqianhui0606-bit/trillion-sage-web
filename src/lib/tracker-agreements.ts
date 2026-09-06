/**
 * tracker-agreements.ts
 * 合同条款模板元数据 + 个性化占位符 + 交互按钮定义
 */

import type { PackageId, TrackerOrder } from "./tracker-types";

/** 协议类型枚举 */
export type AgreementType =
  | "privacy"          // 隐私政策
  | "service"          // 咨询服务协议
  | "quiz-knowledge"   // 测验须知
  | "counseling-knowledge"; // 心理辅导须知

/** 最小阅读秒数 */
export const MIN_READ_SECONDS = 5;

/** 单个交互按钮 */
export interface DocCheck {
  id: string;
  label: string;
}

/** 协议定义 */
export interface AgreementMeta {
  id: string;
  title: string;
  shortTitle: string;
  /** 对应步骤 ID */
  stepId: string;
  /** 合同编码前缀（【1】部分） */
  contractCodePrefix: string;
  /** 谁来同意：visitor / staff */
  by: "visitor" | "staff";
  content: string;
  /** 需要点击确认的按钮 ID 列表 */
  requiredDocChecks: string[];
  /** docChecks 组定义（用于界面渲染） */
  docCheckGroups?: DocCheck[][];
}

/** 生成合同编码 */
export function generateContractCode(
  /** 【1】前缀，2位数字 */
  prefix: string,
  /** 【2】套餐字母 */
  packageLetter: string,
  /** 【3】姓名首字母（逗号分隔，如"HX,hzz"） */
  initials: string,
  /** 【4】日期，Date 对象 */
  date: Date
): string {
  const yr = String(date.getFullYear()).slice(-2);
  const mon = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `QS${prefix}${packageLetter}${initials}${yr}${mon}${day}`;
}

/** 套餐 → 合同编码字母 */
export const PACKAGE_LETTERS: Record<PackageId, string> = {
  "1v1": "A",
  "quiz-pro": "B",
  crystal: "D1",
  silver: "D2",
  gold: "D3",
};

/** 套餐名称映射 */
export const PACKAGES: Record<PackageId, string> = {
  "1v1": "一对一专业咨询",
  "quiz-pro": "数理素质测验专业版",
  crystal: "水晶套餐",
  silver: "白银套餐",
  gold: "黄金套餐",
};

/**
 * 汉字 → 拼音首字母映射（用于合同编码，保证全英文）
 * 覆盖常见姓氏与常用名字用字；未收录字将被跳过，绝不写入中文。
 */
const PY_INITIALS: Record<string, string> = {
  阿: "A", 艾: "A", 安: "A", 敖: "A",
  白: "B", 包: "B", 鲍: "B", 毕: "B", 边: "B", 卞: "B", 卜: "B", 波: "B", 斌: "B", 博: "B",
  蔡: "C", 曹: "C", 岑: "C", 常: "C", 车: "C", 陈: "C", 成: "C", 程: "C", 池: "C", 褚: "C", 崔: "C", 超: "C", 晨: "C",
  戴: "D", 邓: "D", 丁: "D", 董: "D", 窦: "D", 杜: "D", 段: "D", 大: "D",
  范: "F", 方: "F", 房: "F", 费: "F", 冯: "F", 符: "F", 傅: "F", 富: "F", 芳: "F", 飞: "F", 凤: "F",
  甘: "G", 高: "G", 葛: "G", 耿: "G", 宫: "G", 龚: "G", 巩: "G", 顾: "G", 关: "G", 管: "G", 郭: "G", 国: "G", 刚: "G", 桂: "G",
  韩: "H", 杭: "H", 郝: "H", 何: "H", 贺: "H", 洪: "H", 侯: "H", 胡: "H", 华: "H", 黄: "H", 霍: "H", 慧: "H", 红: "H", 辉: "H", 浩: "H", 涵: "H",
  纪: "J", 贾: "J", 江: "J", 姜: "J", 蒋: "J", 焦: "J", 金: "J", 靳: "J", 景: "J", 静: "J", 军: "J", 杰: "J", 娟: "J", 菊: "J",
  康: "K", 柯: "K", 孔: "K", 寇: "K",
  赖: "L", 蓝: "L", 郎: "L", 劳: "L", 雷: "L", 黎: "L", 李: "L", 连: "L", 廉: "L", 梁: "L", 廖: "L", 林: "L", 凌: "L", 刘: "L", 柳: "L", 龙: "L", 卢: "L", 鲁: "L", 陆: "L", 路: "L", 吕: "L", 罗: "L", 骆: "L", 丽: "L", 磊: "L", 兰: "L", 琳: "L",
  马: "M", 毛: "M", 梅: "M", 孟: "M", 米: "M", 苗: "M", 闵: "M", 莫: "M", 穆: "M", 明: "M", 敏: "M",
  倪: "N", 聂: "N", 宁: "N", 牛: "N", 农: "N",
  欧: "O",
  潘: "P", 庞: "P", 裴: "P", 彭: "P", 皮: "P", 蒲: "P", 普: "P", 平: "P", 鹏: "P",
  齐: "Q", 钱: "Q", 强: "Q", 秦: "Q", 邱: "Q", 屈: "Q", 曲: "Q", 琴: "Q", 琪: "Q",
  饶: "R", 任: "R", 荣: "R", 阮: "R", 瑞: "R",
  沙: "S", 尚: "S", 邵: "S", 申: "S", 沈: "S", 盛: "S", 施: "S", 石: "S", 时: "S", 史: "S", 舒: "S", 宋: "S", 苏: "S", 孙: "S", 生: "S",
  谭: "T", 汤: "T", 唐: "T", 陶: "T", 田: "T", 童: "T", 涂: "T", 涛: "T", 婷: "T", 彤: "T", 同: "T",
  万: "W", 汪: "W", 王: "W", 韦: "W", 卫: "W", 魏: "W", 温: "W", 文: "W", 翁: "W", 巫: "W", 吴: "W", 武: "W", 伟: "W",
  席: "X", 夏: "X", 向: "X", 肖: "X", 萧: "X", 谢: "X", 辛: "X", 邢: "X", 熊: "X", 徐: "X", 许: "X", 薛: "X", 荀: "X", 晓: "X", 小: "X", 秀: "X", 霞: "X", 鑫: "X", 雪: "X", 轩: "X", 学: "X",
  严: "Y", 阎: "Y", 颜: "Y", 杨: "Y", 姚: "Y", 叶: "Y", 易: "Y", 殷: "Y", 尹: "Y", 应: "Y", 尤: "Y", 于: "Y", 余: "Y", 俞: "Y", 虞: "Y", 袁: "Y", 岳: "Y", 云: "Y", 洋: "Y", 勇: "Y", 艳: "Y", 英: "Y", 宇: "Y", 怡: "Y", 瑶: "Y", 阳: "Y",
  曾: "Z", 翟: "Z", 詹: "Z", 张: "Z", 章: "Z", 赵: "Z", 郑: "Z", 钟: "Z", 周: "Z", 朱: "Z", 诸: "Z", 祝: "Z", 庄: "Z", 卓: "Z", 宗: "Z", 邹: "Z", 左: "Z", 珍: "Z", 竹: "Z", 执: "Z", 掌: "Z",
};

function charInitial(ch: string): string {
  if (!ch) return "";
  if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
  if (/[0-9]/.test(ch)) return ch;
  return PY_INITIALS[ch] || ""; // 未收录汉字直接跳过，确保编码全英文
}

/** 单个姓名 → 拼音首字母串（全英文；未识别字符被剔除） */
function nameToInitials(name: string, casing: "upper" | "lower" = "upper"): string {
  const s = String(name || "").trim();
  if (!s) return "";
  let out = "";
  for (const ch of s) {
    const ini = charInitial(ch);
    if (!ini) continue;
    out += casing === "lower" ? ini.toLowerCase() : ini.toUpperCase();
  }
  // 兜底：清除任何残留的非 ASCII 字母数字
  return out.replace(/[^A-Za-z0-9]/g, "");
}

/**
 * 合同编码用姓名首字母：来访者大写；未成年时追加监护人小写。
 * 保证输出全英文（大小写字母）。
 */
function getContractInitials(
  visitor: Partial<TrackerOrder["visitor"]> | undefined,
  isAdult: boolean
): string {
  let out = nameToInitials(visitor?.name || "", "upper");
  if (!isAdult && visitor?.parentName) {
    out += nameToInitials(visitor.parentName, "lower");
  }
  return out || "XX";
}

/** 协议内容占位符替换 */
function personalizeContent(
  content: string,
  vars: Record<string, string>
): string {
  let out = content;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
  }
  return out;
}

/** 构建隐私政策（支持占位符） */
const PRIVACY_CONTENT_TPL = `# 桥梁计划个人信息收集及隐私政策

**版本：** V1.0
**合同编码：{{CONTRACT_CODE}}**
**生效日期：2026年1月1日**

## 一、引言

千殊（杭州）教育咨询有限公司（以下简称"我们"）运营"桥梁计划"品牌及官方网站，重视用户个人信息保护。
本政策说明我们如何收集、使用、存储、共享与保护您的个人信息。使用我们的网站或购买服务前，请仔细阅读本政策。

## 二、我们收集的信息

1. **您主动提供**：姓名（ {{VISITOR_NAME}} ）、联系电话（ {{VISITOR_PHONE}} ）、学生年级（ {{VISITOR_GRADE}} ）、咨询需求等。
2. **服务过程产生**：咨询记录摘要、测验作答数据等。
3. **自动采集**：设备信息、浏览器类型、访问日志、Cookie。
4. 我们不会主动收集与服务无关的敏感个人信息。

## 三、信息使用目的

1. 提供教育咨询、数理测验、教育规划及联盟心理辅导等服务；
2. 预约安排、身份核验、费用结算与售后服务；
3. 改进产品体验、保障系统安全、履行法定义务。

## 四、共享与保护

1. 我们不会向第三方出售您的个人信息。
2. 为完成服务，我们可能与心理咨询师、支付机构、云服务提供商共享必要信息，并要求其承担保密义务。
3. 我们采取访问控制、加密传输、权限管理等安全措施。

## 五、您的权利

您有权访问、更正、删除个人信息，撤回同意。行使权利请联系：13360455457。

## 六、未成年人保护

涉及未成年人信息时，应由监护人阅读本政策并代为同意。

## 七、联系我们

运营主体：千殊（杭州）教育咨询有限公司
联系电话：13360455457

{{PRIVACY_CONFIRM}}`;

/** 构建服务协议（支持占位符） */
const SERVICE_CONTENT_TPL = `# 桥梁计划教育咨询服务协议

**合同编码：{{CONTRACT_CODE}}**
**签订日期：{{SIGN_DATE}}**

请仔细阅读以下条款：

## 一、服务内容

「桥梁计划」教育咨询服务，由千殊（杭州）教育咨询有限公司（以下简称"服务方"）提供，
包括数理素质测评、专业方向咨询、学长经验分享及心理辅导支持等服务。

## 二、套餐选择与费用

| 套餐类型 | 费用说明 |
|---|---|
| 1v1 专业咨询 | 单次咨询，具体费用以约定为准 |
| 数理素质测验【专业版】 | 含 42 题测评、3D 素质图景与专业推荐 |
| 水晶套餐 | 数理测评 + 1 次咨询 + 联盟心理辅导 |
| 白银套餐 | 数理测评 + 2 次咨询 + 联盟心理辅导 |
| 黄金套餐 | 数理测评 + 3 次咨询 + 联盟心理辅导 |

**当前办理套餐：** {{PACKAGE_NAME}}
**套餐总价：** ¥{{TOTAL_PRICE}}
**定金：** ¥{{DEPOSIT_AMOUNT}}（10%，依据《民法典》定金规则）

## 三、服务主体信息

来访者：{{VISITOR_NAME}}（ {{VISITOR_AGE}} 岁， {{VISITOR_GRADE}}， {{VISITOR_SCHOOL}} ）
{{PARENT_INFO}}

{{ARTICLE_11_BTNS}}

## 四、定金条款

服务套餐的 10% 款项性质为法律规定的**定金**：
- 若因客户个人原因放弃本次咨询，定金不予退还；
- 若因服务方原因未能提供对应教育产品，服务方将**双倍返还**定金。

## 五、咨询服务说明

咨询方式为线上腾讯会议。每次咨询分为事前确认（确定时间、专业、问题准备）和事后确认（记录时长、是否加时、学长寄语）。
加时按每 0.5 课时 ¥500 计费，由双方协商确认。

## 六、服务终止

服务方可全程终止服务，若需终止应填写终止备注。若客户中途放弃，定金不予退还。

## 七、免责声明

本服务提供的专业推荐与规划建议仅供参考，不构成唯一志愿或选科决策。
真正做出选择的始终是客户本人，请结合自身意愿、学业基础与家庭条件综合判断。

{{ARTICLE_15_BTNS}}

{{SERVICE_CONFIRM}}`;

/** 构建测验须知 */
const QUIZ_CONTENT_TPL = `# 数理素质测验专业版 · 阅读须知

**合同编码：{{CONTRACT_CODE}}**

感谢您选择「桥梁计划」数理素质测验专业版。在开始测验前，请阅读以下注意事项：

## 一、测验说明

- 本测验共 **42 道题目**（专业版），含思维习惯题 15 道、能力自检题 21 道、价值导向题 6 道
- 预计完成时间约 15 分钟
- 题目无对错之分，请按真实想法作答

## 二、结果解读

- 测验完成后，系统将生成 14 维数理素质图谱、3D 素质关联网络与专业匹配推荐
- 报告中显示的匹配程度代表您与该专业大学学习画像的契合程度，仅供参考

## 三、数据使用

- 您在本测验中填写的数据将仅用于测评分析与服务改进，不会向第三方披露
- 测验结果可导出为 PDF 保存

## 四、激活码

本测验需使用激活码，激活码由「桥梁计划」团队提供，一人一码，不可共用。

## 五、如有疑问

请联系「桥梁计划」引导员或拨打 13360455457。

{{QUIZ_CONFIRM}}`;

/** 构建心理辅导须知 */
const COUNSELING_CONTENT_TPL = `# 联盟心理辅导知情同意与服务须知（在线版）

**合同编码：{{CONTRACT_CODE}}**

## 一、服务说明

「桥梁计划」联盟心理辅导由合作心理咨询师提供，采用线上腾讯会议形式进行。

## 二、保密原则

- 心理咨询师对来访者在咨询过程中分享的所有内容负有保密义务
- 以下情况除外：来访者存在自伤或伤害他人的风险；法律法规要求

## 三、知情同意

- 来访者（或监护人）需确认已阅读本须知并同意接受服务
- 咨询过程中，来访者可随时提出终止服务

## 四、服务记录

- 咨询时长默认 1 课时（50 分钟）：40 分钟学长与学生 1v1 + 10 分钟家长参与
- 咨询记录摘要将作为服务记录保存，不对外公开

## 五、咨询中止

- 来访者可主动申请中止服务
- 心理咨询师在特殊情况下也可中止服务，并说明原因

## 六、如有疑问

如有问题请联系「桥梁计划」引导员。

{{COUNSELING_CONFIRM}}`;

/** 协议内容（带占位符，待 personalize 后使用） */
export const AGREEMENT_CONTENT_TEMPLATES: Record<string, string> = {
  privacy: PRIVACY_CONTENT_TPL,
  service: SERVICE_CONTENT_TPL,
  quiz: QUIZ_CONTENT_TPL,
  counseling: COUNSELING_CONTENT_TPL,
};

/** 各协议的交互按钮组（渲染用；ID 对齐本地咨询流程表） */
export const AGREEMENT_DOC_CHECK_GROUPS: Record<string, DocCheck[][]> = {
  privacy: [
    [{ id: "privacy_online", label: "我已阅读并同意《桥梁计划信息收集及隐私政策》全部内容" }],
  ],
  service: [
    [
      { id: "a11_1", label: "（1）勾选「我已阅读并同意《桥梁计划教育咨询服务协议》」" },
      { id: "a11_2", label: "（2）使用电子签名、短信验证码、人脸识别等身份认证后确认" },
      { id: "a11_3", label: "（3）完成支付且订单关联本协议版本号" },
    ],
    [
      { id: "a15_1", label: "附件一：《订单确认书》" },
      { id: "a15_2", label: "附件二：《免责声明与知情确认书》" },
      { id: "a15_3", label: "附件三：《个人信息处理告知与同意书》" },
      { id: "a15_4", label: "附件四：《产品服务细则》（按所购产品适用）" },
      { id: "a15_5", label: "附件五：《套餐与流程对照表》" },
    ],
    [
      { id: "svc_online", label: "本人确认信息无误，完全理解并同意《桥梁计划教育咨询服务协议》及附件" },
    ],
  ],
  quiz: [
    [{ id: "quiz_online", label: "我已阅读并同意上述全部内容" }],
  ],
  counseling: [
    [{ id: "psych_online", label: "我已阅读并充分理解本须知全部内容，自愿接受本服务" }],
    [{ id: "psych_guardian", label: "（未成年人适用）我是来访者监护人，已阅读并代为/共同同意" }],
    [
      { id: "psych_rec_yes", label: "同意录音" },
      { id: "psych_rec_no", label: "不同意录音/录像（不影响接受服务）" },
    ],
  ],
};

/** 协议正文文件（public/data/agreements，完整版与参考库一致） */
export const AGREEMENT_FILE_MAP: Record<string, string> = {
  privacy: "/data/agreements/privacy.md",
  service: "/data/agreements/service.md",
  quiz: "/data/agreements/quiz.md",
  counseling: "/data/agreements/counseling.md",
};

/** 协议定义列表 */
export const AGREEMENTS: AgreementMeta[] = [
  {
    id: "privacy",
    title: "个人信息收集及隐私政策",
    shortTitle: "隐私政策",
    /** 绑定在「来访信息」环节内，非独立步骤 */
    stepId: "a-visitor-info",
    contractCodePrefix: "05",
    by: "visitor",
    requiredDocChecks: ["privacy_online"],
    content: PRIVACY_CONTENT_TPL,
    docCheckGroups: AGREEMENT_DOC_CHECK_GROUPS.privacy,
  },
  {
    id: "service",
    title: "教育咨询服务协议",
    shortTitle: "服务协议",
    /** 绑定在「意愿确认」环节内 */
    stepId: "a-service-agreement",
    contractCodePrefix: "02",
    by: "visitor",
    requiredDocChecks: ["svc_a11_any", "svc_a15_all", "svc_online"],
    content: SERVICE_CONTENT_TPL,
    docCheckGroups: AGREEMENT_DOC_CHECK_GROUPS.service,
  },
  {
    id: "quiz",
    title: "数理素质测验专业版 · 阅读须知",
    shortTitle: "测验须知",
    /** 绑定在测验环节内 */
    stepId: "b-quiz",
    contractCodePrefix: "04",
    by: "visitor",
    requiredDocChecks: ["quiz_online"],
    content: QUIZ_CONTENT_TPL,
    docCheckGroups: AGREEMENT_DOC_CHECK_GROUPS.quiz,
  },
  {
    id: "counseling",
    title: "联盟心理辅导知情同意与服务须知（在线版）",
    shortTitle: "心理辅导须知",
    /** 绑定在心理辅导环节内 */
    stepId: "b-counseling",
    contractCodePrefix: "06",
    by: "visitor",
    requiredDocChecks: ["psych_online", "psych_guardian"],
    content: COUNSELING_CONTENT_TPL,
    docCheckGroups: AGREEMENT_DOC_CHECK_GROUPS.counseling,
  },
];

/** 步骤 → 协议 ID 列表（内嵌于环节，侧栏以 chip 展示） */
export function agreementIdsForStep(stepId: string): string[] {
  switch (stepId) {
    case "a-visitor-info": return ["privacy"];
    case "a-service-agreement": return ["service"];
    case "b-quiz": return ["quiz"];
    case "b-counseling": return ["counseling"];
    default: return [];
  }
}

/** 协议是否已同意（兼容旧字段 checked/confirmedAt） */
export function isAgreementAgreed(
  rec?: { agreed?: boolean; agreedAt?: string; checked?: boolean; confirmedAt?: string } | null
): boolean {
  if (!rec) return false;
  return !!(rec.agreed || rec.checked) && !!(rec.agreedAt || rec.confirmedAt);
}

/**
 * 从订单读取协议同意状态（含旧版独立协议步骤迁移）
 * 旧步骤：a-privacy-policy / b-quiz-knowledge / b-counseling-knowledge
 */
export function getOrderAgreementRecord(
  order: {
    agreements?: Record<string, { agreed?: boolean; agreedAt?: string; checked?: boolean; confirmedAt?: string; docChecks?: Record<string, boolean> }>;
    steps?: Record<string, { status?: string; data?: Record<string, unknown> }>;
  },
  agreementId: string
): { agreed?: boolean; agreedAt?: string; checked?: boolean; confirmedAt?: string; docChecks?: Record<string, boolean> } | undefined {
  const direct = order.agreements?.[agreementId];
  if (isAgreementAgreed(direct)) return direct;

  const legacyStepMap: Record<string, string> = {
    privacy: "a-privacy-policy",
    quiz: "b-quiz-knowledge",
    counseling: "b-counseling-knowledge",
  };
  const legacyId = legacyStepMap[agreementId];
  if (legacyId && order.steps?.[legacyId]?.status === "completed") {
    const data = (order.steps[legacyId].data || {}) as {
      agreed?: boolean;
      agreedAt?: string;
      checked?: boolean;
      confirmedAt?: string;
      docChecks?: Record<string, boolean>;
    };
    const when = data.agreedAt || data.confirmedAt;
    return {
      agreed: true,
      agreedAt: when,
      checked: true,
      confirmedAt: when,
      docChecks: data.docChecks,
    };
  }

  // 旧版把服务协议同意写在意愿确认步骤 data 里
  if (agreementId === "service") {
    const svcStep = order.steps?.["a-service-agreement"];
    const data = svcStep?.data as
      | { agreed?: boolean; agreedAt?: string; checked?: boolean; confirmedAt?: string; docChecks?: Record<string, boolean> }
      | undefined;
    if (data && isAgreementAgreed(data)) return data;
  }

  return direct;
}

/** 根据步骤 ID 查找对应协议（一环节一协议时） */
export function getAgreementByStepId(stepId: string): AgreementMeta | undefined {
  return AGREEMENTS.find((a) => a.stepId === stepId);
}

/** 根据协议 ID 获取定义 */
export function getAgreementById(id: string): AgreementMeta | undefined {
  return AGREEMENTS.find((a) => a.id === id);
}

/** 检查是否满足协议的全部 docChecks 要求 */
export function docChecksSatisfied(
  id: string,
  docChecks: Record<string, boolean>,
  isAdult: boolean
): boolean {
  const def = getAgreementById(id);
  if (!def) return true;

  // 兼容新旧按钮 ID
  const a11Keys = ["a11_1", "a11_2", "a11_3", "svc_a11_1", "svc_a11_2", "svc_a11_3"];

  if (id === "service") {
    const a11 = a11Keys.some((k) => docChecks[k]) || !!docChecks.svc_a11_any;
    const a15 =
      ["a15_1", "a15_2", "a15_3", "a15_4", "a15_5"].every((k) => docChecks[k]) ||
      ["svc_a15_1", "svc_a15_2", "svc_a15_3", "svc_a15_4", "svc_a15_5"].every((k) => docChecks[k]) ||
      !!docChecks.svc_a15_all;
    return a11 && a15 && !!docChecks.svc_online;
  }

  if (id === "counseling") {
    const online = !!docChecks.psych_online;
    const guardian = isAdult || !!docChecks.psych_guardian;
    const rec = !!docChecks.psych_rec_yes || !!docChecks.psych_rec_no;
    return online && guardian && rec;
  }

  return def.requiredDocChecks.every((k) => {
    if (k === "svc_a11_any" || k === "svc_a15_all") return true;
    if (k === "psych_guardian" && isAdult) return true;
    if (k === "psych_rec") return !!docChecks.psych_rec_yes || !!docChecks.psych_rec_no;
    return !!docChecks[k];
  });
}

function dash(v?: string | null): string {
  const s = String(v ?? "").trim();
  return s || "—";
}

function escText(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function btnHtml(id: string, agreementId: string, label: string, checked: boolean): string {
  return `<button type="button" class="doc-btn agreement-doc-btn ${checked ? "doc-btn--on on" : ""}" data-check-id="${id}" data-doc-check="${id}" data-agreement="${agreementId}">${checked ? "☑" : "□"} ${escText(label)}</button>`;
}

function buildOrderTableMd(
  packageId: string,
  total: number,
  deposit: number
): string {
  const pkgName = PACKAGES[packageId as PackageId] || "定制套餐";
  const remaining = Math.max(0, total - deposit);
  return `| 勾选 | 产品名称 | 规格/说明 | 标准价（元） | 实付（元） |
| --- | --- | --- | --- | --- |
| ☑ | ${pkgName} | 以实际选购为准 | ${total || "—"} | ${total || "—"} |

**收费方式：** 定金-尾款二段式
- 定金（10%）：¥${deposit}
- 尾款（服务启动前结清）：¥${remaining}
- 合约总额：¥${total}`;
}

function buildOnlineConfirmHtml(
  kind: "privacy" | "service" | "quiz" | "psych",
  agreementId: string,
  visitor: Partial<TrackerOrder["visitor"]> | undefined,
  contractCode: string,
  docChecks: Record<string, boolean>,
  isAdultVisitor: boolean,
  agreedAt?: string
): string {
  const info = `<p class="agreement-auto-info">来访者：<strong>${escText(dash(visitor?.name))}</strong>　手机：${escText(dash(visitor?.phone))}</p>${
    isAdultVisitor
      ? ""
      : `<p class="agreement-auto-info">监护人：${escText(dash(visitor?.parentName))}　手机：${escText(dash(visitor?.parentPhone))}</p>`
  }<p class="agreement-auto-info">合同编码：<strong>${escText(contractCode)}</strong>${agreedAt ? `　同意时间：${escText(agreedAt)}` : ""}</p>`;

  if (kind === "privacy") {
    return `${info}<div class="agreement-doc-btns">${btnHtml("privacy_online", agreementId, "我已阅读并同意《桥梁计划信息收集及隐私政策》全部内容", !!docChecks.privacy_online)}</div>`;
  }
  if (kind === "service") {
    return `${info}<div class="agreement-doc-btns">${btnHtml("svc_online", agreementId, "本人确认信息无误，完全理解并同意《桥梁计划教育咨询服务协议》及附件", !!docChecks.svc_online)}</div>`;
  }
  if (kind === "quiz") {
    return `${info}<div class="agreement-doc-btns">${btnHtml("quiz_online", agreementId, "我已阅读并同意上述全部内容", !!docChecks.quiz_online)}</div>`;
  }
  const rows = [
    btnHtml("psych_online", agreementId, "我已阅读并充分理解本须知全部内容，自愿接受本服务", !!docChecks.psych_online),
    isAdultVisitor
      ? ""
      : btnHtml("psych_guardian", agreementId, "（未成年人适用）我是来访者监护人，已阅读并代为/共同同意", !!docChecks.psych_guardian),
    btnHtml("psych_rec_yes", agreementId, "同意录音", !!docChecks.psych_rec_yes),
    btnHtml("psych_rec_no", agreementId, "不同意录音/录像（不影响接受服务）", !!docChecks.psych_rec_no),
  ].filter(Boolean);
  return `${info}<div class="agreement-doc-btns">${rows.join("")}</div>`;
}

/** 生成协议占位符数据（对齐本地完整合同模板） */
export function buildAgreementVars(
  agreementId: string,
  visitor: Partial<TrackerOrder["visitor"]> | undefined,
  packageId: string,
  orderNo: string,
  docChecks: Record<string, boolean>,
  extras?: { totalPrice?: number; depositAmount?: number; agreedAt?: string }
) {
  const now = new Date();
  const def = getAgreementById(agreementId);
  const pkgName = PACKAGES[packageId as PackageId] || "定制套餐";
  const isAdultVisitor =
    visitor?.isAdult === true || visitor?.age === "25以上" || !!visitor?.grade?.includes("本科生");
  const code = generateContractCode(
    def?.contractCodePrefix || "00",
    PACKAGE_LETTERS[packageId as PackageId] || "X",
    getContractInitials(visitor, isAdultVisitor),
    now
  );
  const total = extras?.totalPrice ?? 0;
  const deposit = extras?.depositAmount ?? Math.round(total * 0.1);
  const signDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  const a11 = (AGREEMENT_DOC_CHECK_GROUPS.service[0] || []).map((b) =>
    btnHtml(b.id, agreementId, b.label, !!docChecks[b.id])
  );
  const a15 = (AGREEMENT_DOC_CHECK_GROUPS.service[1] || []).map((b) =>
    btnHtml(b.id, agreementId, b.label, !!docChecks[b.id])
  );

  const base: Record<string, string> = {
    CONTRACT_CODE: code,
    SIGN_DATE: signDate,
    ORDER_NO: dash(orderNo),
    VISITOR_NAME: dash(visitor?.name),
    VISITOR_AGE: dash(visitor?.age),
    VISITOR_GRADE: dash(visitor?.grade),
    VISITOR_SCHOOL: dash(visitor?.school),
    VISITOR_PHONE: dash(visitor?.phone),
    VISITOR_WECHAT_QQ: dash(visitor?.wechat),
    VISITOR_EMAIL: dash(visitor?.email),
    PARENT_NAME: isAdultVisitor ? "（来访已成年，不适用）" : dash(visitor?.parentName),
    PARENT_RELATION: isAdultVisitor ? "（不适用）" : dash(visitor?.relationship),
    PARENT_PHONE: isAdultVisitor ? "（不适用）" : dash(visitor?.parentPhone),
    PARENT_WECHAT_QQ: isAdultVisitor ? "（不适用）" : dash(visitor?.parentWechat),
    PARENT_EMAIL: isAdultVisitor ? "（不适用）" : dash(visitor?.parentEmail),
    PACKAGE_NAME: pkgName,
    TOTAL_PRICE: total ? String(total) : "—",
    DEPOSIT_AMOUNT: deposit ? String(deposit) : "—",
    ORDER_TABLE: buildOrderTableMd(packageId, total, deposit),
    ARTICLE_11_BTNS: `<div class="agreement-doc-btns">${a11.join("")}</div><p class="agreement-doc-hint">请至少点击确认一种线上签署方式（前 3 项任选其一）。</p>`,
    ARTICLE_15_BTNS: `<div class="agreement-doc-btns">${a15.join("")}</div><p class="agreement-doc-hint">请逐项点击确认已阅读各附件。</p>`,
    ONLINE_CONFIRM_PRIVACY: buildOnlineConfirmHtml("privacy", agreementId, visitor, code, docChecks, isAdultVisitor, extras?.agreedAt),
    ONLINE_CONFIRM_SERVICE: buildOnlineConfirmHtml("service", agreementId, visitor, code, docChecks, isAdultVisitor, extras?.agreedAt),
    ONLINE_CONFIRM_QUIZ: buildOnlineConfirmHtml("quiz", agreementId, visitor, code, docChecks, isAdultVisitor, extras?.agreedAt),
    ONLINE_CONFIRM_PSYCH: buildOnlineConfirmHtml("psych", agreementId, visitor, code, docChecks, isAdultVisitor, extras?.agreedAt),
    // 兼容旧缩写模板
    ARTICLE_11_BTNS_LEGACY: "",
    PRIVACY_CONFIRM: buildOnlineConfirmHtml("privacy", agreementId, visitor, code, docChecks, isAdultVisitor, extras?.agreedAt),
    SERVICE_CONFIRM: buildOnlineConfirmHtml("service", agreementId, visitor, code, docChecks, isAdultVisitor, extras?.agreedAt),
    QUIZ_CONFIRM: buildOnlineConfirmHtml("quiz", agreementId, visitor, code, docChecks, isAdultVisitor, extras?.agreedAt),
    COUNSELING_CONFIRM: buildOnlineConfirmHtml("psych", agreementId, visitor, code, docChecks, isAdultVisitor, extras?.agreedAt),
    PARENT_INFO: isAdultVisitor
      ? ""
      : `监护人：${dash(visitor?.parentName)}(${dash(visitor?.relationship)})，电话 ${dash(visitor?.parentPhone)}`,
  };

  return { vars: base, isAdult: isAdultVisitor };
}

/** 填充协议内容（传入原始模板 + 占位符变量对象） */
export function fillAgreementContent(template: string, vars: Record<string, string>): string {
  return personalizeContent(template, vars);
}

const mdCache = new Map<string, string>();

/** 拉取完整协议 Markdown 并渲染为 HTML */
export async function loadAgreementHtml(
  agreementId: string,
  visitor: Partial<TrackerOrder["visitor"]> | undefined,
  packageId: string,
  orderNo: string,
  docChecks: Record<string, boolean>,
  extras?: { totalPrice?: number; depositAmount?: number; agreedAt?: string }
): Promise<string> {
  const file = AGREEMENT_FILE_MAP[agreementId];
  let raw = "";
  if (file) {
    if (mdCache.has(file)) {
      raw = mdCache.get(file)!;
    } else {
      const resp = await fetch(file);
      if (!resp.ok) throw new Error(`协议文件读取失败（${resp.status}）`);
      raw = await resp.text();
      mdCache.set(file, raw);
    }
  } else {
    raw = AGREEMENT_CONTENT_TEMPLATES[agreementId] || getAgreementById(agreementId)?.content || "";
  }

  const { vars } = buildAgreementVars(agreementId, visitor, packageId, orderNo, docChecks, extras);
  const { personalizeMarkdown, renderMarkdown } = await import("./tracker-markdown");
  const md = personalizeMarkdown(raw, vars);
  return renderMarkdown(md);
}