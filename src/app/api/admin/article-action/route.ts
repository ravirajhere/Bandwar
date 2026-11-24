import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson, ghWriteJson, ghAudit, ghDeleteFile, withRetry } from "@/lib/github";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE }); }

  const articleId = typeof body.articleId === "string" ? body.articleId.trim() : "";
  const action = body.action;
  if (!articleId || !["publish", "unpublish", "delete"].includes(action)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400, headers: NO_STORE });
  }

  try {
    const result = await withRetry(async () => {
      // Article kis file me hai, dhoondho
      const articlesDir = "data/articles";
      // List karne ke liye GitHub API se dir read karna padega — iske liye ghReadJson kaam nahi karega,
      // isiliye yaha direct fetch use kar rahe hai — baaki sab gh* se hi hoga
      const token = process.env.GITHUB_TOKEN!;
      const owner = process.env.GITHUB_REPO_OWNER!;
      const repo = process.env.GITHUB_REPO_NAME!;
      const listRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${articlesDir}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store",
      });
      if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
      const files = await listRes.json();

      for (const file of files) {
        if (!file.name.endsWith(".json")) continue;
        const path = `${articlesDir}/${file.name}`;
        const { data, sha } = await ghReadJson<any>(path);
        if (!data?.articles) continue;
        const idx = data.articles.findIndex((a: any) => a.id === articleId);
        if (idx === -1) continue;

        const article = data.articles[idx];
        if (action === "publish") {
          article.status = "published";
          article.datePublished = article.datePublished || new Date().toISOString();
          article.dateModified = new Date().toISOString();
        } else if (action === "unpublish") {
          article.status = "draft";
          article.dateModified = new Date().toISOString();
        } else if (action === "delete") {
          // PERMANENT DELETE — koi Trash / History nahi
          data.articles.splice(idx, 1);
        }

        await ghWriteJson(path, data, `Admin: ${action} ${articleId}`, sha);
        return { found: true, title: article.title || articleId };
      }
      return { found: false, title: "" };
    });

    if (!result.found) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });

    // Audit — sirf log
    await ghAudit({
      action: action === "publish" ? "PUBLISHED" : action === "unpublish" ? "UNPUBLISHED" : "DELETED",
      target: articleId,
      detail: result.title,
    });

    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500, headers: NO_STORE });
  }
}