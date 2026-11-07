import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { getArticleById } from "@/lib/data";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function validateItem(item: any): string | null {
  if (!item || typeof item !== "object") return "Item not object";
  if (!item.id || typeof item.id !== "string") return "Missing id";
  if (!item.contextId || item.contextId === "new-item") return "Invalid contextId";
  return null;
}

async function ghFetch(url: string, init?: RequestInit) {
  const GITHUB_HEADERS = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28" };
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

class FileCache {
  private cache = new Map<string, { data: any; sha: string; content: any }>();
  async get(path: string) {
    if (this.cache.has(path)) return this.cache.get(path)!;
    const file = await fetchGithubFile(path);
    if (!file) { this.cache.set(path, { data: null, sha: "", content: null }); return null; }
    const content = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
    const entry = { data: file, sha: file.sha, content };
    this.cache.set(path, entry); return entry;
  }
}

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });

  const fileCache = new FileCache();
  const queuePath = "data/queue.json";
  const queueEntry = await fileCache.get(queuePath);
  
  if (!queueEntry) return NextResponse.json({ error: "Queue not found" }, { status: 500, headers: NO_STORE });
  if (!Array.isArray(queueEntry.content.approved) || queueEntry.content.approved.length === 0) return NextResponse.json({ error: "No items" }, { status: 400, headers: NO_STORE });

  const validItems: any[] = [];
  const rejectedItems: { id: string; reason: string }[] = [];
  
  for (const item of queueEntry.content.approved) {
    const err = validateItem(item);
    if (err) { rejectedItems.push({ id: item?.id || "unknown", reason: err }); continue; }
    validItems.push(item);
  }
  if (validItems.length === 0) return NextResponse.json({ error: "All items rejected", rejected: rejectedItems }, { status: 400, headers: NO_STORE });

  const SERVER_NOW = new Date().toISOString();
  const filesToCommit: any[] = [];
  const fileUpdates: Record<string, any[]> = {};
  const pendingImagesToDelete: { path: string }[] = [];

  try {
    for (const item of validItems) {
      let newImageUrl = "";
      
      if (item.pendingImageUrl) {
        const pendingPath = `public${item.pendingImageUrl}`;
        const pendingFile = await fetchGithubFile(pendingPath);
        if (pendingFile) {
          const base64Content = pendingFile.content.replace(/\n/g, "");
          let finalPath = item.currentImagePath && item.currentImagePath !== "Unknown" ? `public/${item.currentImagePath.replace(/^\//, "")}` : 
                          item.targetType === "person" ? `public/images/people/${item.contextId}.jpg` : 
                          item.targetType === "landmark" ? `public/images/landmarks/${item.contextId}.jpg` : `public/images/articles/${item.contextId}.jpg`;
          
          filesToCommit.push({ path: finalPath, content: base64Content, encoding: "base64" });
          pendingImagesToDelete.push({ path: pendingPath });
          newImageUrl = `/${finalPath.replace("public/", "")}`;
        }
      }

      // 🚀 STRICT PATH RESOLUTION
      let targetPath = item.filePath;
      
      if (item.targetType === "gallery") {
        targetPath = "data/media.json";
      } else if (item.targetType === "person") {
        targetPath = "data/people.json";
      } else if (item.targetType === "directory") {
        targetPath = "data/directory.json";
      } else if (item.targetType === "article") {
        const existingArticle = getArticleById(item.contextId);
        if (existingArticle && existingArticle.categories && existingArticle.categories.length > 0) {
          targetPath = `data/articles/${existingArticle.categories[0]}.json`;
        } else if (item.intent !== "add") {
          throw new Error(`Article ${item.contextId} not found. Cannot update.`);
        }
      }

      if (!targetPath || targetPath.includes("general.json")) {
        const cat = item.jsonObj?.Category || "education";
        targetPath = `data/articles/${cat}.json`;
      }

      if (!fileUpdates[targetPath]) fileUpdates[targetPath] = [];
      fileUpdates[targetPath].push({ ...item, newImageUrl });
    }

    // 🚀 APPLY UPDATES
    for (const [filePath, updates] of Object.entries(fileUpdates)) {
      const entry = await fileCache.get(filePath);
      if (!entry) throw new Error(`Missing file: ${filePath}. Publish aborted.`);
      
      const currentContent = entry.content;
      if (filePath.includes("articles") && !currentContent.articles) currentContent.articles = [];
      if (filePath === "data/media.json") {
        if (!currentContent.gallery) currentContent.gallery = { categories: [], photos: [] };
        if (!currentContent.gallery.photos) currentContent.gallery.photos = [];
      }
      if (filePath === "data/people.json" && !currentContent.people) currentContent.people = [];
      
      for (const u of updates) {
        const editDate = SERVER_NOW.split("T")[0];
        
        if (u.targetType === "gallery" && u.intent === "add") {
          currentContent.gallery.photos.push({
            id: u.contextId,
            src: u.newImageUrl,
            caption: u.jsonObj?.["Photo Title"] || "New Photo",
            category: u.jsonObj?.Category || "daily-life",
            year: u.jsonObj?.Year || new Date().getFullYear().toString()
          });
        } else if (u.targetType === "person" && u.intent === "add") {
          const data = u.jsonObj || {};
          currentContent.people.push({
            id: u.contextId,
            name: data["Full Name"] || "Unknown",
            role: data["Role"] || "",
            bio: data["Biography"] || "",
            dob: data["Date of Birth"] || "",
            deathDate: data["Date of Death"] || "",
            photo: u.newImageUrl || "",
            lastUpdated: editDate,
            lastEditedBy: u.userName
          });
        } else if (u.targetType === "directory" && u.intent === "add") {
          const data = u.jsonObj || {};
          currentContent.items.push({
            id: u.contextId,
            name: data["Name"] || "Unknown",
            categoryId: data.Category || "general",
            phone: data["Phone Number"] || "",
            address: data["Address"] || "",
            isEmergency: false,
            lastUpdated: editDate,
            lastEditedBy: u.userName
          });
        } else if (u.targetType === "article" && u.intent === "add") {
          const data = u.jsonObj || {};
          currentContent.articles.push({
            id: u.contextId,
            title: data["Article Title"] || "Untitled",
            subtitle: "New contribution",
            summary: data["Story"] ? data["Story"].slice(0, 150) + "..." : "",
            categories: [data.Category || "general"],
            content: [{ heading: "Overview", text: data["Story"] || "" }],
            hero: u.newImageUrl || null,
            datePublished: editDate,
            lastUpdated: editDate,
            lastEditedBy: u.userName
          });
        } else if (filePath.includes("articles")) {
          currentContent.articles = currentContent.articles.map((a: any) => {
            if (a.id !== u.contextId) return a;
            if (u.intent === "image_update") a.hero = u.newImageUrl;
            if (u.intent === "edit") {
              if (u.field === "Article Title") a.title = u.newValue;
              else if (u.field === "Article Subtitle") a.subtitle = u.newValue;
              else if (u.field === "Article Summary") a.summary = u.newValue;
              else if (u.field.startsWith("Paragraph: ")) {
                const headingName = u.field.replace("Paragraph: ", "");
                a.content = a.content.map((b: any) => b.heading === headingName ? { ...b, text: u.newValue } : b);
              } else if (u.field.startsWith("Infobox: ")) {
                const infoKey = u.field.replace("Infobox: ", "");
                if (a.infobox) a.infobox[infoKey] = u.newValue;
              }
            }
            a.lastUpdated = editDate;
            a.lastEditedBy = u.userName;
            return a;
          });
        }
      }
      filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
    }

    queueEntry.content.approved = [];
    filesToCommit.push({ path: queuePath, content: JSON.stringify(queueEntry.content, null, 2) });
    pendingImagesToDelete.forEach(img => filesToCommit.push({ path: img.path, content: "", encoding: "base64", delete: true }));

    await commitMultipleFiles(filesToCommit, `Batch Publish: ${validItems.length} updates`);
    return NextResponse.json({ success: true, published: validItems.length }, { headers: NO_STORE });
  } catch (error: any) {
    console.error("[publish] Fatal error:", error);
    return NextResponse.json({ error: error?.message || "Publish failed" }, { status: 500, headers: NO_STORE });
  }
}