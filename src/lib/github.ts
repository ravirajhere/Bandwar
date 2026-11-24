// lib/github.ts — V2 — Single source for ALL GitHub operations
// Delete = Permanent, Trash / History = Nahi hai

const GH_API = "https://api.github.com";

function env() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  if (!token || !owner || !repo) throw new Error("Server config error");
  return { token, owner, repo };
}

function headers(token: string, extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  };
}

export function ghUrl(path: string) {
  const { owner, repo } = env();
  return `${GH_API}/repos/${owner}/${repo}/contents/${path}`;
}

export async function ghFetch(url: string, init?: RequestInit) {
  const { token } = env();
  return fetch(url, { ...init, headers: { ...headers(token), ...(init?.headers || {}) } });
}

// READ — JSON + sha
export async function ghReadJson<T = any>(path: string): Promise<{ data: T; sha: string | null; exists: boolean; raw?: any }> {
  const { owner, repo } = env();
  const res = await ghFetch(`${GH_API}/repos/${owner}/${repo}/contents/${path}`, { cache: "no-store" });
  if (res.status === 404) return { data: null as any, sha: null, exists: false };
  if (!res.ok) throw new Error(`Fetch failed: ${path} — ${res.status}`);
  const json = await res.json();
  const data = JSON.parse(Buffer.from(json.content, "base64").toString("utf-8"));
  return { data, sha: json.sha, exists: true, raw: json };
}

// LIST — folder me kaunsi files hai
export async function ghListDir(path: string) {
  const { owner, repo } = env();
  const res = await ghFetch(`${GH_API}/repos/${owner}/${repo}/contents/${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`List failed: ${path} — ${res.status}`);
  return await res.json();
}

// WRITE — single file
export async function ghWriteJson(path: string, data: unknown, message: string, sha?: string | null) {
  const { owner, repo } = env();
  const res = await ghFetch(`${GH_API}/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new Error(`PUT failed: ${path} — ${res.status}`);
  return res.json();
}

// DELETE FILE — PERMANENT, koi Trash nahi
export async function ghDeleteFile(path: string): Promise<boolean> {
  const { owner, repo } = env();
  const res = await ghFetch(`${GH_API}/repos/${owner}/${repo}/contents/${path}`);
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`Fetch failed: ${path} — ${res.status}`);
  const json = await res.json();
  const del = await ghFetch(`${GH_API}/repos/${owner}/${repo}/contents/${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `chore: delete ${path}`, sha: json.sha }),
  });
  if (!del.ok) throw new Error(`Delete failed: ${path} — ${del.status}`);
  return true;
}

// COMMIT MULTIPLE FILES — Ek hi commit me saare file + image + delete
// Yehi Publish use karta hai, aur aage People / Gallery bhi yahi use karenge
export async function ghCommitMultiple(
  files: { path: string; content: string; encoding?: "utf-8" | "base64"; delete?: boolean }[],
  message: string,
  branch = "main"
) {
  const { owner, repo } = env();
  const refRes = await ghFetch(`${GH_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  if (!refRes.ok) throw new Error(`Fetch ref failed: ${refRes.status}`);
  const ref = await refRes.json();

  const commitRes = await ghFetch(`${GH_API}/repos/${owner}/${repo}/git/commits/${ref.object.sha}`);
  if (!commitRes.ok) throw new Error(`Fetch commit failed: ${commitRes.status}`);
  const commit = await commitRes.json();

  const treeEntries = await Promise.all(files.map(async (f) => {
    if (f.delete) return { path: f.path, mode: "100644", type: "blob", sha: null };
    const blobRes = await ghFetch(`${GH_API}/repos/${owner}/${repo}/git/blobs`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: f.content, encoding: f.encoding || "utf-8" }),
    });
    if (!blobRes.ok) throw new Error(`Blob failed: ${f.path}`);
    const blob = await blobRes.json();
    return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const treeRes = await ghFetch(`${GH_API}/repos/${owner}/${repo}/git/trees`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: treeEntries }),
  });
  if (!treeRes.ok) throw new Error(`Tree failed: ${treeRes.status}`);
  const newTree = await treeRes.json();

  const newCommitRes = await ghFetch(`${GH_API}/repos/${owner}/${repo}/git/commits`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  if (!newCommitRes.ok) throw new Error(`Commit failed: ${newCommitRes.status}`);
  const newCommit = await newCommitRes.json();

  const updateRes = await ghFetch(`${GH_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  if (!updateRes.ok) throw new Error(`Ref update failed: ${updateRes.status}`);
  return newCommit;
}

// AUDIT — sirf log, history nahi. Last 500 hi.
export async function ghAudit(entry: { action: string; target: string; detail: string }) {
  try {
    const { data, sha, exists } = await ghReadJson<any[]>("data/audit.json");
    const list = exists && Array.isArray(data) ? data : [];
    list.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: new Date().toISOString(),
      actor: "Admin",
      ...entry,
    });
    await ghWriteJson("data/audit.json", list.slice(-500), `chore: audit ${entry.action} ${entry.target}`, sha);
  } catch (e) { console.error("[audit] failed", e); }
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let last: any;
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (e: any) {
      last = e;
      if (String(e?.message || "").includes("409") || String(e?.message || "").includes("422")) {
        await new Promise(r => setTimeout(r, 300 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw last;
}