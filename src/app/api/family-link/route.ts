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

// 学术物理隐喻模拟数据 (PhD 级别描述，用于 TSG_ADMIN_PAGE 后门测试)
const ADMIN_STUDENT_REPORT = {
  mirror_echo: "你擅长在看似无序的现实扰动中，剥离出底层的常微分方程。无论是处理引力波微扰下的极质量比旋入（EMRI）轨道演化，还是面对复杂的动力学系统，你的第一直觉都是寻找哈密顿量守恒量。这种对对称性和守恒律的物理敏感性，让你在应对多变量交织的学术困境时，总能找到最省力的本征态。",
  math_aesthetic: "数理审美极高，具有强烈的‘低熵化’与‘降维解析’倾向。你讨厌没有物理解释的纯粹数值拟合，更偏爱通过解析推导触及规律本质。你眼中的真理是协变且简洁的，这种思维方式使你在面对高难度跨学科探索时，能够建立起极具穿透力的物理类比。",
  reality_guide: "虽然你的精神世界常驻在光滑、对称的高维流形上，但现实往往是个非协变的耗散系统。试着接受现实中的‘量子退相干’与熵增。不要把每一次低效沟通都视为冗余噪声，很多时候，噪声本身就蕴含着系统演化的涨落耗散定理。尝试在混沌的非平衡态中，寻找局部最优的自组织结构。"
};

const ADMIN_PARENT_REPORT = {
  decision_role: "在家庭这个高度非线性的多体系统中，您长期扮演着‘引力中心’与‘轨道约束器’的角色。您为家庭成员提供了稳定的边界条件，但为了维持这种对称性，您也独自耗散了大量的热力学自由度，承受着不易被察觉的心智张力。",
  soft_moment: "那些孩子在物理实验中流露出的纯粹好奇心，或是她在深夜书桌前演算纸上写下某行漂亮公式的瞬间，如同遥远双星并合释放的瞬时引力波，是您心中引力势阱里最柔和、也最真实的相干震颤。",
  parenting_style: "当孩子为了规避现实摩擦而选择隐入自己的‘视界’（Event Horizon）时，您虽然在宏观上希望用强引力干预其运行轨迹，但微观上又在克制，试图给予她量子隧穿式的自由空间。您在守护与放手之间，经历着频繁的认知相变。",
  warm_suggestion: "两个具有不同初始条件的动力学系统，在强耦合时难免产生相空间轨道的剧烈分叉。这并非系统的崩溃，而是同频共振前的过渡态。给彼此一点退相干的时间，千殊团队将作为您的学术与成长微扰辅助，协助您调整系统的共振本征频率。"
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

    // 1. 特权管理员后门放行
    if (code === "TSG_ADMIN_PAGE") {
      return NextResponse.json({
        success: true,
        student_completed: true,
        parent_completed: true,
        student_authorized: true,
        parent_authorized: true,
        paid: true,
        student_wechat_name: "Admin(学生)",
        parent_wechat_name: "Admin(家长)",
        student_report: ADMIN_STUDENT_REPORT,
        parent_report: ADMIN_PARENT_REPORT,
      });
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
      if (adminKey !== "TSG_ADMIN_PAGE") {
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

    // 特权码直接放行
    if (code === "TSG_ADMIN_PAGE") {
      return NextResponse.json({
        success: true,
        student_completed: true,
        parent_completed: true,
        student_authorized: true,
        parent_authorized: true,
        paid: true,
      });
    }

    const links = await readLinks();
    
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
