import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  try {
    const { orderNo } = params;
    const body = await request.json();
    const { stepId, ...stepData } = body;

    const ORDERS_FILE = path.join(process.cwd(), "orders.json");

    if (!fs.existsSync(ORDERS_FILE)) {
      return NextResponse.json({ success: false, error: "订单文件不存在" }, { status: 404 });
    }

    const orders: Record<string, unknown>[] = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8") || "[]");
    const index = orders.findIndex((o) => o.orderNo === orderNo);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
    }

    const order = orders[index] as Record<string, unknown>;
    const steps = (order.steps as Record<string, unknown>) || {};

    steps[stepId] = {
      status: "completed",
      data: stepData,
      completedAt: new Date().toISOString(),
    };

    order.steps = steps;
    order.updatedAt = new Date().toISOString();
    orders[index] = order;

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");

    return NextResponse.json({ success: true, step: steps[stepId] });
  } catch (error) {
    console.error("Failed to complete step:", error);
    return NextResponse.json({ success: false, error: "操作失败" });
  }
}