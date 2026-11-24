import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ArticleSchema } from "@/lib/schema";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

async function ghFetch(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
}

async function fetchGithubFile(path: string) {
  const owner = process.env.GITHUB_REPO_OWNER, repo = process.env.GITHUB_REPO_NAME;
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchGithubFile(${path}) failed: ${res.status}`);
  return res.json();
}

// Yehi tera wala commitMultipleFiles hai — same logic
async function commitMultipleFiles(files: { path: string; content: string }[], message: string) {
  const owner = process.env.GITHUB_REPO_OWNER, repo = process.env.GITHUB_REPO_NAME, branch = "main";
  const refRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  const ref = await refRes.json();
  const commitRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${ref.object.sha}`);
  const commit = await commitRes.json();

  const treeEntries = await Promise.all(files.map(async (f) => {
    const blobRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
    });
    const blob = await blobRes.json();
    return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const treeRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: treeEntries }),
  });
  const newTree = await treeRes.json();
  const newCommitRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  const newCommit = await newCommitRes.json();
  await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: newCommit.sha }),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionCookie = req.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = ArticleSchema.safeParse({ ...body, id });
    if (!parsed.success) return NextResponse.json({ error: "Validation fail" }, { status: 400, headers: NO_STORE });

    // Tera wala hi path logic: categories[0].json
    const cat = parsed.data.categories[0] || "education";
    const targetPath = `data/articles/${cat}.json`;

    const file = await fetchGithubFile(targetPath);
    if (!file) return NextResponse.json({ error: `Missing file: ${targetPath}` }, { status: 500, headers: NO_STORE });

    const current = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
    current.articles = current.articles.map((a: any) => a.id === id ? parsed.data : a);

    await commitMultipleFiles(
      [{ path: targetPath, content: JSON.stringify(current, null, 2) }],
      `Admin: update ${id} - ${parsed.data.status}`
    );

    return NextResponse.json({ ok: true, status: parsed.data.status }, { headers: NO_STORE });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: NO_STORE });
  }
}