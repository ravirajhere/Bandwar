import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

async function deleteGithubFile(path: string): Promise<void> {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  try {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    const getRes = await fetch(url, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28" } });
    if (getRes.status === 404) return;
    if (!getRes.ok) throw new Error(`Fetch failed: ${getRes.status}`);
    const fileData = await getRes.json();
    const deleteRes = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: JSON.stringify({ message: `chore: delete rejected image ${path}`, sha: fileData.sha }),
    });
    if (!deleteRes.ok) console.error(`[action] Delete failed: ${deleteRes.status}`);
  } catch (error) { console.error(`[action] Exception during delete: ${path}`, error); }
}

// NEW: Audit Log — data/audit.json me append karo
// Iske bina Approve / Reject Audit Log me nahi dikhega
async function appendAudit(entry: { action: string; target: string; detail: string }) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  if (!githubToken || !repoOwner || !repoName) return;
  try {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/audit.json`;
    const headers = { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28" };
    let sha: string | undefined;
    let list: any[] = [];
    const getRes = await fetch(url, { headers, cache: "no-store" });
    if (getRes.ok) {
      const d = await getRes.json();
      sha = d.sha;
      try { list = JSON.parse(Buffer.from(d.content, "base64").toString("utf-8")); } catch { list = []; }
    }
    if (!Array.isArray(list)) list = [];
    list.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: new Date().toISOString(),
      actor: "Admin",
      ...entry,
    });
    // Last 500 hi rakho — file badi nahi hogi
    const kept = list.slice(-500);
    await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `chore: audit ${entry.action} ${entry.target}`,
        content: Buffer.from(JSON.stringify(kept, null, 2)).toString("base64"),
        ...(sha ? { sha } : {}),
      }),
    });
  } catch (e) { console.error("[audit] failed", e); }
}

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }
  const githubToken = process.env.GITHUB_TOKEN;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  if (!githubToken || !repoOwner || !repoName) {
    return NextResponse.json({ error: "Server config error" }, { status: 500, headers: NO_STORE });
  }

  let body: { editId?: unknown; editIds?: unknown; action?: unknown; reason?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE }); }

  // BACKWARD COMPAT: purana {editId} bhi chalega, naya {editIds: []} bhi chalega
  const editIds: string[] = Array.isArray(body.editIds)
    ? body.editIds.filter((x): x is string => typeof x === "string").map(s => s.trim()).filter(Boolean).slice(0, 50)
    : typeof body.editId === "string" && body.editId.trim() ? [body.editId.trim()] : [];

  const action = body.action;
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 300) : "";

  if (editIds.length === 0) return NextResponse.json({ error: "Invalid editId" }, { status: 400, headers: NO_STORE });
  if (action !== "approve" && action !== "reject") return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: NO_STORE });

  const MAX_RETRIES = 3;
  let lastError = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/queue.json`;
      const queueRes = await fetch(queueUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
      if (!queueRes.ok) { lastError = `Fetch failed: ${queueRes.status}`; continue; }
      const queueData = await queueRes.json();
      const queueContent = JSON.parse(Buffer.from(queueData.content, "base64").toString("utf-8"));
      if (!Array.isArray(queueContent.pending)) queueContent.pending = [];
      if (!Array.isArray(queueContent.approved)) queueContent.approved = [];

      // Bulk: saare items ek hi PUT me move karo — 10 baar GitHub hit nahi hoga
      const moved: any[] = [];
      const remainingPending: any[] = [];
      for (const item of queueContent.pending) {
        if (editIds.includes(item.id)) moved.push(item);
        else remainingPending.push(item);
      }
      if (moved.length === 0) return NextResponse.json({ error: "Item not found" }, { status: 404, headers: NO_STORE });

      queueContent.pending = remainingPending;
      if (action === "approve") {
        for (const item of moved) queueContent.approved.push({ ...item, approvedVia: "Dashboard", approvedAt: new Date().toISOString() });
      } else {
        // Reject reason save karo taaki baad me pata chale kyu reject hua
        for (const item of moved) item.rejectedReason = reason || "Rejected via Dashboard";
      }

      const putRes = await fetch(queueUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28" },
        body: JSON.stringify({
          message: `Dashboard: ${action} ${moved.length} item(s) — ${editIds.join(",").slice(0, 100)}`,
          content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString("base64"),
          sha: queueData.sha,
        }),
      });
      if (!putRes.ok) {
        if (putRes.status === 409 || putRes.status === 422) { await new Promise((r) => setTimeout(r, 300 * (attempt + 1))); continue; }
        throw new Error(`PUT failed: ${putRes.status}`);
      }

      // Post-update side effects — Bulk me bhi same
      for (const item of moved) {
        if (action === "reject" && typeof item.pendingImageUrl === "string") await deleteGithubFile(`public${item.pendingImageUrl}`);
        if (item.telegramMessageId && item.chatId && botToken) {
          try {
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: item.chatId, message_id: item.telegramMessageId, reply_markup: { inline_keyboard: [[{ text: action === "approve" ? "✅ Staged via Dashboard" : "❌ Rejected via Dashboard", callback_data: "done" }]] } }),
            });
          } catch (tgErr) { console.warn(`[action] Telegram fail:`, tgErr); }
        }
      }

      // NEW: Audit — har approve / reject ab log hoga
      for (const item of moved) {
        await appendAudit({
          action: action === "approve" ? "STAGED" : "REJECTED",
          target: item.contextId || item.id,
          detail: `${item.type || ""} • ${item.field || "Image"} • ${reason || ""}`.trim(),
        });
      }

      return NextResponse.json({ success: true, processed: moved.length }, { headers: NO_STORE });
    } catch (error: any) {
      lastError = error.message || "Unknown error";
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return NextResponse.json({ error: "Action failed after retries", detail: lastError }, { status: 500, headers: NO_STORE });
}