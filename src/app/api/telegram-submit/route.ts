import { NextResponse } from "next/server";

// Helper to save to GitHub Queue
async function saveToQueue(item: any) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/queue.json";

  try {
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const fileRes = await fetch(getFileUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
    });
    
    let fileData = null;
    
    // 👇 FIX: TypeScript ko bataya ki pending ek array hai jisme kuch bhi aa sakta hai
    let queueContent: { pending: any[] } = { pending: [] };
    
    if (fileRes.ok) {
      fileData = await fileRes.json();
      queueContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
      // Safety check: Agar file mein pending nahi hai to naya array banao
      if (!queueContent.pending) queueContent.pending = [];
    }

    // Add new item with unique ID
    const newItem = { id: `edit_${Date.now()}`, ...item };
    queueContent.pending.push(newItem);

    // Commit back to GitHub
    await fetch(getFileUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `New Submission: ${item.contextId}`,
        content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString('base64'),
        ...(fileData && { sha: fileData.sha })
      })
    });
    
    return newItem.id;
  } catch (error) {
    console.error("Queue save failed", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const type = formData.get("type") as string;
    const imageFile = formData.get("image") as File | null;
    const contextId = formData.get("contextId") as string || "unknown";
    const userName = formData.get("submitterName") as string || "Anonymous Visitor";
    const field = formData.get("field") as string || ""; 
    const suggestedValue = formData.get("suggestedValue") as string || ""; 
    
    let message = `<b>🔔 New ${type.toUpperCase()}</b>\n<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    let filePath = "data/master.json"; 
    let intent = "edit"; 
    let jsonObj: any = {};

    if (type.includes("Directory")) filePath = "data/directory.json";
    else if (type.includes("Vision")) filePath = "data/vision.json";
    else if (type.includes("Person")) filePath = "data/people.json";
    else if (type.includes("Landmark") || type === "Image Update Suggestion") filePath = "data/media.json";
    else if (type.includes("Article")) filePath = "data/articles/landmarks.json";

    message += `<b>Target File:</b> <code>${filePath}</code>\n`;

    if (type === "Image Update Suggestion") {
      intent = "image_update";
      jsonObj = { currentImage: formData.get("currentImagePath"), contextName: formData.get("Context Name") };
      message += `<b>Action:</b> Image Update\n`;
    } 
    else if (field && suggestedValue) {
      intent = "edit";
      jsonObj = { field, suggestedValue };
      message += `<b>Action:</b> Edit Field\n`;
      message += `<b>Context ID:</b> <code>${contextId}</code>\n`;
      message += `<b>Field:</b> ${field}\n`;
      message += `<b>New Value:</b> ${suggestedValue}\n`;
    } 
    else {
      intent = "add";
      message += `<b>Action:</b> Add New\n`;
      formData.forEach((value, key) => {
        if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
          jsonObj[key] = value;
        }
      });
    }

    message += `👤 <b>Suggested By:</b> ${userName}\n`;

    // 1. Save to Queue (Dashboard ke liye)
    const payloadForQueue = { filePath, contextId, intent, jsonObj, type, userName, timestamp: new Date().toISOString() };
    const editId = await saveToQueue(payloadForQueue);

    // 2. Send to Telegram
    const webhookData = { intent, filePath, contextId, jsonObj };
    const jsonBase64 = Buffer.from(JSON.stringify(webhookData)).toString('base64');
    message += `\n<b>📋 PAYLOAD:</b>\n<code>${jsonBase64}</code>`;

    const replyMarkup = {
      inline_keyboard: [[
        { text: "✅ Approve", callback_data: `approve:${contextId}` },
        { text: "❌ Reject", callback_data: `reject:${contextId}` }
      ]]
    };

    if (imageFile && imageFile.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append("chat_id", chatId!);
      photoFormData.append("caption", message.substring(0, 1020)); 
      photoFormData.append("parse_mode", "HTML");
      photoFormData.append("reply_markup", JSON.stringify(replyMarkup));
      photoFormData.append("photo", imageFile, imageFile.name);

      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: photoFormData,
      });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", reply_markup: replyMarkup }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}