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

/** 获取姓名首字母（逗号分隔） */
function getInitials(name: string): string {
  if (!name) return "XX";
  return name
    .split(/[,，/]/)
    .map((n) => n.trim()[0] || "")
    .join(",");
}

/** 格式化日期为 YYYY-MM-DD */
function formatDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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

/** 各协议的交互按钮组（渲染用） */
export const AGREEMENT_DOC_CHECK_GROUPS: Record<string, DocCheck[][]> = {
  privacy: [
    [{ id: "privacy_online", label: "我已阅读并同意《桥梁计划个人信息收集及隐私政策》全部内容" }],
  ],
  service: [
    [
      { id: "svc_a11_1", label: "（1）勾选「我已阅读并同意《桥梁计划教育咨询服务协议》」" },
      { id: "svc_a11_2", label: "（2）使用电子签名、短信验证码、人脸识别等身份认证后确认" },
      { id: "svc_a11_3", label: "（3）完成支付且订单关联本协议版本号" },
    ],
    [
      { id: "svc_a15_1", label: "附件一：《订单确认书》" },
      { id: "svc_a15_2", label: "附件二：《免责声明与知情确认书》" },
      { id: "svc_a15_3", label: "附件三：《个人信息处理告知与同意书》" },
      { id: "svc_a15_4", label: "附件四：《产品服务细则》（按所购产品适用）" },
      { id: "svc_a15_5", label: "附件五：《套餐与流程对照表》" },
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

/** 协议定义列表 */
export const AGREEMENTS: AgreementMeta[] = [
  {
    id: "privacy",
    title: "个人信息收集及隐私政策",
    shortTitle: "隐私政策",
    stepId: "a-privacy-policy",
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
    stepId: "b-quiz-knowledge",
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
    stepId: "b-counseling-knowledge",
    contractCodePrefix: "06",
    by: "visitor",
    requiredDocChecks: ["psych_online", "psych_guardian"],
    content: COUNSELING_CONTENT_TPL,
    docCheckGroups: AGREEMENT_DOC_CHECK_GROUPS.counseling,
  },
];

/** 步骤 → 协议 ID 列表（与参考库一致） */
export function agreementIdsForStep(stepId: string): string[] {
  switch (stepId) {
    case "a-visitor-info": return ["privacy"];
    case "a-service-agreement": return ["service"];
    case "b-quiz": return ["quiz"];
    case "b-counseling": return ["counseling"];
    default: return [];
  }
}

/** 根据步骤 ID 查找对应协议 */
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

  if (id === "service") {
    const a11 = def.requiredDocChecks.includes("svc_a11_any")
      ? ["svc_a11_1", "svc_a11_2", "svc_a11_3"].some((k) => docChecks[k])
      : true;
    const a15 = def.requiredDocChecks.includes("svc_a15_all")
      ? ["svc_a15_1", "svc_a15_2", "svc_a15_3", "svc_a15_4", "svc_a15_5"].every((k) => docChecks[k])
      : true;
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

/** 生成协议占位符数据 */
export function buildAgreementVars(
  agreementId: string,
  visitor: Partial<TrackerOrder["visitor"]> | undefined,
  packageId: string,
  orderNo: string,
  docChecks: Record<string, boolean>
) {
  const now = new Date();
  const def = getAgreementById(agreementId);
  const pkgName = PACKAGES[packageId as PackageId] || "定制套餐";
  const code = generateContractCode(
    def?.contractCodePrefix || "00",
    PACKAGE_LETTERS[packageId as PackageId] || "X",
    visitor?.name ? getInitials(visitor.name) : "XX",
    now
  );
  const isAdult = visitor?.isAdult === true || visitor?.age === "25以上" || visitor?.grade?.includes("本科生");

  const base: Record<string, string> = {
    CONTRACT_CODE: code,
    SIGN_DATE: formatDate(now),
    ORDER_NO: orderNo,
    VISITOR_NAME: visitor?.name || "—",
    VISITOR_AGE: visitor?.age || "—",
    VISITOR_GRADE: visitor?.grade || "—",
    VISITOR_SCHOOL: visitor?.school || "—",
    VISITOR_PHONE: visitor?.phone || "—",
    PARENT_NAME: isAdult ? "（来访已成年，不适用）" : (visitor?.parentName || "—"),
    PARENT_RELATION: isAdult ? "（不适用）" : (visitor?.relationship || "—"),
    PARENT_PHONE: isAdult ? "（不适用）" : (visitor?.parentPhone || "—"),
    PACKAGE_NAME: pkgName,
    TOTAL_PRICE: "—",
    DEPOSIT_AMOUNT: "—",
    ARTICLE_11_BTNS: renderDocBtnsHtml([AGREEMENT_DOC_CHECK_GROUPS.service[0]], docChecks, "service"),
    ARTICLE_15_BTNS: renderDocBtnsHtml([AGREEMENT_DOC_CHECK_GROUPS.service[1]], docChecks, "service"),
    PRIVACY_CONFIRM: renderDocBtnsHtml([AGREEMENT_DOC_CHECK_GROUPS.privacy[0]], docChecks, "privacy"),
    SERVICE_CONFIRM: renderDocBtnsHtml([AGREEMENT_DOC_CHECK_GROUPS.service[2]], docChecks, "service"),
    QUIZ_CONFIRM: renderDocBtnsHtml([AGREEMENT_DOC_CHECK_GROUPS.quiz[0]], docChecks, "quiz"),
    COUNSELING_CONFIRM: renderDocBtnsHtml([AGREEMENT_DOC_CHECK_GROUPS.counseling[0]], docChecks, "counseling"),
    PARENT_INFO: isAdult ? "" : `监护人：${visitor?.parentName || "—"}(${visitor?.relationship || "—"})，电话 ${visitor?.parentPhone || "—"}`,
  };

  return { vars: base, isAdult };
}

/** 渲染交互按钮 HTML（用于弹窗内嵌） */
function renderDocBtnsHtml(groups: DocCheck[][], docChecks: Record<string, boolean>, agreementId: string): string {
  if (!groups?.length) return "";
  return groups.map((row) =>
    `<div class="doc-btns-row">${row.map((b) => {
      const checked = !!docChecks[b.id];
      return `<button type="button" class="doc-btn ${checked ? "doc-btn--on" : ""}" data-check-id="${b.id}" data-agreement="${agreementId}">${checked ? "☑" : "□"} ${b.label}</button>`;
    }).join("")}</div>`
  ).join("");
}

/** 填充协议内容（传入原始模板 + 占位符变量对象） */
export function fillAgreementContent(template: string, vars: Record<string, string>): string {
  return personalizeContent(template, vars);
}