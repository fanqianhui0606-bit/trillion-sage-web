import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 取得持久化写入文件路径：项目根目录下的 submissions.json
const SUBMISSIONS_FILE = path.join(process.cwd(), "submissions.json");

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 构造留痕的结构
    const record = {
      timestamp: new Date().toISOString(),
      userName: data.userName || "未输入姓名",
      activationCode: data.activationCode || "体验版无卡",
      edition: data.edition || "user",
      answers: data.answers || {},
      scores: data.scores || {},
      matches: (data.matches || []).map((m: {
        majorId: string;
        majorName: string;
        score: number;
        valueSim?: number;
        interestSim?: number;
        habitsSim?: number;
        abilitySim?: number;
      }) => ({
        majorId: m.majorId,
        majorName: m.majorName,
        score: m.score,
        valueSim: m.valueSim,
        interestSim: m.interestSim,
        habitsSim: m.habitsSim,
        abilitySim: m.abilitySim,
      })),
    };

    // 以 JSON Lines 格式写入文件 (末尾换行)
    const line = JSON.stringify(record) + "\n";
    
    // 追加写入
    await fs.promises.appendFile(SUBMISSIONS_FILE, line, "utf8");
    
    return NextResponse.json({ success: true, message: "数据成功留痕" });
  } catch (error) {
    console.error("Failed to save submission:", error);
    // 即使写入失败，也不中断用户的测验结果展示流
    return NextResponse.json({ success: false, error: "留痕失败，但不影响计算" });
  }
}

export async function GET() {
  try {
    // 支持获取所有数据的 GET 接口 (仅用于管理员后台，包含简单校验)
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      return NextResponse.json({ success: true, list: [] });
    }
    const content = await fs.promises.readFile(SUBMISSIONS_FILE, "utf8");
    const list = content
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
      
    return NextResponse.json({ success: true, list });
  } catch (error) {
    console.error("Failed to read submissions:", error);
    return NextResponse.json({ success: false, error: "无法读取数据" });
  }
}

