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
    
    // User ka naam nikalna (Credit ke liye)
    const userName = formData.get("Submitter Name") as string || formData.get("submitterName") as string || "Anonymous Visitor";

    let message = `<b>✨ New ${type.toUpperCase()}</b>\n<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    let jsonObj: Record<string, string> = {
      lastUpdated: new Date().toISOString().split('T')[0],
      lastEditedBy: userName
    };

    // Agar inline edit hai (jisme contextId aur field hota hai)
    if (formData.has("contextId")) {
      const contextId = formData.get("contextId") as string;
      const field = formData.get("field") as string;
      const oldValue = formData.get("currentValue") as string;
      const newValue = formData.get("suggestedValue") as string;
      
      message += `📍 <b>Target ID:</b> <code>${contextId}</code>\n`;
      message += `📝 <b>Field:</b> ${field}\n`;
      message += `❌ <b>Old:</b> ${oldValue}\n`;
      message += `✅ <b>New:</b> ${newValue}\n`;
      message += `👤 <b>Suggested By:</b> ${userName}\n\n`;

      jsonObj = {
        lastUpdated: new Date().toISOString().split('T')[0],
        lastEditedBy: userName,
        update_field: field,
        new_value: newValue
      };
    } 
    // Agar naya content add ho raha hai (Article, Person, Directory)
    else {
      formData.forEach((value, key) => {
        if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
          message += `<b>${key}:</b> ${value}\n`;
          
          // JSON key format (e.g., "Article Title" -> "article_title")
          const jsonKey = key.toLowerCase().replace(/\s+/g, '_');
          jsonObj[jsonKey] = value;
        }
      });
    }

    const jsonSnippet = `\n<b>📋 COPY-PASTE THIS JSON:</b>\n<pre>${JSON.stringify(jsonObj, null, 2)}</pre>`;
    const finalMessage = message + jsonSnippet;

    if (imageFile && imageFile.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append("chat_id", chatId);
      photoFormData.append("caption", finalMessage.substring(0, 1020)); 
      photoFormData.append("parse_mode", "HTML");
      photoFormData.append("photo", imageFile, imageFile.name);

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: photoFormData,
      });

      const data = await response.json();
      if (!data.ok) {
        return NextResponse.json({ error: "Telegram API failed", details: data.description }, { status: 500 });
      }
    } else {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: finalMessage,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        return NextResponse.json({ error: "Telegram API failed", details: data.description }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}