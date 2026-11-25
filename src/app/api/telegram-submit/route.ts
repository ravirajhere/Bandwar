import { NextRequest, NextResponse } from "next/server";
import { getArticleById, getContributors } from "@/lib/data";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function normalizeUsername(u: string) { return u.replace(/^@/, "").toLowerCase().trim(); }

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: NO_STORE });

  const githubToken = process.env.GITHUB_TOKEN, repoOwner = process.env.GITHUB_REPO_OWNER, repoName = process.env.GITHUB_REPO_NAME;
  const botToken = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID;

  if (!githubToken || !botToken || !chatId) return NextResponse.json({ error: "Server config error" }, { status: 500, headers: NO_STORE });

  try {
    const formData = await req.formData();
    const type = String(formData.get("type") || "").slice(0, 100);
    const contextIdRaw = String(formData.get("contextId") || "").slice(0, 100);
    const contextId = contextIdRaw.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (!contextId || contextId === "new-item" || contextId === "unknown") {
      return NextResponse.json({ error: "Invalid or missing Context ID. Cannot process." }, { status: 400, headers: NO_STORE });
    }

    const userNameRaw = String(formData.get("submitterName") || "").slice(0, 100).trim() || "Anonymous";
    // Gate ab dono bhejta hai — suggestedBy + submitterUsername, dono accept karo
    const userUsernameRaw = String(formData.get("submitterUsername") || formData.get("suggestedBy") || "").slice(0, 50).trim();
    const field = String(formData.get("field") || "");
    const oldValue = String(formData.get("currentValue") || "");
    const newValue = String(formData.get("suggestedValue") || "");

    let userUsername = "";
    if (userUsernameRaw) {
      const validUser = getContributors().find(c => normalizeUsername(c.username) === normalizeUsername(userUsernameRaw));
      if (validUser) userUsername = validUser.username; // normalized wala save karo, raw nahi
    }

    const imageFile = formData.get("image") as File | null;
    let pendingImageUrl = null;

    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 5 * 1024 * 1024) throw new Error("Image too large (max 5MB)");
      if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) throw new Error("Invalid image type");

      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const editId = `edit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const imagePath = `public/images/pending/${editId}.jpg`;

      const imgRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Pending image ${editId}`, content: base64 }),
      });
      if (imgRes.ok) pendingImageUrl = `/images/pending/${editId}.jpg`;
    }

    let intent = "add";
    const targetType = String(formData.get("targetType") || "").toLowerCase();

    if (type.includes("Image Update") || (type.includes("Image") && pendingImageUrl && formData.get("currentImagePath") !== "Unknown")) {
      intent = "image_update";
    } else if (formData.get("field") && formData.get("suggestedValue")) {
      intent = "edit";
    }

    let filePath = "";

    if (targetType === "gallery") {
      filePath = "data/media.json";
    } else if (targetType === "person") {
      filePath = "data/people.json";
    } else if (targetType === "directory") {
      filePath = "data/directory.json";
    } else if (targetType === "article") {
      if (intent === "image_update" || intent === "edit") {
        const existingArticle = getArticleById(contextId);
        if (existingArticle && existingArticle.categories && existingArticle.categories.length > 0) {
          filePath = `data/articles/${existingArticle.categories[0]}.json`;
        } else {
          return NextResponse.json({ error: "Article not found for update." }, { status: 404, headers: NO_STORE });
        }
      } else {
        const cat = String(formData.get("Category") || "general").toLowerCase().replace(/[^a-z0-9-]/g, "-");
        filePath = `data/articles/${cat}.json`;
      }
    } else {
      return NextResponse.json({ error: "Invalid target type." }, { status: 400, headers: NO_STORE });
    }

    const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/queue.json`;
    const queueRes = await fetch(queueUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } });

    let fileData = null;
    let queueContent: { pending: any[], approved: any[] } = { pending: [], approved: [] };

    if (queueRes.ok) {
      fileData = await queueRes.json();
      queueContent = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
      if (!Array.isArray(queueContent.pending)) queueContent.pending = [];
      if (!Array.isArray(queueContent.approved)) queueContent.approved = [];
    }

    const queueItem = {
      id: `edit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      contextId,
      userName: userNameRaw,
      userUsername,
      suggestedBy: userUsername, // profile pe filter isi se hoga — ek hi field
      timestamp: new Date().toISOString(),
      pendingImageUrl,
      intent,
      filePath,
      targetType,
      field,
      oldValue,
      newValue,
      currentImagePath: formData.get("currentImagePath") || "Unknown",
      jsonObj: targetType === "article" ? { Category: filePath.split('/').pop()?.replace('.json', '') || "general" } : {}
    };

    queueContent.pending.push(queueItem);

    await fetch(queueUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
      body: JSON.stringify({ message: `New submission ${queueItem.id}`, content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString("base64"), ...(fileData && { sha: fileData.sha }) }),
    });

    // Telegram — ab admin ko Telegram se hi decision ho jayega
    const profileLine = userUsername
      ? `👤 <b>By:</b> ${escapeHtml(userNameRaw)} (@${escapeHtml(userUsername)})\n🔗 <b>Profile:</b> https://bandwar.vercel.app/contributors/${escapeHtml(userUsername)}`
      : `👤 <b>By:</b> ${escapeHtml(userNameRaw)}`;

    const diffLine = intent === "edit" && field
      ? `\n\n📝 <b>${escapeHtml(field)}:</b>\n❌ Old: ${escapeHtml(oldValue.slice(0, 200))}\n✅ New: ${escapeHtml(newValue.slice(0, 200))}`
      : pendingImageUrl ? `\n\n🖼️ New image uploaded` : "";

    const tgMsg = `🔔 <b>New ${escapeHtml(type.toUpperCase())}</b>\n\n${profileLine}\n🎯 <b>Target:</b> <code>${escapeHtml(contextId)}</code>\n📂 <b>Type:</b> ${escapeHtml(targetType)}${diffLine}\n\n👇 <b>Review:</b> https://bandwar.vercel.app/admin/dashboard`;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: tgMsg, parse_mode: "HTML", disable_web_page_preview: true }),
    });

    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500, headers: NO_STORE });
  }
}