import { NextResponse } from "next/server";

async function uploadPendingImage(file: File, editId: string): Promise<string | null> {
  // ... (same as before)
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const fileName = `${editId}.jpg`;
    const imagePath = `public/images/pending/${fileName}`;
    const imageUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`;

    const res = await fetch(imageUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({ message: `Pending Image: ${editId}`, content: base64Image }),
    });
    if (res.ok) return `/images/pending/${fileName}`;
    return null;
  } catch { return null; }
}

async function saveToQueue(item: any) {
  // ... (same as before)
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/queue.json";

  try {
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const fileRes = await fetch(getFileUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } });
    
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
  } catch (error) { console.error(error); }
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
    const userUsername = formData.get("submitterUsername") as string || "";
    const displayUser = userUsername ? `${userName} (${userUsername})` : userName;
    const customCategory = formData.get("customCategory") as string || ""; // 🚀 Naya Category

    const editId = `edit_${Date.now()}`;
    let pendingImageUrl = null;

    if (imageFile && imageFile.size > 0) pendingImageUrl = await uploadPendingImage(imageFile, editId);

    const jsonObj: any = {};
    formData.forEach((value, key) => {
      if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
        jsonObj[key] = value;
      }
    });

    await saveToQueue({
      id: editId,
      type,
      contextId,
      userName,
      userUsername,
      timestamp: new Date().toISOString(),
      pendingImageUrl,
      targetType: formData.get("targetType") || "article",
      customCategory, // 🚀 Save this
      jsonObj, // Data for add
      intent: "add"
    });

    let message = `<b>🔔 New ${type.toUpperCase()}</b>\n\n`;
    if (customCategory) message += `🏷️ <b>New Category:</b> ${customCategory}\n`;
    message += `👤 <b>By:</b> ${displayUser}\n`;
    message += `🎯 <b>Target:</b> <code>${contextId}</code>\n`;
    message += `👇 <b>Review on Dashboard:</b>\nhttps://bandwar.vercel.app/admin/dashboard`;

    if (imageFile && imageFile.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append("chat_id", chatId!);
      photoFormData.append("caption", message); 
      photoFormData.append("parse_mode", "HTML");
      photoFormData.append("photo", imageFile, imageFile.name);
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, { method: "POST", body: photoFormData });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: true }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}