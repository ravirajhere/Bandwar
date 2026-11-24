import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { getArticleById } from "@/lib/data";
import { StewardshipEntry } from "@/lib/schema"; // 🚀 Imported Type

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

// ==========================================
// 1. GITHUB API HELPERS (Copied from publish/route.ts)
// ==========================================
async function ghFetch(url: string, init?: RequestInit) {
  const GITHUB_HEADERS = { 
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 
    Accept: "application/vnd.github.v3+json", 
    "X-GitHub-Api-Version": "2022-11-28" 
  };
  return fetch(url, { ...init, headers: { ...GITHUB_HEADERS, ...(init?.headers || {}) } });
}

async function fetchGithubFile(path: string) {
  const owner = process.env.GITHUB_REPO_OWNER, repo = process.env.GITHUB_REPO_NAME;
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchGithubFile(${path}) failed: ${res.status}`);
  return res.json();
}

async function commitMultipleFiles(files: { path: string; content: string; encoding?: "utf-8" | "base64"; delete?: boolean }[], message: string) {
  const owner = process.env.GITHUB_REPO_OWNER, repo = process.env.GITHUB_REPO_NAME, branch = "main";
  const refRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  if (!refRes.ok) throw new Error(`Fetch ref failed: ${refRes.status}`);
  const ref = await refRes.json();
  
  const commitRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${ref.object.sha}`);
  if (!commitRes.ok) throw new Error(`Fetch commit failed: ${commitRes.status}`);
  const commit = await commitRes.json();

  const treeEntries = await Promise.all(files.map(async (f) => {
    if (f.delete) return { path: f.path, mode: "100644", type: "blob", sha: null };
    const blobRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: f.content, encoding: f.encoding || "utf-8" }),
    });
    if (!blobRes.ok) throw new Error(`Blob failed: ${f.path}`);
    const blob = await blobRes.json();
    return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const treeRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base_tree: commit.tree.sha, tree: treeEntries }),
  });
  if (!treeRes.ok) throw new Error(`Tree failed: ${treeRes.status}`);
  const newTree = await treeRes.json();

  const newCommitRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  if (!newCommitRes.ok) throw new Error(`Commit failed: ${newCommitRes.status}`);
  const newCommit = await newCommitRes.json();

  const updateRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sha: newCommit.sha }),
  });
  if (!updateRes.ok) throw new Error(`Ref update failed: ${updateRes.status}`);
}

// ==========================================
// 2. POST HANDLER
// ==========================================
export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  try {
    const body = await request.json();
    const { articleId, tier, sourceId, method, notes, verifiedBy } = body;

    if (!articleId || !tier || !verifiedBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: NO_STORE });
    }

    // 1. Find which category file the article belongs to (using existing build data)
    const existingArticle = getArticleById(articleId);
    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404, headers: NO_STORE });
    }
    
    const category = existingArticle.categories?.[0] || "general";
    const targetPath = `data/articles/${category}.json`;

    // 2. Fetch the latest article file from GitHub
    const articleFile = await fetchGithubFile(targetPath);
    if (!articleFile) {
      return NextResponse.json({ error: "Article file not found on GitHub" }, { status: 404, headers: NO_STORE });
    }
    
    const articleContent = JSON.parse(Buffer.from(articleFile.content, "base64").toString("utf-8"));
    const articleIndex = articleContent.articles.findIndex((a: any) => a.id === articleId);
    
    if (articleIndex === -1) {
      return NextResponse.json({ error: "Article not found in GitHub file" }, { status: 404, headers: NO_STORE });
    }

    // 3. Update the article's confidence and provenance
    articleContent.articles[articleIndex].confidence = tier;
    articleContent.articles[articleIndex].provenance = {
      sourceId: sourceId || undefined,
      method: method || 'document',
      verifiedBy,
      verifiedAt: new Date().toISOString(),
      notes: notes || undefined
    };

    // 4. Fetch stewardship.json from GitHub
    const stewardshipFile = await fetchGithubFile("data/stewardship.json");
    
    // 🚀 FIX: Explicitly typed entries as StewardshipEntry[]
    let stewardshipContent: { version: string; entries: StewardshipEntry[] } = { version: "1.0", entries: [] };
    
    if (stewardshipFile) {
      stewardshipContent = JSON.parse(Buffer.from(stewardshipFile.content, "base64").toString("utf-8"));
    }

    // 5. Add log entry to stewardship
    // 🚀 FIX: Explicitly typed newEntry
    const newEntry: StewardshipEntry = {
      id: `stew-${crypto.randomUUID()}`,
      entityId: articleId,
      entityType: "article",
      action: "verified",
      tier: tier,
      role: "archivist", 
      actor: verifiedBy,
      method: method || 'document',
      notes: notes || "",
      timestamp: new Date().toISOString(),
      sourceIds: sourceId ? [sourceId] : []
    };

    stewardshipContent.entries.push(newEntry);

    // 6. Commit both files to GitHub in a single atomic commit
    const filesToCommit = [
      { path: targetPath, content: JSON.stringify(articleContent, null, 2) },
      { path: "data/stewardship.json", content: JSON.stringify(stewardshipContent, null, 2) }
    ];

    await commitMultipleFiles(filesToCommit, `Verify: ${articleId} as ${tier}`);

    return NextResponse.json({ success: true, message: "Article verified and committed to GitHub" }, { headers: NO_STORE });

  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500, headers: NO_STORE });
  }
}