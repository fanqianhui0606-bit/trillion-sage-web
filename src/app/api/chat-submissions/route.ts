import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CHAT_SUBMISSIONS_FILE = path.join(process.cwd(), "chat_submissions.json");

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const record = {
      timestamp: new Date().toISOString(),
      role: data.role || "unknown", // "student" | "parent"
      code: data.code || "体验版无码",
      messages: data.messages || [],
      report: data.report || null,
    };

    // Format as single line JSON Line
    const line = JSON.stringify(record) + "\n";
    
    // Append to file
    await fs.promises.appendFile(CHAT_SUBMISSIONS_FILE, line, "utf8");
    
    return NextResponse.json({ success: true, message: "聊天数据留档成功" });
  } catch (error) {
    console.error("Failed to save chat submission:", error);
    return NextResponse.json({ success: false, error: "留档失败" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get("adminKey");
    
    const isAdmin = adminKey && (adminKey.startsWith("BRIDGE_ADMIN") || adminKey.startsWith("TSG_ADMIN_PAGE"));
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "权限不足" }, { status: 403 });
    }

    if (!fs.existsSync(CHAT_SUBMISSIONS_FILE)) {
      return NextResponse.json({ success: true, list: [] });
    }

    const content = await fs.promises.readFile(CHAT_SUBMISSIONS_FILE, "utf8");
    const list = content
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
      
    return NextResponse.json({ success: true, list });
  } catch (error) {
    console.error("Failed to read chat submissions:", error);
    return NextResponse.json({ success: false, error: "读取数据失败" }, { status: 500 });
  }
}
