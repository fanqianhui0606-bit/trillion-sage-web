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

function findOrderIndex(orders: Record<string, unknown>[], orderNo: string): number {
  return orders.findIndex((o: Record<string, unknown>) => o.orderNo === orderNo);
}

// GET /api/tracker/[orderNo] - 获取单个订单
export async function GET(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  try {
    const { orderNo } = params;
    const orders = readOrders();
    const index = findOrderIndex(orders, orderNo);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error("Failed to read order:", error);
    return NextResponse.json({ success: false, error: "读取失败" });
  }
}

// PUT /api/tracker/[orderNo] - 更新订单
export async function PUT(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  try {
    const { orderNo } = params;
    const updates = await request.json();
    const orders = readOrders();
    const index = findOrderIndex(orders, orderNo);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
    }

    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    writeOrders(orders);
    return NextResponse.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ success: false, error: "更新失败" });
  }
}

// DELETE /api/tracker/[orderNo] - 删除订单
export async function DELETE(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  try {
    const { orderNo } = params;
    const orders = readOrders();
    const index = findOrderIndex(orders, orderNo);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
    }

    orders.splice(index, 1);
    writeOrders(orders);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json({ success: false, error: "删除失败" });
  }
}