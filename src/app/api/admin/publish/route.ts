import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { isValidSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const GITHUB_HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

// ─────────────────────────────────────────────
// Env validation
// ─────────────────────────────────────────────
function checkEnv(): string | null {
  const required = ["GITHUB_TOKEN", "GITHUB_REPO_OWNER", "GITHUB_REPO_NAME"];
  const missing = required.filter((k) => !process.env[k]);
  return missing.length ? `Missing env vars: ${missing.join(", ")}` : null;
}

// ─────────────────────────────────────────────
// Validation (prevents path traversal + injection)
// ─────────────────────────────────────────────
const VALID_FILE_PATH = /^data\/(articles\/[a-z][a-z0-9-]*|people|directory|media|categories)\.json$/;
const VALID_ID = /^[a-z0-9-]+$/;
const VALID_CATEGORY = /^[a-z0-9-]+$/;

function validateItem(item: any): string | null {
  if (!item || typeof item !== "object") return "item is not an object";
  if (!item.id || typeof item.id !== "string") return "missing id";
  if (!item.contextId || !VALID_ID.test(item.contextId)) return `invalid contextId: ${item.contextId}`;
  if (item.filePath && !VALID_FILE_PATH.test(item.filePath)) return `invalid filePath: ${item.filePath}`;
  if (item.customCategory && !VALID_CATEGORY.test(item.customCategory)) return `invalid customCategory`;
  if (item.jsonObj?.Category && !VALID_CATEGORY.test(item.jsonObj.Category)) return `invalid Category`;
  return null;
}

// ─────────────────────────────────────────────
// GitHub helpers with error handling
// ─────────────────────────────────────────────
async function ghFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { ...GITHUB_HEADERS, ...(init?.headers || {}) } });
  return res;
}

async function fetchGithubFile(path: string): Promise<any | null> {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchGithubFile(${path}) failed: ${res.status}`);
  return res.json();
}

async function commitMultipleFiles(
  files: { path: string; content: string; encoding?: "utf-8" | "base64"; delete?: boolean }[],
  message: string
): Promise<void> {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const branch = "main";

  // 1. Get branch ref
  const refRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  if (!refRes.ok) throw new Error(`Failed to fetch branch ref (${refRes.status})`);
  const ref = await refRes.json();
  if (!ref?.object?.sha) throw new Error("Branch ref missing SHA");
  const commitSha = ref.object.sha;

  // 2. Get commit
  const commitRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`);
  if (!commitRes.ok) throw new Error(`Failed to fetch commit (${commitRes.status})`);
  const commit = await commitRes.json();
  if (!commit?.tree?.sha) throw new Error("Commit missing tree SHA");
  const baseTreeSha = commit.tree.sha;

  // 3. Create blobs (skip deleted files)
  const treeEntries = await Promise.all(
    files.map(async (f) => {
      if (f.delete) {
        return { path: f.path, mode: "100644", type: "blob", sha: null };   // ✅ tree API delete
      }
      const blobRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: f.content, encoding: f.encoding || "utf-8" }),
      });
      if (!blobRes.ok) throw new Error(`Blob creation failed for ${f.path} (${blobRes.status})`);
      const blob = await blobRes.json();
      if (!blob?.sha) throw new Error(`Blob missing SHA for ${f.path}`);
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
    })
  );

  // 4. Create tree
  const treeRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });
  if (!treeRes.ok) throw new Error(`Tree creation failed (${treeRes.status})`);
  const newTree = await treeRes.json();
  if (!newTree?.sha) throw new Error("Tree missing SHA");

  // 5. Create commit
  const newCommitRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, tree: newTree.sha, parents: [commitSha] }),
  });
  if (!newCommitRes.ok) throw new Error(`Commit creation failed (${newCommitRes.status})`);
  const newCommit = await newCommitRes.json();
  if (!newCommit?.sha) throw new Error("Commit missing SHA");

  // 6. Update ref
  const updateRes = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  if (!updateRes.ok) throw new Error(`Ref update failed (${updateRes.status})`);
}

