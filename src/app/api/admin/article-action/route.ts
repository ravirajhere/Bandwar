import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!(await isValidSession(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  let body: { articleId?: unknown; action?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE });
  }

  const articleId = typeof body.articleId === "string" ? body.articleId.trim() : "";
  const action = body.action;
  if (!articleId || (action !== "publish" && action !== "unpublish" && action !== "delete")) {
    return NextResponse.json({ error: "Invalid articleId / action" }, { status: 400, headers: NO_STORE });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  if (!token || !owner || !repo) {
    return NextResponse.json({ error: "Server config error" }, { status: 500, headers: NO_STORE });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const base = `https://api.github.com/repos/${owner}/${repo}/contents`;

  try {
    // 1. data/articles/ ki list lo
    const listRes = await fetch(`${base}/data/articles`, { headers, cache: "no-store" });
    if (!listRes.ok) {
      return NextResponse.json({ error: "Articles folder not found" }, { status: 404, headers: NO_STORE });
    }
    const files = await listRes.json();
    const jsonFiles = (Array.isArray(files) ? files : []).filter(
      (f: any) => f.type === "file" && f.name.endsWith(".json")
    );
    if (jsonFiles.length === 0) {
      return NextResponse.json({ error: "No article files found" }, { status: 404, headers: NO_STORE });
    }

    // 2. Wo file dhoondo jisme ye articleId hai
    let targetFile: any = null;
    let targetData: any = null;
    let targetSha = "";
    let targetPath = "";

    for (const f of jsonFiles) {
      const fileRes = await fetch(`${base}/data/articles/${f.name}`, { headers, cache: "no-store" });
      if (!fileRes.ok) continue;
      const fileData = await fileRes.json();
      let parsed: any;
      try {
        parsed = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
      } catch { continue; }

      // Dono format support: { id, ... } ya { articles: [...] } ya { article: {...} }
      const candidate = parsed?.id === articleId
        ? parsed
        : Array.isArray(parsed?.articles)
          ? parsed.articles.find((a: any) => a?.id === articleId)
          : parsed?.article?.id === articleId
            ? parsed.article
            : null;

      if (candidate) {
        targetFile = f;
        targetData = parsed;
        targetSha = fileData.sha;
        targetPath = f.path;
        break;
      }
    }

    if (!targetFile) {
      return NextResponse.json({ error: "Article not found" }, { status: 404, headers: NO_STORE });
    }

    // 3. Action lagao
    const now = new Date().toISOString();

    if (action === "delete") {
      const isSingleFile = targetData?.id === articleId || targetData?.article?.id === articleId;
      if (isSingleFile) {
        // Single-article file hai toh poori file delete karo
        const delRes = await fetch(`${base}/${targetPath}`, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ message: `Admin: delete article ${articleId}`, sha: targetSha }),
        });
        if (!delRes.ok) throw new Error(`Delete failed: ${delRes.status}`);
      } else {
        // Multi-article file hai toh sirf us ek ko nikalo
        const newArticles = targetData.articles.filter((a: any) => a.id !== articleId);
        const newContent = { ...targetData, articles: newArticles };
        const putRes = await fetch(`${base}/${targetPath}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            message: `Admin: delete article ${articleId}`,
            content: Buffer.from(JSON.stringify(newContent, null, 2)).toString("base64"),
            sha: targetSha,
          }),
        });
        if (!putRes.ok) throw new Error(`PUT failed: ${putRes.status}`);
      }
    } else {
      // publish / unpublish
      const newStatus = action === "publish" ? "published" : "draft";
      let newContent: any;

      if (targetData?.id === articleId) {
        newContent = { ...targetData, status: newStatus, dateModified: now, lastUpdated: now };
      } else if (targetData?.article?.id === articleId) {
        newContent = { ...targetData, article: { ...targetData.article, status: newStatus, dateModified: now, lastUpdated: now } };
      } else if (Array.isArray(targetData?.articles)) {
        newContent = {
          ...targetData,
          articles: targetData.articles.map((a: any) =>
            a.id === articleId ? { ...a, status: newStatus, dateModified: now, lastUpdated: now } : a
          ),
        };
      } else {
        return NextResponse.json({ error: "Unknown article file format" }, { status: 500, headers: NO_STORE });
      }

      const putRes = await fetch(`${base}/${targetPath}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `Admin: ${action} article ${articleId}`,
          content: Buffer.from(JSON.stringify(newContent, null, 2)).toString("base64"),
          sha: targetSha,
        }),
      });
      if (!putRes.ok) throw new Error(`PUT failed: ${putRes.status}`);
    }

    // 4. Audit Log — data/audit.json me append
    try {
      const auditUrl = `${base}/data/audit.json`;
      const aRes = await fetch(auditUrl, { headers, cache: "no-store" });
      let sha: string | undefined;
      let auditList: any[] = [];
      if (aRes.ok) {
        const ad = await aRes.json();
        sha = ad.sha;
        try { auditList = JSON.parse(Buffer.from(ad.content, "base64").toString("utf-8")); } catch { auditList = []; }
      }
      if (!Array.isArray(auditList)) auditList = [];
      auditList.push({
        id: `audit-${Date.now()}`,
        at: now,
        actor: "Admin",
        action: action.toUpperCase(),
        target: articleId,
        detail: `Article ${action} — file: ${targetPath}`,
      });
      await fetch(auditUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `chore: audit ${action} ${articleId}`,
          content: Buffer.from(JSON.stringify(auditList.slice(-500), null, 2)).toString("base64"),
          ...(sha ? { sha } : {}),
        }),
      });
    } catch (e) { console.error("[audit] failed", e); }

    return NextResponse.json({ success: true, file: targetPath }, { headers: NO_STORE });
  } catch (e: any) {
    console.error("[article-action]", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500, headers: NO_STORE });
  }
}