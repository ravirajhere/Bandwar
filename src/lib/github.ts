// lib/github.ts — Single source for all GitHub file operations
// Iske bina har API me same GitHub code copy hota tha

const GH_API = "https://api.github.com";

function env() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  if (!token || !owner || !repo) throw new Error("Server config error");
  return { token, owner, repo };
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export function ghUrl(path: string) {
  const { owner, repo } = env();
  return `${GH_API}/repos/${owner}/${repo}/contents/${path}`;
}

// READ — file ko JSON me padho, saath me sha bhi lo
// sha bina PUT nahi hoga, isiliye ye zaroori hai
export async function ghReadJson<T = any>(path: string): Promise<{ data: T; sha: string | null; exists: boolean }> {
  const { token } = env();
  const res = await fetch(ghUrl(path), { headers: headers(token), cache: "no-store" });
  if (res.status === 404) return { data: null as any, sha: null, exists: false };
  if (!res.ok) throw new Error(`Fetch failed: ${path} — ${res.status}`);
  const json = await res.json();
  const data = JSON.parse(Buffer.from(json.content, "base64").toString("utf-8"));
  return { data, sha: json.sha, exists: true };
}

// WRITE — JSON ko GitHub pe likho
export async function ghWriteJson(path: string, data: unknown, message: string, sha?: string | null) {
  const { token } = env();
  const res = await fetch(ghUrl(path), {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new Error(`PUT failed: ${path} — ${res.status}`);
  return res.json();
}

// DELETE FILE — Permanent delete, koi Trash nahi
// Warning + ID confirm UI me hoga, yaha sirf delete hoga
export async function ghDeleteFile(path: string): Promise<boolean> {
  const { token } = env();
  const res = await fetch(ghUrl(path), { headers: headers(token) });
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`Fetch failed: ${path} — ${res.status}`);
  const json = await res.json();
  const del = await fetch(ghUrl(path), {
    method: "DELETE",
    headers: headers(token),
    body: JSON.stringify({ message: `chore: delete ${path}`, sha: json.sha }),
  });
  if (!del.ok) throw new Error(`Delete failed: ${path} — ${del.status}`);
  return true;
}

// AUDIT — sirf log hai, history nahi. Last 500 hi rakhenge taaki file badi na ho
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
  } catch (e) {
    console.error("[audit] failed", e);
  }
}

// RETRY helper — 409 / 422 aaye toh dobara try karo
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