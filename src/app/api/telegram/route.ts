import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contextId, fieldName, currentValue, suggestedValue, userName, sourceReason, contextType } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Telegram credentials missing" }, { status: 500 });
    }

    // 🎨 Telegram Message Format (HTML)
    const message = `
<b>📝 New Edit Suggestion</b>
<b>━━━━━━━━━━━━━━━━━━</b>
<b>📄 Page:</b> <code>${contextId}</code>
<b>🗂️ Type:</b> ${contextType || "Article"}
<b>🔤 Field:</b> <code>${fieldName}</code>

<b>❌ Current Text:</b>
<i>${currentValue || "N/A"}</i>

<b>✅ Suggested Text:</b>
<pre>${suggestedValue}</pre>

${sourceReason ? `<b>💡 Source:</b> ${sourceReason}\n` : ""}
<b>👤 Submitted By:</b> ${userName || "Anonymous Visitor"}
    `;

    // Telegram API par message bhejna
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML", // Yeh formatting enable karega
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return NextResponse.json({ error: "Telegram API failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}