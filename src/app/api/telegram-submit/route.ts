import { NextRequest, NextResponse } from "next/server";
import { getArticleById, getContributors } from "@/lib/data";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

// Basic Rate Limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return true;
  }
  if (entry.count >= 10) return false; // 10 requests per hour
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
    const contextIdRaw = String(formData.get("contextId") || "unknown").slice(0, 100);
    const contextId = contextIdRaw.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    
    const userNameRaw = String(formData.get("submitterName") || "").slice(0, 100).trim() || "Anonymous";
    const userUsernameRaw = String(formData.get("submitterUsername") || "").slice(0, 50).trim();
    
    let userUsername = "";
    if (userUsernameRaw) {
      const validUser = getContributors().find(c => normalizeUsername(c.username) === normalizeUsername(userUsernameRaw));
      if (validUser) userUsername = userUsernameRaw;
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

    // Save to Queue
    const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/queue.json`;
    const queueRes = await fetch(queueUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } });
    
    let fileData = null;
    // 🚀 TYPESCRIPT FIX: Explicitly defining pending and approved as any[]
    let queueContent: { pending: any[], approved: any[] } = { pending: [], approved: [] };
    
    if (queueRes.ok) { 
      fileData = await queueRes.json(); 
      queueContent = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8")); 
      if (!Array.isArray(queueContent.pending)) queueContent.pending = [];
      if (!Array.isArray(queueContent.approved)) queueContent.approved = [];
    }
    
    const queueItem = { id: `edit_${Date.now()}`, type, contextId, userName: userNameRaw, userUsername, timestamp: new Date().toISOString(), pendingImageUrl, intent: "add" };
    queueContent.pending.push(queueItem);

    await fetch(queueUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
      body: JSON.stringify({ message: `New submission ${queueItem.id}`, content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString("base64"), ...(fileData && { sha: fileData.sha }) }),
    });

    // Telegram Notify
    const tgMsg = `🔔 <b>New ${escapeHtml(type.toUpperCase())}</b>\n\n👤 <b>By:</b> ${escapeHtml(userNameRaw)}\n🎯 <b>Target:</b> <code>${escapeHtml(contextId)}</code>\n👇 <b>Review:</b> https://bandwar.vercel.app/admin/dashboard`;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: tgMsg, parse_mode: "HTML", disable_web_page_preview: true }),
    });

    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500, headers: NO_STORE });
  }
}