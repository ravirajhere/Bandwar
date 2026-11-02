import { NextResponse } from "next/server";

// 🚀 Helper: Image ko GitHub pending folder mein upload karna
async function uploadPendingImage(file: File, editId: string): Promise<string | null> {
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

// 🚀 Helper: Queue.json mein data save karna
async function saveToQueue(item: any) {
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
  } catch (error) { 
    console.error("Queue Save Failed:", error); 
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. Basic Data Extraction
    const type = formData.get("type") as string;
    const imageFile = formData.get("image") as File | null;
    const contextId = formData.get("contextId") as string || "unknown";
    const userName = formData.get("submitterName") as string || "Anonymous Visitor";
    const userUsername = formData.get("submitterUsername") as string || "";
    const displayUser = userUsername ? `${userName} (${userUsername})` : userName;
    const customCategory = formData.get("customCategory") as string || "";
    const targetType = formData.get("targetType") as string || "article";

    const editId = `edit_${Date.now()}`;
    let pendingImageUrl = null;

    if (imageFile && imageFile.size > 0) {
      pendingImageUrl = await uploadPendingImage(imageFile, editId);
    }

    // 2. Extract Fields for Edits
    const field = formData.get("field") as string || "";
    const currentValue = formData.get("currentValue") as string || "";
    const suggestedValue = formData.get("suggestedValue") as string || "";
    const currentImagePath = formData.get("currentImagePath") as string || "Unknown";

    // 3. Create JSON Object for "Add" requests
    const jsonObj: any = {};
    formData.forEach((value, key) => {
      if (
        key !== "type" && key !== "image" && key !== "targetType" && 
        key !== "submitterName" && key !== "submitterUsername" && 
        key !== "customCategory" && key !== "field" && 
        key !== "currentValue" && key !== "suggestedValue" && key !== "currentImagePath" &&
        typeof value === "string" && value.trim() !== ""
      ) {
        jsonObj[key] = value;
      }
    });

    // 4. 🚀 INTELLIGENT INTENT DETECTION
    let intent = "add";
    if (type === "Image Update Suggestion" || (type.includes("Image") && pendingImageUrl && currentImagePath !== "Unknown")) {
      intent = "image_update";
    } else if (field && suggestedValue) {
      intent = "edit";
    }

    // 5. 🚀 DETERMINE TARGET FILE PATH
    let filePath = "data/master.json";
    if (type.includes("Directory") || targetType === "directory") filePath = "data/directory.json";
    else if (type.includes("Person") || targetType === "person") filePath = "data/people.json";
    else if (type.includes("Landmark") || targetType === "landmark") filePath = "data/media.json";
    else if (type.includes("Article") || targetType === "article") {
      // For adds, save directly to the requested category. 
      // For edits, publish route will handle searching across files.
      if (intent === "add") {
        const cat = formData.get("Category") as string || "general";
        filePath = `data/articles/${cat}.json`;
      } else {
        filePath = "data/articles/landmarks.json"; // fallback
      }
    } else if (type.includes("Gallery") || targetType === "image") {
      filePath = "data/media.json";
    }

    // 6. Save to Queue (Dashboard ke liye)
    await saveToQueue({
      id: editId,
      type,
      contextId,
      userName,
      userUsername,
      timestamp: new Date().toISOString(),
      pendingImageUrl,
      targetType,
      customCategory,
      intent,
      filePath,
      // Edit specific fields
      field,
      oldValue: currentValue,
      newValue: suggestedValue,
      currentImagePath,
      // Add specific fields
      jsonObj
    });

    // 7. Telegram Notification
    let message = `<b>🔔 New ${type.toUpperCase()}</b>\n\n`;
    if (customCategory) message += `🏷️ <b>New Category:</b> ${customCategory}\n`;
    message += `👤 <b>By:</b> ${displayUser}\n`;
    message += `🎯 <b>Target:</b> <code>${contextId}</code>\n`;
    
    if (intent === "edit") {
      message += `⚙️ <b>Action:</b> Edit Field (<code>${field}</code>)\n`;
    } else if (intent === "image_update") {
      message += `⚙️ <b>Action:</b> Update Image\n`;
    } else {
      message += `⚙️ <b>Action:</b> Add New\n`;
    }

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
    console.error("Telegram Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}