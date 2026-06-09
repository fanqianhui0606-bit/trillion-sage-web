import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const APPOINTMENTS_FILE = path.join(process.cwd(), "appointments.json");

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const record = {
      timestamp: new Date().toISOString(),
      studentName: data.studentName || "未输入姓名",
      contact: data.contact || "未输入联系方式",
      grade: data.grade || "",
      selectedFields: data.selectedFields || [],
      concern: data.concern || "",
      appointmentId: data.appointmentId || "",
    };

    // 格式化为单行 JSON 并追加
    const line = JSON.stringify(record) + "\n";
    await fs.promises.appendFile(APPOINTMENTS_FILE, line, "utf8");
    
    return NextResponse.json({ success: true, message: "预约提交成功" });
  } catch (error) {
    console.error("Failed to save appointment:", error);
    return NextResponse.json({ success: false, error: "预约失败，请稍后重试" }, { status: 500 });
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

    if (!fs.existsSync(APPOINTMENTS_FILE)) {
      return NextResponse.json({ success: true, list: [] });
    }

    const content = await fs.promises.readFile(APPOINTMENTS_FILE, "utf8");
    const list = content
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
      
    return NextResponse.json({ success: true, list });
  } catch (error) {
    console.error("Failed to read appointments:", error);
    return NextResponse.json({ success: false, error: "读取数据失败" }, { status: 500 });
  }
}
