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
    const contextId = formData.get("contextId") as string || formData.get("Article Title") as string || "Unknown";
    const userName = formData.get("submitterName") as string || formData.get("Your Name") as string || "Anonymous Visitor";

    let message = `<b>🔔 New ${type} Update</b>\n<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    let jsonSnippet = "";

    // ==========================================
    // 1. INLINE TEXT EDIT LOGIC
    // ==========================================
    if (type.includes("Article") || type.includes("Person") || type.includes("Infobox")) {
      const field = formData.get("field") as string;
      const oldValue = formData.get("currentValue") as string;
      const newValue = formData.get("suggestedValue") as string;
      
      message += `📍 <b>Target ID:</b> <code>${contextId}</code>\n`;
      message += `📝 <b>Field:</b> ${field}\n`;
      message += `❌ <b>Old:</b> ${oldValue}\n`;
      message += `✅ <b>New:</b> ${newValue}\n`;
      message += `👤 <b>Suggested By:</b> ${userName}\n\n`;

      // Ready to copy JSON for the specific field
      jsonSnippet = `<b>📋 COPY-PASTE THIS:</b>\n<pre>{
  "lastUpdated": "${new Date().toISOString().split('T')[0]}",
  "lastEditedBy": "${userName}",
  "update_field": "${field}",
  "new_value": "${newValue}"
}</pre>`;

    } 
    // ==========================================
    // 2. NEW CONTENT ADD LOGIC (Article, Person, etc.)
    // ==========================================
    else if (type.includes("New")) {
      let jsonObj: Record<string, string> = {
        lastUpdated: new Date().toISOString().split('T')[0],
        lastEditedBy: userName
      };
      
      formData.forEach((value, key) => {
        if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
          message += `<b>${key}:</b> ${value}\n`;
          const jsonKey = key.toLowerCase().replace(/\s+/g, '_');
          jsonObj[jsonKey] = value;
        }
      });

      jsonSnippet = `<b>📋 COPY-PASTE THIS OBJECT:</b>\n<pre>${JSON.stringify(jsonObj, null, 2)}</pre>`;
    } 
    // ==========================================
    // 3. GENERAL FEEDBACK / MAP / DIRECTORY
    // ==========================================
    else {
      formData.forEach((value, key) => {
        if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
          message += `<b>${key}:</b> ${value}\n`;
        }
      });
    }

    const finalMessage = message + jsonSnippet;

    // Bhejna Telegram par
    if (imageFile && imageFile.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append("chat_id", chatId);
      photoFormData.append("caption", finalMessage.substring(0, 1020)); 
      photoFormData.append("parse_mode", "HTML");
      photoFormData.append("photo", imageFile, imageFile.name);

      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: photoFormData,
      });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: finalMessage,
          parse_mode: "HTML",
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}