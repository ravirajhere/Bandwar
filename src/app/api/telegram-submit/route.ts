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
    const field = formData.get("field") as string || ""; // For edits
    const suggestedValue = formData.get("suggestedValue") as string || ""; // For edits
    
    let message = `<b>🔔 New ${type.toUpperCase()}</b>\n<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    let filePath = "data/master.json"; // Default
    let intent = "edit"; // "edit" or "add"
    let jsonObj: any = {};

    // File Path Determine Karna
    if (type.includes("Directory")) filePath = "data/directory.json";
    else if (type.includes("Vision")) filePath = "data/vision.json";
    else if (type.includes("Person")) filePath = "data/people.json";
    else if (type.includes("Landmark") || type === "Image Update Suggestion") filePath = "data/media.json";
    else if (type.includes("Article")) filePath = "data/articles/landmarks.json";

    message += `<b>Target File:</b> <code>${filePath}</code>\n`;

    if (type === "Image Update Suggestion") {
      // Image logic (Same as before)
      const contextName = formData.get("Context Name") as string;
      const currentImage = formData.get("currentImagePath") as string || "Unknown Path";
      const sourceReason = formData.get("source_reason") as string || "Not provided";

      message += `📍 <b>Target:</b> ${contextName}\n`;
      message += `🆔 <b>Context ID:</b> <code>${contextId}</code>\n`;
      message += `💡 <b>Source:</b> ${sourceReason}\n`;
      message += `👤 <b>Suggested By:</b> ${userName}\n\n`;
      message += `⚠️ <b>INSTRUCTION:</b> Download & rename to <code>${currentImage}</code>.\n\n`;

      intent = "image_update";
      jsonObj = { currentImage, contextName };
    } 
    else if (field && suggestedValue) {
      // Edit Logic (Agar field aur value di gayi hai)
      intent = "edit";
      jsonObj = { field, suggestedValue };
      message += `<b>Action:</b> Edit Field\n`;
      message += `<b>Context ID:</b> <code>${contextId}</code>\n`;
      message += `<b>Field:</b> ${field}\n`;
      message += `<b>Old Value:</b> ${formData.get("currentValue")}\n`;
      message += `<b>New Value:</b> ${suggestedValue}\n`;
    } 
    else {
      // Add New Logic (Form submit)
      intent = "add";
      message += `<b>Action:</b> Add New\n`;
      formData.forEach((value, key) => {
        if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
          message += `<b>${key}:</b> ${value}\n`;
          jsonObj[key] = value;
        }
      });
    }

    message += `👤 <b>Suggested By:</b> ${userName}\n`;

    // Package data for Webhook
    const webhookData = {
      intent,
      filePath,
      contextId,
      jsonObj
    };
    
    const jsonBase64 = Buffer.from(JSON.stringify(webhookData)).toString('base64');
    const jsonSnippet = `\n<b>📋 PAYLOAD:</b>\n<code>${jsonBase64}</code>`;
    const finalMessage = message + jsonSnippet;

    const replyMarkup = {
      inline_keyboard: [[
        { text: "✅ Approve", callback_data: `approve:${contextId}` },
        { text: "❌ Reject", callback_data: `reject:${contextId}` }
      ]]
    };

    if (imageFile && imageFile.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append("chat_id", chatId);
      photoFormData.append("caption", finalMessage.substring(0, 1020)); 
      photoFormData.append("parse_mode", "HTML");
      photoFormData.append("reply_markup", JSON.stringify(replyMarkup));
      photoFormData.append("photo", imageFile, imageFile.name);
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, { method: "POST", body: photoFormData });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: finalMessage, parse_mode: "HTML", reply_markup: replyMarkup }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}