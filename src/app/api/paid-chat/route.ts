import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...payload } = body;
    const BACKEND_URL = process.env.AGENT_BACKEND_URL || "http://127.0.0.1:8000";

    if (action === "report") {
      const response = await fetch(`${BACKEND_URL}/api/v2/chat/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: errText }, { status: response.status });
      }

      const reportData = await response.json();
      return NextResponse.json(reportData);
    }

    // 默认是 stream 动作
    const response = await fetch(`${BACKEND_URL}/api/v2/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.detail || "激活码验证失败或未支付";
      return NextResponse.json({ error: errMsg }, { status: response.status });
    }

    // 返回流式响应透传给浏览器
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }
        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Paid Chat Proxy Error]:", error);
    const message = error instanceof Error ? error.message : "无法连接到后台大模型网关";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
