import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LINKS_FILE = path.join(process.cwd(), "family_links.json");

interface LinkRecord {
  code: string;
  student_wechat_name?: string;
  parent_wechat_name?: string;
  student_report?: unknown;
  parent_report?: unknown;
  student_authorized?: boolean; // true, false (deny)
  parent_authorized?: boolean;  // true, false (deny)
  student_completed?: boolean;
  parent_completed?: boolean;
  paid?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ADMIN_STUDENT_REPORT = {
  mirror_echo: "你擅长在看似无序的现实中，剥离出底层的秩序。无论是梳理复杂的多变量动态曲线，还是在层叠的数据网络中寻找不变的规律，你的第一直觉都是寻找事物最核心的平衡。这种对守恒与内在对称性的逻辑敏感性，让你在应对交织的学业困境时，总能找到最清晰的切入点。",
  math_aesthetic: "数理直觉极佳，具有强烈的‘提炼本质’与‘化繁为简’倾向。你讨厌没有合理解释的生搬硬套，更偏爱通过推导触及规律底层的逻辑。你眼中的真理是简洁且和谐的，这种思维方式使你在面对高难度跨学科探索时，能够建立起极具穿透力的物理类比。",
  reality_guide: "虽然你的思想世界常常在完美、对称的逻辑模型中遨游，但现实往往是由无数细碎噪声拼凑成的混沌日常。试着去包容现实中的那些不完美与琐碎。不要把每一次低效的沟通都视为无用功，很多时候，人生的精彩恰恰隐藏在那些看似无规则的涨落与碰撞中。尝试在流动的变化里，寻找最适合你成长的生活节奏。"
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ADMIN_PARENT_REPORT = {
  decision_role: "在家庭这艘共同前行的航船中，您长期扮演着‘舵手’与‘定海神针’的角色。您为家庭成员提供了稳定的保护和方向，但为了维持这种平稳，您也独自承担了许多重任，默默消化了那些不易被察觉的心智疲惫。",
  soft_moment: "那些孩子在做科学小实验时流露出的专注眼神，或是她在书桌前认真演算某道数学题的安静背影，如同琴弦微颤产生的共鸣，是您心中最柔和、也最真实的欣慰瞬间。",
  parenting_style: "当孩子在遇到摩擦、选择隐入自己的世界时，您虽然在宏观上希望用关切介入她的运行轨迹，但微观上又在克制，试图给她留出呼吸与成长的自由空间。您在静默守护与适当放手之间，常常经历着微妙的权衡。",
  warm_suggestion: "两个性格不同、想法相异的独立个体，在深度沟通时难免产生小小的碰撞与分歧。这并非关系的隔阂，而是走向同频共振前的必经过程。给彼此一点慢慢调整的缓冲时间，千殊团队会一直在背后为您提供温暖的支持与引导。"
};

// Helper to read all links
async function readLinks(): Promise<Record<string, LinkRecord>> {
  try {
    if (!fs.existsSync(LINKS_FILE)) {
      return {};
    }
    const content = await fs.promises.readFile(LINKS_FILE, "utf8");
    if (!content.trim()) return {};
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading family links:", err);
    return {};
  }
}

// Helper to write links
async function writeLinks(data: Record<string, LinkRecord>) {
  await fs.promises.writeFile(LINKS_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.toUpperCase().trim();

    if (!code) {
      return NextResponse.json({ success: false, error: "缺少关联码" }, { status: 400 });
    }

    // 1. 特权管理员后门动态注册与持久化
    const isAdminCode = code && (code.startsWith("BRIDGE_ADMIN") || code.startsWith("TSG_ADMIN_PAGE"));
    if (isAdminCode) {
      const numSuffix = code.slice("TSG_ADMIN_PAGE".length);
      const links = await readLinks();
      if (!links[code]) {
        links[code] = {
          code,
          student_wechat_name: `Admin(学生${numSuffix})`,
          parent_wechat_name: `Admin(家长${numSuffix})`,
          student_completed: false,
          student_authorized: false,
          parent_completed: false,
          parent_authorized: false,
          paid: true
        };
        await writeLinks(links);
      }
    }

    const links = await readLinks();
    const record = links[code];

    // 2. 拦截未注册的普通 code
    if (!record) {
      return NextResponse.json({ 
        success: false, 
        error: "未查询到该专属关联码，请确认输入是否正确，或联系助理获取" 
      }, { status: 404 });
    }

    const bothAuthorized = record.student_authorized === true && record.parent_authorized === true;

    return NextResponse.json({
      success: true,
      student_completed: !!record.student_completed,
      parent_completed: !!record.parent_completed,
      student_authorized: record.student_authorized === undefined ? null : record.student_authorized,
      parent_authorized: record.parent_authorized === undefined ? null : record.parent_authorized,
      paid: !!record.paid,
      student_wechat_name: record.student_wechat_name || "",
      parent_wechat_name: record.parent_wechat_name || "",
      // Only release the reports if both sides authorized
      student_report: bothAuthorized ? record.student_report : null,
      parent_report: bothAuthorized ? record.parent_report : null,
    });
  } catch (error) {
    console.error("Family Link GET error:", error);
    return NextResponse.json({ success: false, error: "获取关联信息失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code: rawCode, role, report, action, activationCode, adminKey, student_wechat_name, parent_wechat_name, targetCode } = body;
    const code = rawCode?.toUpperCase().trim();

    // 1. 处理管理员动作
    if (action === "admin_list" || action === "admin_create" || action === "admin_pay") {
      const isAdminKey = (adminKey && (adminKey.startsWith("BRIDGE_ADMIN") || adminKey.startsWith("TSG_ADMIN_PAGE")));
      if (!isAdminKey) {
        return NextResponse.json({ success: false, error: "无管理员权限" }, { status: 403 });
      }

      const links = await readLinks();

      if (action === "admin_list") {
        const list = Object.values(links);
        return NextResponse.json({ success: true, list });
      }

      if (action === "admin_create") {
        if (!student_wechat_name || !parent_wechat_name) {
          return NextResponse.json({ success: false, error: "微信昵称不能为空" }, { status: 400 });
        }
        
        // 自动生成唯一专属码 QS-XXXX (随机4位大写)
        let newCode = "";
        let isUnique = false;
        while (!isUnique) {
          const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
          newCode = `QS-${rand}`;
          if (!links[newCode]) {
            isUnique = true;
          }
        }

        links[newCode] = {
          code: newCode,
          student_wechat_name,
          parent_wechat_name,
          student_completed: false,
          student_authorized: false,
          parent_completed: false,
          parent_authorized: false,
          paid: false
        };

        await writeLinks(links);
        return NextResponse.json({ success: true, code: newCode, record: links[newCode] });
      }

      if (action === "admin_pay") {
        if (!targetCode || !links[targetCode]) {
          return NextResponse.json({ success: false, error: "关联记录不存在" }, { status: 404 });
        }
        links[targetCode].paid = true;
        await writeLinks(links);
        return NextResponse.json({ success: true, record: links[targetCode] });
      }
    }

    // 2. 处理常规普通用户动作
    if (!code || !action) {
      return NextResponse.json({ success: false, error: "参数不完整" }, { status: 400 });
    }

    // 特权码动态注册与持久化
    const isAdminCode = code && (code.startsWith("BRIDGE_ADMIN") || code.startsWith("TSG_ADMIN_PAGE"));
    let links = await readLinks();
    if (isAdminCode && !links[code]) {
      const numSuffix = code.slice("TSG_ADMIN_PAGE".length);
      links[code] = {
        code,
        student_wechat_name: `Admin(学生${numSuffix})`,
        parent_wechat_name: `Admin(家长${numSuffix})`,
        student_completed: false,
        student_authorized: false,
        parent_completed: false,
        parent_authorized: false,
        paid: true
      };
      await writeLinks(links);
      links = await readLinks();
    }
    
    // 拦截非法码操作
    if (!links[code]) {
      return NextResponse.json({ success: false, error: "关联记录不存在，无法更新" }, { status: 404 });
    }

    const record = links[code];

    if (action === "submit") {
      if (role === "student") {
        record.student_report = report;
        record.student_completed = true;
      } else if (role === "parent") {
        record.parent_report = report;
        record.parent_completed = true;
      }
    } else if (action === "authorize") {
      if (role === "student") {
        record.student_authorized = true;
      } else if (role === "parent") {
        record.parent_authorized = true;
      }
    } else if (action === "deny") {
      if (role === "student") {
        record.student_authorized = false;
      } else if (role === "parent") {
        record.parent_authorized = false;
      }
    } else if (action === "pay") {
      if (!activationCode) {
        return NextResponse.json({ success: false, error: "缺少激活码" }, { status: 400 });
      }
      const upperActivation = activationCode.toUpperCase().trim();
      const expectedCode = `VIP-${code}`;
      if (upperActivation === expectedCode) {
        record.paid = true;
      } else {
        return NextResponse.json({ success: false, error: "激活密钥不正确" }, { status: 400 });
      }
    }

    await writeLinks(links);

    return NextResponse.json({
      success: true,
      student_completed: !!record.student_completed,
      parent_completed: !!record.parent_completed,
      student_authorized: record.student_authorized === undefined ? null : record.student_authorized,
      parent_authorized: record.parent_authorized === undefined ? null : record.parent_authorized,
      paid: !!record.paid,
    });
  } catch (error) {
    console.error("Family Link POST error:", error);
    return NextResponse.json({ success: false, error: "更新关联信息失败" }, { status: 500 });
  }
}