// ─────────────────────────────────────────────
// Cache for file fetches (avoids duplicate calls)
// ─────────────────────────────────────────────
class FileCache {
  private cache = new Map<string, { data: any; sha: string; content: any }>();
  
  async get(path: string): Promise<{ data: any; sha: string; content: any } | null> {
    if (this.cache.has(path)) return this.cache.get(path)!;
    const file = await fetchGithubFile(path);
    if (!file) {
      this.cache.set(path, { data: null, sha: "", content: null });
      return null;
    }
    const content = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
    const entry = { data: file, sha: file.sha, content };
    this.cache.set(path, entry);
    return entry;
  }
}

// ─────────────────────────────────────────────
// POST /api/admin/publish
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 🔐 STEP 1: Auth
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  // 🔐 STEP 2: Env
  const envError = checkEnv();
  if (envError) {
    console.error(`[publish] ${envError}`);
    return NextResponse.json({ error: "Server configuration error" }, { status: 500, headers: NO_STORE });
  }

  // 🔐 STEP 3: Load queue
  const fileCache = new FileCache();
  const queuePath = "data/queue.json";
  const queueEntry = await fileCache.get(queuePath);
  
  if (!queueEntry) {
    return NextResponse.json({ error: "Queue file not found" }, { status: 500, headers: NO_STORE });
  }

  const queueContent = queueEntry.content;
  if (!Array.isArray(queueContent.approved) || queueContent.approved.length === 0) {
    return NextResponse.json({ error: "No approved items to publish." }, { status: 400, headers: NO_STORE });
  }

  // 🔐 STEP 4: Validate all items BEFORE processing (fail-fast on malicious)
  const validItems: any[] = [];
  const rejectedItems: { id: string; reason: string }[] = [];
  for (const item of queueContent.approved) {
    const err = validateItem(item);
    if (err) {
      console.warn(`[publish] Rejecting item ${item?.id || "unknown"}: ${err}`);
      rejectedItems.push({ id: item?.id || "unknown", reason: err });
      continue;
    }
    validItems.push(item);
  }

  if (validItems.length === 0) {
    return NextResponse.json(
      { error: "No valid items to publish", rejected: rejectedItems },
      { status: 400, headers: NO_STORE }
    );
  }

  const SERVER_NOW = new Date().toISOString();

  try {
    const filesToCommit: { path: string; content: string; encoding?: "utf-8" | "base64"; delete?: boolean }[] = [];
    const fileUpdates: Record<string, any[]> = {};
    const newCategories: Record<string, any[]> = {};
    const pendingImagesToDelete: { path: string; sha: string }[] = [];

    // ────── STEP 5: Process items (validate file existence) ──────
    for (const item of validItems) {
      let newImageUrl = "";

      // Image handling
      if (item.pendingImageUrl) {
        const pendingPath = `public${item.pendingImageUrl}`;
        const pendingFile = await fetchGithubFile(pendingPath);
        
        if (pendingFile) {
          const base64Content = pendingFile.content.replace(/\n/g, "");
          
          // ✅ Content hash for SEO-stable URL (no more Date.now())
          const hash = createHash("sha256").update(base64Content).digest("hex").slice(0, 10);
          
          let finalPath = "";
          if (item.currentImagePath && item.currentImagePath !== "Unknown") {
            finalPath = `public/${item.currentImagePath.startsWith("/") ? item.currentImagePath.slice(1) : item.currentImagePath}`;
          } else if (item.targetType === "person") {
            finalPath = `public/images/people/${item.contextId}.jpg`;
          } else if (item.targetType === "landmark") {
            finalPath = `public/images/landmarks/${item.contextId}.jpg`;
          } else {
            finalPath = `public/images/articles/${item.contextId}.jpg`;
          }

          filesToCommit.push({ path: finalPath, content: base64Content, encoding: "base64" });
          
          // ✅ Queue image deletion for AFTER successful commit
          pendingImagesToDelete.push({ path: pendingPath, sha: pendingFile.sha });
          
          newImageUrl = `/${finalPath.replace("public/", "")}?v=${hash}`;
        } else {
          console.warn(`[publish] Pending image missing for ${item.id}: ${pendingPath}`);
        }
      }

      // New category
      if (item.customCategory && item.jsonObj?.Category) {
        const catFile = item.targetType === "directory" ? "data/directory.json" 
          : item.targetType === "image" ? "data/media.json" 
          : "data/categories.json";
        
        if (!newCategories[catFile]) newCategories[catFile] = [];
        newCategories[catFile].push({
          id: item.jsonObj.Category,
          title: item.customCategory,
          icon: "📁",
          description: "User contributed",
        });
      }

      if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
      fileUpdates[item.filePath].push({ ...item, newImageUrl });
    }

    // ────── STEP 6: Apply updates to JSON files ──────
    for (const [filePath, updates] of Object.entries(fileUpdates)) {
      const entry = await fileCache.get(filePath);
      
      // ✅ CRITICAL FIX — fail-fast on missing file (no data destruction)
      if (!entry) {
        throw new Error(`Refusing to overwrite missing file: ${filePath}. Publish aborted.`);
      }
      
      const currentContent = entry.content;
      if (filePath.includes("articles") && !currentContent.articles) currentContent.articles = [];
      if (filePath.includes("directory") && !currentContent.items) currentContent.items = [];
      if (filePath.includes("media") && !currentContent.gallery) currentContent.gallery = { categories: [], photos: [] };
      if (filePath.includes("media") && !currentContent.landmarks) currentContent.landmarks = [];
      if (filePath.includes("people") && !currentContent.people) currentContent.people = [];

      for (const u of updates) {
        // ✅ Server-side timestamp (no time travel)
        const editDate = SERVER_NOW.split("T")[0];

        // A. NEW ARTICLE
        if (u.targetType === "article" && u.intent === "add") {
          const data = u.jsonObj;
          currentContent.articles.push({
            id: u.contextId,
            title: data["Article Title"] || "Untitled",
            subtitle: "New contribution",
            summary: data["Story"] ? data["Story"].slice(0, 150) + "..." : "",
            categories: [data.Category || "general"],
            content: [{ heading: "Overview", text: data["Story"] || "" }],
            hero: u.newImageUrl || null,
            datePublished: editDate,      // ✅ new field
            lastUpdated: editDate,        // ✅ server time
            lastEditedBy: u.userName,
          });
        }
        // B. NEW PERSON
        else if (u.targetType === "person" && u.intent === "add") {
          const data = u.jsonObj;
          currentContent.people.push({
            id: u.contextId,
            name: data["Full Name"] || "Unknown",
            role: data["Role"] || "",
            bio: data["Biography"] || "",
            dob: data["Date of Birth"] || "",
            deathDate: data["Date of Death"] || "",
            photo: u.newImageUrl || "",
            lastUpdated: editDate,
            lastEditedBy: u.userName,
          });
        }
        // C. NEW DIRECTORY ITEM
        else if (u.targetType === "directory" && u.intent === "add") {
          const data = u.jsonObj;
          currentContent.items.push({
            id: u.contextId,
            name: data["Name"] || "Unknown",
            categoryId: data.Category || "general",
            phone: data["Phone Number"] || "",
            address: data["Address"] || "",
            isEmergency: false,
            lastUpdated: editDate,
            lastEditedBy: u.userName,
          });
        }
        // D. NEW GALLERY PHOTO
        else if (u.targetType === "image" && u.intent === "add") {
          const data = u.jsonObj;
          currentContent.gallery.photos.push({
            id: u.contextId,
            src: u.newImageUrl || "/icon.png",
            caption: data["Photo Title"] || "New Photo",
            category: data.Category || "general",
            year: data["Year"] || new Date().getFullYear().toString(),
          });
        }
        // E. ARTICLE UPDATE
        else if (filePath.includes("articles")) {
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
            // ✅ datePublished preserve, lastUpdated = server time
            if (!a.datePublished) a.datePublished = a.lastUpdated || editDate;
            a.lastUpdated = editDate;
            a.lastEditedBy = u.userName;
            return a;
          });
        }
        // F. PERSON UPDATE
        else if (filePath.includes("people")) {
          currentContent.people = currentContent.people.map((p: any) => {
            if (p.id !== u.contextId) return p;
            if (u.intent === "image_update") p.photo = u.newImageUrl;
            if (u.intent === "edit") {
              if (u.field === "Full Name") p.name = u.newValue;
              else if (u.field === "Role") p.role = u.newValue;
              else if (u.field === "Biography") p.bio = u.newValue;
              else if (u.field === "Life Journey") p.journey = u.newValue;
              else if (u.field === "Birthplace") p.birthplace = u.newValue;
              else if (u.field === "Locality") p.locality = u.newValue;
              else if (u.field === "Lifespan (DOB/DOD)") p.dob = u.newValue;
            }
            p.lastUpdated = editDate;
            p.lastEditedBy = u.userName;
            return p;
          });
        }
        // G. DIRECTORY UPDATE
        else if (filePath.includes("directory")) {
          currentContent.items = currentContent.items.map((i: any) => {
            if (i.id !== u.contextId) return i;
            if (u.intent === "edit") {
              if (u.field === "Phone Number") i.phone = u.newValue;
              else if (u.field === "Address") i.address = u.newValue;
              else if (u.field === "Timing") i.timing = u.newValue;
            }
            i.lastUpdated = editDate;
            i.lastEditedBy = u.userName;
            return i;
          });
        }
        // H. LANDMARK UPDATE
        else if (filePath.includes("media.json")) {
          currentContent.landmarks = currentContent.landmarks.map((l: any) => {
            if (l.id !== u.contextId) return l;
            if (u.intent === "edit" && u.field === "Coordinates") {
              const parts = u.newValue.split(",");
              if (parts.length === 2) {
                const lat = parseFloat(parts[0].trim());
                const lng = parseFloat(parts[1].trim());
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                  l.lat = lat;
                  l.lng = lng;
                }
              }
            }
            return l;
          });
        }
      }
      filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
    }

    // ────── STEP 7: New categories ──────
    for (const [filePath, cats] of Object.entries(newCategories)) {
      const entry = await fileCache.get(filePath);
      if (!entry) {
        console.warn(`[publish] Skipping new category for missing file: ${filePath}`);
        continue;
      }
      const currentContent = entry.content;
      if (filePath.includes("media.json")) {
        if (!currentContent.gallery) currentContent.gallery = { categories: [], photos: [] };
        if (!currentContent.gallery.categories) currentContent.gallery.categories = [];
        cats.forEach((c) => {
          if (!currentContent.gallery.categories.find((x: any) => x.id === c.id)) {
            currentContent.gallery.categories.push(c);
          }
        });
      } else {
        if (!currentContent.categories) currentContent.categories = [];
        cats.forEach((c) => {
          if (!currentContent.categories.find((x: any) => x.id === c.id)) {
            currentContent.categories.push(c);
          }
        });
      }
      const idx = filesToCommit.findIndex((f) => f.path === filePath);
      if (idx !== -1) filesToCommit[idx].content = JSON.stringify(currentContent, null, 2);
      else filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
    }

    // ────── STEP 8: Clear queue + mark images for deletion ──────
    queueContent.approved = [];
    const qIdx = filesToCommit.findIndex((f) => f.path === queuePath);
    if (qIdx !== -1) filesToCommit[qIdx].content = JSON.stringify(queueContent, null, 2);
    else filesToCommit.push({ path: queuePath, content: JSON.stringify(queueContent, null, 2) });

    // ✅ Include image deletions IN THE SAME COMMIT (atomic)
    for (const img of pendingImagesToDelete) {
      filesToCommit.push({ path: img.path, content: "", encoding: "base64", delete: true });
    }

    // ────── STEP 9: Single atomic commit ──────
    await commitMultipleFiles(filesToCommit, `Batch Publish: ${validItems.length} updates (${rejectedItems.length} rejected)`);

    return NextResponse.json(
      { success: true, published: validItems.length, rejected: rejectedItems },
      { headers: NO_STORE }
    );
  } catch (error: any) {
    console.error("[publish] Fatal error:", error);
    return NextResponse.json(
      { error: error?.message || "Publish failed" },
      { status: 500, headers: NO_STORE }
    );
  }
}