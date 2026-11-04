import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";

export const runtime = "nodejs";  // Buffer needs Node.js

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

// ─────────────────────────────────────────────
// Helper: safe GitHub file delete (with logging)
// ─────────────────────────────────────────────
async function deleteGithubFile(path: string): Promise<void> {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    
    const getRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (getRes.status === 404) {
      console.warn(`[action] File not found for delete: ${path}`);
      return;
    }
    if (!getRes.ok) {
      console.error(`[action] Failed to fetch file for delete: ${path}`, getRes.status);
      return;
    }

    const fileData = await getRes.json();
    if (!fileData.sha) {
      console.error(`[action] No SHA returned for delete: ${path}`);
      return;
    }

    const deleteRes = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: `chore: delete rejected image ${path}`,
        sha: fileData.sha,
      }),
    });

    if (!deleteRes.ok) {
      console.error(`[action] Delete failed: ${path}`, deleteRes.status);
    }
  } catch (error) {
    console.error(`[action] Exception during delete: ${path}`, error);
  }
}

// ─────────────────────────────────────────────
// Helper: retry wrapper for GitHub PUT (handles SHA race)
// ─────────────────────────────────────────────
async function updateQueueFile(
  content: object,
  sha: string,
  message: string
): Promise<{ ok: boolean; newSha?: string; status?: number }> {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/queue.json`;

  const res = await fetch(queueUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
      sha,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return { ok: true, newSha: data.content?.sha };
  }
  return { ok: false, status: res.status };
}

// ─────────────────────────────────────────────
// POST /api/admin/action
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 🔐 STEP 1: Auth check
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: NO_STORE }
    );
  }

  // 🔐 STEP 2: Env vars present?
  const githubToken = process.env.GITHUB_TOKEN;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!githubToken || !repoOwner || !repoName) {
    console.error("[action] Missing GitHub env vars");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500, headers: NO_STORE }
    );
  }

  // 🔐 STEP 3: Input validation
  let body: { editId?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: NO_STORE }
    );
  }

  const editId = typeof body.editId === "string" ? body.editId.trim() : "";
  const action = body.action;

  if (!editId || editId.length > 100) {
    return NextResponse.json(
      { error: "Invalid editId" },
      { status: 400, headers: NO_STORE }
    );
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400, headers: NO_STORE }
    );
  }

  // 🔐 STEP 4: Execute with retry (max 3 attempts for SHA race)
  const MAX_RETRIES = 3;
  let lastError = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const queuePath = "data/queue.json";
      const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${queuePath}`;

      // Fetch current queue
      const queueRes = await fetch(queueUrl, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      });

      if (!queueRes.ok) {
        lastError = `Queue fetch failed: ${queueRes.status}`;
        console.error(`[action] ${lastError} (attempt ${attempt + 1})`);
        if (queueRes.status === 404) {
          return NextResponse.json(
            { error: "Queue file not found" },
            { status: 500, headers: NO_STORE }
          );
        }
        continue;
      }

      const queueData = await queueRes.json();
      const queueContent = JSON.parse(
        Buffer.from(queueData.content, "base64").toString("utf-8")
      );

      if (!Array.isArray(queueContent.pending)) queueContent.pending = [];
      if (!Array.isArray(queueContent.approved)) queueContent.approved = [];

      // Find item
      const itemIndex = queueContent.pending.findIndex(
        (i: any) => i.id === editId
      );
      
      if (itemIndex === -1) {
        return NextResponse.json(
          { error: "Item not found in pending queue" },
          { status: 404, headers: NO_STORE }
        );
      }

      const item = queueContent.pending[itemIndex];

      // 🔐 STEP 5: Only delete image AFTER successful approve/reject
      // (delete after PUT to avoid orphaned references if PUT fails)
      const shouldDeleteImage =
        action === "reject" && typeof item.pendingImageUrl === "string";

      // Remove from pending
      queueContent.pending.splice(itemIndex, 1);

      // Add to approved if approving
      if (action === "approve") {
        queueContent.approved.push({ ...item, approvedVia: "Dashboard" });
      }

      // Attempt queue update
      const update = await updateQueueFile(
        queueContent,
        queueData.sha,
        `Dashboard: ${action} ${editId}`
      );

      if (!update.ok) {
        if (update.status === 409 || update.status === 422) {
          // SHA conflict — retry
          console.warn(
            `[action] SHA conflict on attempt ${attempt + 1}, retrying...`
          );
          lastError = `SHA conflict (${update.status})`;
          // Small backoff before retry
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }
        lastError = `GitHub PUT failed: ${update.status}`;
        console.error(`[action] ${lastError}`);
        return NextResponse.json(
          { error: "Failed to update queue" },
          { status: 500, headers: NO_STORE }
        );
      }

      // ✅ Queue updated. Now do post-update side effects.
      
      // Image cleanup (only after successful PUT)
      if (shouldDeleteImage) {
        const filePathToDelete = `public${item.pendingImageUrl}`;
        await deleteGithubFile(filePathToDelete); // logs its own errors
      }

      // Telegram sync (best-effort, doesn't fail the request)
      if (item.telegramMessageId && item.chatId && botToken) {
        try {
          const tgRes = await fetch(
            `https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: item.chatId,
                message_id: item.telegramMessageId,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text:
                          action === "approve"
                            ? "✅ Staged via Dashboard"
                            : "❌ Rejected via Dashboard",
                        callback_data: "done",
                      },
                    ],
                  ],
                },
              }),
            }
          );
          if (!tgRes.ok) {
            console.warn(
              `[action] Telegram update failed: ${tgRes.status}`
            );
          }
        } catch (tgErr) {
          console.warn(`[action] Telegram exception:`, tgErr);
          // Do NOT fail the request — queue already updated
        }
      }

      return NextResponse.json(
        { success: true, action, editId },
        { headers: NO_STORE }
      );
    } catch (error: any) {
      lastError = error?.message || "Unknown error";
      console.error(
        `[action] Exception on attempt ${attempt + 1}:`,
        error
      );
      // Retry on unexpected exceptions
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }

  // All retries exhausted
  console.error(`[action] Failed after ${MAX_RETRIES} attempts: ${lastError}`);
  return NextResponse.json(
    { error: "Action failed after retries", detail: lastError },
    { status: 500, headers: NO_STORE }
  );
}