import { NextRequest, NextResponse } from "next/server";
import { getArticleById, getContributorsData } from "@/lib/data";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

// ─────────────────────────────────────────────
// CONFIG — Tune these for your use case
// ─────────────────────────────────────────────
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;              // 5 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
];
const ALLOWED_MAGIC_BYTES: Record<string, string> = {
  "image/jpeg": "ffd8ff",
  "image/png": "89504e47",
  "image/webp": "52494646",
  "image/gif": "47494638",
  "image/avif": "66747970",
};

const MAX_FIELD_LENGTH = 5000;                       // per text field
const MAX_FIELDS = 20;                               // total fields in jsonObj
const MAX_TOTAL_PAYLOAD = 20 * 1024 * 1024;          // 20 MB total

// Rate limit — in-memory (per-instance). Basic but better than nothing.
// Note: Vercel scales instances horizontally → not foolproof.
// For production: use @upstash/ratelimit (adds Redis dependency).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;         // 1 hour
const RATE_LIMIT_MAX = 10;                           // 10 submissions/IP/hour

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    // Cleanup old entries periodically (simple)
    if (rateLimitMap.size > 1000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

// ─────────────────────────────────────────────
// Sanitizers
// ─────────────────────────────────────────────
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeId(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

// ─────────────────────────────────────────────
// Image validation — checks size, MIME, magic bytes
// ─────────────────────────────────────────────
async function validateImage(file: File): Promise<string | null> {
  if (file.size === 0) return "Image is empty";
  if (file.size > MAX_IMAGE_SIZE) {
    return `Image too large (max ${MAX_IMAGE_SIZE / 1024 / 1024} MB)`;
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Unsupported image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`;
  }

  // Verify magic bytes (client can lie about MIME type)
  const buf = Buffer.from(await file.slice(0, 16).arrayBuffer());
  const hex = buf.toString("hex").toLowerCase();
  const expectedMagic = ALLOWED_MAGIC_BYTES[file.type];
  if (expectedMagic && !hex.startsWith(expectedMagic)) {
    return "Image content does not match declared type";
  }

  return null;
}

// ─────────────────────────────────────────────
// GitHub helpers with error handling
// ─────────────────────────────────────────────
function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function uploadPendingImage(
  file: File,
  editId: string
): Promise<{ url: string } | { error: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const ext = file.type === "image/png" ? "png"
      : file.type === "image/webp" ? "webp"
      : file.type === "image/gif" ? "gif"
      : file.type === "image/avif" ? "avif"
      : "jpg";

    const fileName = `${editId}.${ext}`;
    const imagePath = `public/images/pending/${fileName}`;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`;

    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: { ...ghHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ message: `chore: pending image ${editId}`, content: base64 }),
    });

    if (!res.ok) {
      console.error(`[submit] Image upload failed (${res.status})`);
      return { error: "Image upload failed" };
    }
    return { url: `/images/pending/${fileName}` };
  } catch (err) {
    console.error("[submit] Image upload exception:", err);
    return { error: "Image upload failed" };
  }
}

async function saveToQueue(item: any, retries = 3): Promise<boolean> {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const filePath = "data/queue.json";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const fileRes = await fetch(apiUrl, {
        headers: ghHeaders(),
        cache: "no-store",
      });

      let fileData = null;
      let queueContent: { pending: any[]; approved: any[] } = { pending: [], approved: [] };

      if (fileRes.ok) {
        fileData = await fileRes.json();
        queueContent = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
        if (!Array.isArray(queueContent.pending)) queueContent.pending = [];
        if (!Array.isArray(queueContent.approved)) queueContent.approved = [];
      } else if (fileRes.status === 404) {
        // File doesn't exist — first submission, OK to create
        fileData = null;
        queueContent = { pending: [], approved: [] };
      } else {
        // Real error — DO NOT overwrite queue with empty
        console.error(`[submit] Queue fetch failed (${fileRes.status})`);
        continue;
      }

      queueContent.pending.push(item);

      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: { ...ghHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `New submission: ${item.id}`,
          content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString("base64"),
          ...(fileData?.sha && { sha: fileData.sha }),
        }),
      });

      if (putRes.ok) return true;

      if (putRes.status === 409 || putRes.status === 422) {
        // SHA race — retry
        console.warn(`[submit] Queue SHA conflict on attempt ${attempt + 1}, retrying...`);
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }

      console.error(`[submit] Queue PUT failed (${putRes.status})`);
      return false;
    } catch (err) {
      console.error(`[submit] Queue save exception (attempt ${attempt + 1}):`, err);
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return false;
}

