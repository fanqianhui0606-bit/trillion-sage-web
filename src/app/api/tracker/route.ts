import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ORDERS_FILE = path.join(process.cwd(), "orders.json");

function readOrders(): Record<string, unknown>[] {
  if (!fs.existsSync(ORDERS_FILE)) return [];
  const content = fs.readFileSync(ORDERS_FILE, "utf-8");
  if (!content.trim()) return [];
  return JSON.parse(content);
}

function writeOrders(orders: Record<string, unknown>[]): void {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

// GET /api/tracker - 获取所有订单 或 按家庭码查询
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const familyCode = searchParams.get("familyCode");

    const orders = readOrders();

    if (familyCode) {
      // 按家庭码查询
      const order = orders.find((o: Record<string, unknown>) => o.familyCode === familyCode);
      return NextResponse.json({ success: true, order: order || null });
    }

    return NextResponse.json({ success: true, list: orders });
  } catch (error) {
    console.error("Failed to read orders:", error);
    return NextResponse.json({ success: false, error: "读取失败" });
  }
}

// POST /api/tracker - 创建订单
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orders = readOrders();

    // 检查家庭码是否已存在
    if (body.familyCode && orders.some((o: Record<string, unknown>) => o.familyCode === body.familyCode)) {
      return NextResponse.json({ success: false, error: "家庭码已存在" });
    }

    // 添加时间戳
    const order = {
      ...body,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(order);
    writeOrders(orders);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ success: false, error: "创建失败" });
  }
}