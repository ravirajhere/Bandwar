import { NextResponse } from "next/server";

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
    let queueContent: { pending: any[], approved: any[] } = { pending: [], approved: [] };
    
    if (fileRes.ok) {
      fileData = await fileRes.json();
      queueContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
      if (!queueContent.pending) queueContent.pending = [];
      if (!queueContent.approved) queueContent.approved = [];
    }

    queueContent.pending.push(item);

    await fetch(getFileUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `New Submission: ${item.contextId}`,
        content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString('base64'),
        ...(fileData && { sha: fileData.sha })
      })
    });
  } catch (error) {
    console.error("Queue save failed", error);
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
    
    let filePath = "data/master.json"; 
    let intent = "edit"; 
    let jsonObj: any = {};

    if (type.includes("Directory")) filePath = "data/directory.json";
    else if (type.includes("Vision")) filePath = "data/vision.json";
    else if (type.includes("Person")) filePath = "data/people.json";
    else if (type.includes("Landmark") || type === "Image Update Suggestion") filePath = "data/media.json";
    else if (type.includes("Article")) filePath = "data/articles/landmarks.json";

    if (type === "Image Update Suggestion") {
      intent = "image_update";
      jsonObj = { currentImage: formData.get("currentImagePath"), contextName: formData.get("Context Name") };
    } 
    else if (field && suggestedValue) {
      intent = "edit";
      jsonObj = { field, suggestedValue };
    } 
    else {
      intent = "add";
      formData.forEach((value, key) => {
        if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
          jsonObj[key] = value;
        }
      });
    }

    const editId = `edit_${Date.now()}`;
    
    // Clean Message
    let message = `<b>🔔 New ${type.toUpperCase()}</b>\n\n`;
    message += `👤 <b>By:</b> ${userName}\n`;
    message += `🎯 <b>Target:</b> <code>${contextId}</code>\n`;
    message += `⚙️ <b>Action:</b> ${intent}\n\n`;
    message += `👇 <b>Review on Dashboard:</b>\nhttps://bandwar.vercel.app/admin/dashboard`;

    const replyMarkup = {
      inline_keyboard: [[
        { text: "✅ Stage for Publish", callback_data: `approve:${editId}` },
        { text: "❌ Reject", callback_data: `reject:${editId}` }
      ]]
    };

    let telegramMessageId = null;

    if (imageFile && imageFile.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append("chat_id", chatId!);
      photoFormData.append("caption", message); 
      photoFormData.append("parse_mode", "HTML");
      photoFormData.append("reply_markup", JSON.stringify(replyMarkup));
      photoFormData.append("photo", imageFile, imageFile.name);
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, { method: "POST", body: photoFormData });
      const data = await res.json();
      if (data.ok) telegramMessageId = data.result.message_id;
    } else {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", reply_markup: replyMarkup, disable_web_page_preview: true }),
      });
      const data = await res.json();
      if (data.ok) telegramMessageId = data.result.message_id;
    }

    // Save to Queue
    const payloadForQueue = { id: editId, filePath, contextId, intent, jsonObj, type, userName, timestamp: new Date().toISOString(), telegramMessageId, chatId };
    await saveToQueue(payloadForQueue);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}