// ─────────────────────────────────────────────
// Telegram notify (best-effort, escaped)
// ─────────────────────────────────────────────
async function notifyTelegram(
  message: string,
  imageFile: File | null
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  try {
    if (imageFile && imageFile.size > 0 && imageFile.size <= MAX_IMAGE_SIZE) {
      const fd = new FormData();
      fd.append("chat_id", chatId);
      fd.append("caption", message.slice(0, 1024)); // Telegram caption limit
      fd.append("parse_mode", "HTML");
      fd.append("photo", imageFile, imageFile.name.slice(0, 100));
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: fd,
      });
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message.slice(0, 4096),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
    }
  } catch (err) {
    console.error("[submit] Telegram notify failed:", err);
    // Non-fatal — queue save already succeeded
  }
}

// ─────────────────────────────────────────────
// POST /api/telegram-submit
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 🔒 Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": String(rl.retryAfter || 3600) },
      }
    );
  }

  // 🔒 Env check
  const requiredEnv = ["GITHUB_TOKEN", "GITHUB_REPO_OWNER", "GITHUB_REPO_NAME"];
  const missing = requiredEnv.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`[submit] Missing env vars: ${missing.join(", ")}`);
    return NextResponse.json({ error: "Server configuration error" }, { status: 500, headers: NO_STORE });
  }

  try {
    const formData = await req.formData();

    // 🔒 Payload size guard
    let totalSize = 0;
    for (const [, value] of formData.entries()) {
      if (value instanceof File) totalSize += value.size;
      else totalSize += String(value).length;
    }
    if (totalSize > MAX_TOTAL_PAYLOAD) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413, headers: NO_STORE }
      );
    }

    // ────── Extract & validate ──────
    const typeRaw = formData.get("type");
    const type = typeof typeRaw === "string" ? typeRaw.slice(0, 100) : "";

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400, headers: NO_STORE });
    }

    const contextIdRaw = String(formData.get("contextId") || "unknown").slice(0, 100);
    const contextId = sanitizeId(contextIdRaw) || "unknown";

    const userNameRaw = String(formData.get("submitterName") || "").slice(0, 100).trim();
    const userName = userNameRaw || "Anonymous Visitor";

    const userUsernameRaw = String(formData.get("submitterUsername") || "").slice(0, 50).trim();
    // 🔒 Validate username against contributors list (if provided)
    let userUsername = "";
    if (userUsernameRaw) {
      try {
        const contributors = (getContributorsData?.() as any)?.contributors || [];
        const validUser = contributors.find((c: any) => c.username === userUsernameRaw);
        if (validUser) userUsername = userUsernameRaw;
        // If invalid — silently drop (don't let attacker impersonate)
      } catch {
        // Contributor data unavailable — drop username to be safe
      }
    }

    const customCategoryRaw = String(formData.get("customCategory") || "").slice(0, 50).trim();
    const customCategory = customCategoryRaw ? sanitizeId(customCategoryRaw) : "";

    const targetTypeRaw = String(formData.get("targetType") || "article").slice(0, 20);
    const targetType = ["article", "person", "directory", "image", "landmark"].includes(targetTypeRaw)
      ? targetTypeRaw
      : "article";

    const fieldRaw = String(formData.get("field") || "").slice(0, 100);
    const field = fieldRaw.trim();

    const currentValue = String(formData.get("currentValue") || "").slice(0, MAX_FIELD_LENGTH);
    const suggestedValue = String(formData.get("suggestedValue") || "").slice(0, MAX_FIELD_LENGTH);
    const currentImagePath = String(formData.get("currentImagePath") || "Unknown").slice(0, 200);

    const imageFile = formData.get("image") as File | null;

    // 🔒 Image validation (BEFORE upload)
    if (imageFile && imageFile.size > 0) {
      const imgError = await validateImage(imageFile);
      if (imgError) {
        return NextResponse.json({ error: imgError }, { status: 400, headers: NO_STORE });
      }
    }

    // ────── Collision-proof editId ──────
    const editId = `edit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // ────── Image upload ──────
    let pendingImageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const result = await uploadPendingImage(imageFile, editId);
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 500, headers: NO_STORE });
      }
      pendingImageUrl = result.url;
    }

    // ────── Build jsonObj (bounded) ──────
    const RESERVED_KEYS = new Set([
      "type", "image", "targetType", "submitterName", "submitterUsername",
      "customCategory", "field", "currentValue", "suggestedValue", "currentImagePath",
    ]);
    const jsonObj: Record<string, string> = {};
    let fieldCount = 0;
    for (const [key, value] of formData.entries()) {
      if (RESERVED_KEYS.has(key)) continue;
      if (typeof value !== "string") continue;
      if (value.trim() === "") continue;
      if (fieldCount >= MAX_FIELDS) break;
      const safeKey = key.slice(0, 50);
      jsonObj[safeKey] = value.slice(0, MAX_FIELD_LENGTH);
      fieldCount++;
    }

    // ────── Intent detection ──────
    let intent = "add";
    if (type === "Image Update Suggestion" || (type.includes("Image") && pendingImageUrl && currentImagePath !== "Unknown")) {
      intent = "image_update";
    } else if (field && suggestedValue) {
      intent = "edit";
    }

    // ────── File path resolution (whitelist-based) ──────
    const VALID_CATEGORY_REGEX = /^[a-z][a-z0-9-]*$/;
    let filePath = "data/master.json";

    if (type.includes("Directory") || targetType === "directory") {
      filePath = "data/directory.json";
    } else if (type.includes("Person") || targetType === "person") {
      filePath = "data/people.json";
    } else if (type.includes("Map Location") || type.includes("Landmark") || targetType === "landmark") {
      filePath = "data/media.json";
    } else if (type.includes("Article") || targetType === "article") {
      if (intent === "add") {
        const catRaw = String(formData.get("Category") || "general").slice(0, 50);
        const cat = sanitizeId(catRaw);
        if (!VALID_CATEGORY_REGEX.test(cat)) {
          return NextResponse.json(
            { error: "Invalid category" },
            { status: 400, headers: NO_STORE }
          );
        }
        filePath = `data/articles/${cat}.json`;
      } else {
        const existingArticle = getArticleById(contextId);
        if (existingArticle && existingArticle.categories?.length > 0) {
          const cat = sanitizeId(existingArticle.categories[0]);
          if (VALID_CATEGORY_REGEX.test(cat)) {
            filePath = `data/articles/${cat}.json`;
          }
        }
        if (filePath === "data/master.json") {
          filePath = "data/articles/landmarks.json";
        }
      }
    } else if (type.includes("Gallery") || targetType === "image") {
      filePath = "data/media.json";
    }

    // ────── Save to queue ──────
    const queueItem = {
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
      field,
      oldValue: currentValue,
      newValue: suggestedValue,
      currentImagePath,
      jsonObj,
    };

    const saved = await saveToQueue(queueItem);
    if (!saved) {
      return NextResponse.json(
        { error: "Failed to save submission. Please retry." },
        { status: 500, headers: NO_STORE }
      );
    }

    // ────── Telegram notify (escaped, best-effort) ──────
    const safeUser = escapeHtml(userUsername ? `${userName} (${userUsername})` : userName);
    const safeContext = escapeHtml(contextId);
    const safeType = escapeHtml(type);
    const safeField = escapeHtml(field);
    const safeCustomCategory = escapeHtml(customCategory);

    let message = `🔔 <b>New ${safeType.toUpperCase()}</b>\n\n`;
    if (safeCustomCategory) message += `🏷️ <b>New Category:</b> ${safeCustomCategory}\n`;
    message += `👤 <b>By:</b> ${safeUser}\n`;
    message += `🎯 <b>Target:</b> <code>${safeContext}</code>\n`;

    if (intent === "edit") {
      message += `⚙️ <b>Action:</b> Edit Field (<code>${safeField}</code>)\n`;
    } else if (intent === "image_update") {
      message += `⚙️ <b>Action:</b> Update Image\n`;
    } else {
      message += `⚙️ <b>Action:</b> Add New\n`;
    }

    message += `👇 <b>Review:</b> https://bandwar.vercel.app/admin/dashboard`;

    await notifyTelegram(message, imageFile);

    return NextResponse.json(
      { success: true, editId },
      { headers: NO_STORE }
    );
  } catch (err: any) {
    console.error("[submit] Fatal error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: NO_STORE }
    );
  }
}