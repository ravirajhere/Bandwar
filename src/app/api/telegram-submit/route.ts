import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Telegram credentials missing" }, { status: 500 });
    }

    const type = formData.get("type") as string;
    const imageFile = formData.get("image") as File | null;
    const contextId = formData.get("contextId") as string || "unknown";
    const userName = formData.get("submitterName") as string || "Anonymous Visitor";
    
    let message = `<b>🔔 New ${type.toUpperCase()}</b>\n<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    let jsonObj: Record<string, string> = {
      lastUpdated: new Date().toISOString().split('T')[0],
      lastEditedBy: userName
    };
    
    // 🚀 NAYA: File Path determine karna
    let filePath = "data/master.json"; // Default
    if (type.includes("Directory")) filePath = "data/directory.json";
    else if (type.includes("Vision")) filePath = "data/vision.json";
    else if (type.includes("Person")) filePath = "data/people.json";
    else if (type.includes("Landmark")) filePath = "data/media.json";
    else if (type.includes("Article")) filePath = "data/articles/landmarks.json"; // Example

    message += `<b>Target File:</b> <code>${filePath}</code>\n`;

    if (type === "Image Update Suggestion") {
      const contextName = formData.get("Context Name") as string;
      const currentImage = formData.get("currentImagePath") as string || "Unknown Path";
      const sourceReason = formData.get("source_reason") as string || "Not provided";

      message += `📍 <b>Target:</b> ${contextName}\n`;
      message += `🆔 <b>Context ID:</b> <code>${contextId}</code>\n`;
      message += `💡 <b>Source:</b> ${sourceReason}\n`;
      message += `👤 <b>Suggested By:</b> ${userName}\n\n`;
      
      message += `⚠️ <b>INSTRUCTION:</b>\n`;
      message += `Download the attached photo and <b>rename it exactly to</b> the file name below. Then upload it to your GitHub repo to overwrite the old image.\n\n`;
      message += `📁 <b>File to Overwrite:</b>\n<code>${currentImage}</code>\n\n`;

      jsonObj = {
        lastUpdated: new Date().toISOString().split('T')[0],
        lastEditedBy: userName,
        action: "Image updated (file overwritten)"
      };
    } else {
      formData.forEach((value, key) => {
        if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
          message += `<b>${key}:</b> ${value}\n`;
          const jsonKey = key.toLowerCase().replace(/\s+/g, '_');
          jsonObj[jsonKey] = value;
        }
      });
    }

    // JSON data ko Base64 mein encode karke bhejenge taaki webhook easily parse kar sake
    const jsonBase64 = Buffer.from(JSON.stringify(jsonObj)).toString('base64');
    const jsonSnippet = `\n<b>📋 JSON PAYLOAD (Base64):</b>\n<code>${jsonBase64}</code>`;
    const finalMessage = message + jsonSnippet;

    // Inline Keyboard
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `approve:${contextId}` },
          { text: "❌ Reject", callback_data: `reject:${contextId}` }
        ]
      ]
    };

    // Send to Telegram
    if (imageFile && imageFile.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append("chat_id", chatId);
      photoFormData.append("caption", finalMessage.substring(0, 1020)); 
      photoFormData.append("parse_mode", "HTML");
      photoFormData.append("reply_markup", JSON.stringify(replyMarkup));
      photoFormData.append("photo", imageFile, imageFile.name);

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: photoFormData,
      });

      if (!(await response.json()).ok) {
        return NextResponse.json({ error: "Telegram API failed" }, { status: 500 });
      }
    } else {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: finalMessage,
          parse_mode: "HTML",
          reply_markup: replyMarkup 
        }),
      });

      if (!(await response.json()).ok) {
        return NextResponse.json({ error: "Telegram API failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}