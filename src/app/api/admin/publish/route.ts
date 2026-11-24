import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson, ghCommitMultiple, ghAudit, ghListDir } from "@/lib/github";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function validateItem(item: any): string | null {
  if (!item || typeof item !== "object") return "Item not object";
  if (!item.id || typeof item.id !== "string") return "Missing id";
  if (!item.contextId || item.contextId === "new-item") return "Invalid contextId";
  return null;
}

// GitHub se article ki category dhoondho — local fs se nahi, wo Vercel pe stale hota hai
async function findArticleCategoryFromGithub(contextId: string): Promise<string | null> {
  const files = await ghListDir("data/articles");
  for (const f of files) {
    if (!f.name.endsWith(".json")) continue;
    const { data } = await ghReadJson<any>(`data/articles/${f.name}`);
    if (data?.articles?.some((a: any) => a.id === contextId)) {
      return f.name.replace(".json", "");
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });

  const { data: queueContent } = await ghReadJson<any>("data/queue.json");
  if (!queueContent || !Array.isArray(queueContent.approved) || queueContent.approved.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400, headers: NO_STORE });
  }

  const validItems: any[] = [];
  const rejectedItems: { id: string; reason: string }[] = [];
  for (const item of queueContent.approved) {
    const err = validateItem(item);
    if (err) rejectedItems.push({ id: item?.id || "unknown", reason: err });
    else validItems.push(item);
  }
  if (validItems.length === 0) return NextResponse.json({ error: "All items rejected", rejected: rejectedItems }, { status: 400, headers: NO_STORE });

  const SERVER_NOW = new Date().toISOString();
  const filesToCommit: any[] = [];
  const fileUpdates: Record<string, any[]> = {};
  const pendingImagesToDelete: { path: string }[] = [];
  const cache = new Map<string, any>();

  const getFile = async (path: string) => {
    if (cache.has(path)) return cache.get(path);
    const { data, exists } = await ghReadJson<any>(path);
    if (!exists) return null;
    cache.set(path, data);
    return data;
  };

  try {
    for (const item of validItems) {
      let newImageUrl = "";
      if (item.pendingImageUrl) {
        const pendingPath = `public${item.pendingImageUrl}`;
        const pending = await ghReadJson<any>(pendingPath).catch(() => null);
        // pending image base64 ke liye raw chahiye — ghReadJson JSON parse karega, isiliye yaha raw fetch rakhte hai
        // NOTE: neeche wala block purane code jaisa hi hai, bas gh* se hai
        const { data: q, raw } = await ghReadJson<any>(pendingPath).catch(() => ({ data: null, raw: null })) as any;
        // Agar pending image nahi mili toh skip karo, publish mat roko
        if (raw?.content) {
          const base64Content = raw.content.replace(/\n/g, "");
          let finalPath = item.currentImagePath && item.currentImagePath !== "Unknown" ? `public/${item.currentImagePath.replace(/^\//, "")}` :
            item.targetType === "person" ? `public/images/people/${item.contextId}.jpg` :
            item.targetType === "landmark" ? `public/images/landmarks/${item.contextId}.jpg` : `public/images/articles/${item.contextId}.jpg`;
          filesToCommit.push({ path: finalPath, content: base64Content, encoding: "base64" });
          pendingImagesToDelete.push({ path: pendingPath });
          newImageUrl = `/${finalPath.replace("public/", "")}`;
        }
      }

      let targetPath = item.filePath;
      if (item.targetType === "gallery") targetPath = "data/media.json";
      else if (item.targetType === "person") targetPath = "data/people.json";
      else if (item.targetType === "directory") targetPath = "data/directory.json";
      else if (item.targetType === "article") {
        const cat = await findArticleCategoryFromGithub(item.contextId);
        if (cat) targetPath = `data/articles/${cat}.json`;
        else if (item.intent !== "add") throw new Error(`Article ${item.contextId} not found. Cannot update.`);
      }
      if (!targetPath || targetPath.includes("general.json")) {
        const cat = item.jsonObj?.Category || "education";
        targetPath = `data/articles/${cat}.json`;
      }
      if (!fileUpdates[targetPath]) fileUpdates[targetPath] = [];
      fileUpdates[targetPath].push({ ...item, newImageUrl });
    }

    for (const [filePath, updates] of Object.entries(fileUpdates)) {
      const currentContent = await getFile(filePath);
      if (!currentContent) throw new Error(`Missing file: ${filePath}. Publish aborted.`);
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
            id: u.contextId, src: u.newImageUrl,
            caption: u.jsonObj?.["Photo Title"] || "New Photo",
            category: u.jsonObj?.Category || "daily-life",
            year: u.jsonObj?.Year || new Date().getFullYear().toString()
          });
        } else if (u.targetType === "person" && u.intent === "add") {
          const data = u.jsonObj || {};
          currentContent.people.push({
            id: u.contextId, name: data["Full Name"] || "Unknown", role: data["Role"] || "",
            bio: data["Biography"] || "", dob: data["Date of Birth"] || "",
            deathDate: data["Date of Death"] || "", photo: u.newImageUrl || "",
            lastUpdated: editDate, lastEditedBy: u.userName
          });
        } else if (u.targetType === "directory" && u.intent === "add") {
          const data = u.jsonObj || {};
          currentContent.items.push({
            id: u.contextId, name: data["Name"] || "Unknown",
            categoryId: data.Category || "general", phone: data["Phone Number"] || "",
            address: data["Address"] || "", isEmergency: false,
            lastUpdated: editDate, lastEditedBy: u.userName
          });
        } else if (u.targetType === "article" && u.intent === "add") {
          const data = u.jsonObj || {};
          currentContent.articles.push({
            id: u.contextId, title: data["Article Title"] || "Untitled", subtitle: "New contribution",
            summary: data["Story"] ? data["Story"].slice(0, 150) + "..." : "",
            categories: [data.Category || "general"],
            content: [{ heading: "Overview", text: data["Story"] || "" }],
            hero: u.newImageUrl || null, datePublished: editDate,
            lastUpdated: editDate, lastEditedBy: u.userName
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
            a.lastUpdated = editDate; a.lastEditedBy = u.userName;
            return a;
          });
        }
      }
      filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
    }

    queueContent.approved = [];
    filesToCommit.push({ path: "data/queue.json", content: JSON.stringify(queueContent, null, 2) });
    pendingImagesToDelete.forEach(img => filesToCommit.push({ path: img.path, content: "", encoding: "base64", delete: true }));

    await ghCommitMultiple(filesToCommit, `Batch Publish: ${validItems.length} updates`);

    // Audit — Publish bhi log hoga
    for (const item of validItems) {
      await ghAudit({ action: "PUBLISHED", target: item.contextId, detail: `${item.targetType} • ${item.field || item.intent}` });
    }

    return NextResponse.json({ success: true, published: validItems.length }, { headers: NO_STORE });
  } catch (error: any) {
    console.error("[publish] Fatal error:", error);
    return NextResponse.json({ error: error?.message || "Publish failed" }, { status: 500, headers: NO_STORE });
  }
}