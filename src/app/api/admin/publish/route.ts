import { NextResponse } from "next/server";

// 🚀 Helper: Multi-file Commit
async function commitMultipleFiles(files: { path: string; content: string; encoding?: "utf-8" | "base64" }[], message: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const branch = "main";

  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers: { Authorization: `Bearer ${token}` } });
  const ref = await refRes.json();
  const commitSha = ref.object.sha;

  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`, { headers: { Authorization: `Bearer ${token}` } });
  const commit = await commitRes.json();
  const baseTreeSha = commit.tree.sha;

  const tree = await Promise.all(files.map(async (f) => {
    const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: f.content, encoding: f.encoding || "utf-8" })
    });
    const blob = await blobRes.json();
    return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree })
  });
  const newTree = await treeRes.json();

  const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message, tree: newTree.sha, parents: [commitSha] })
  });
  const newCommit = await newCommitRes.json();

  await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sha: newCommit.sha })
  });
}

// 🚀 Helper: Fetch File
async function fetchGithubFile(path: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } });
  if (!res.ok) return null;
  return await res.json();
}

// 🚀 Helper: Delete File
async function deleteGithubFile(path: string, sha: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Delete pending image`, sha })
  });
}

export async function POST() {
  try {
    const queuePath = "data/queue.json";
    const queueFile = await fetchGithubFile(queuePath);
    if (!queueFile) throw new Error("Queue file not found");

    let queueContent = JSON.parse(Buffer.from(queueFile.content, "base64").toString("utf-8"));
    if (!queueContent.approved || queueContent.approved.length === 0) {
      return NextResponse.json({ error: "No approved items to publish." }, { status: 400 });
    }

    const filesToCommit: { path: string; content: string; encoding?: "utf-8" | "base64" }[] = [];
    const fileUpdates: Record<string, any[]> = {};

    // 1. Process all approved items
    for (const item of queueContent.approved) {
      
      // 🚀 Handle Image Upload
      if (item.pendingImageUrl) {
        // FIX: Path sahi kiya gaya hai (public add kiya)
        const pendingPath = `public${item.pendingImageUrl}`; 
        const pendingFile = await fetchGithubFile(pendingPath);
        
        if (pendingFile) {
          const base64Content = pendingFile.content.replace(/\n/g, "");
          
          let finalPath = "";
          if (item.targetType === "person") finalPath = `public/images/people/${item.contextId}.jpg`;
          else if (item.targetType === "landmark") finalPath = `public/images/landmarks/${item.contextId}.jpg`;
          else finalPath = `public/images/articles/${item.contextId}.jpg`; 

          // Add final image to commit list
          filesToCommit.push({ path: finalPath, content: base64Content, encoding: "base64" });
          
          // Delete pending image from GitHub
          await deleteGithubFile(pendingPath, pendingFile.sha);

          const newImageUrl = `/${finalPath.replace("public/", "")}`;

          // Update JSON logic
          if (item.targetType === "person") {
             if (!fileUpdates["data/people.json"]) fileUpdates["data/people.json"] = [];
             fileUpdates["data/people.json"].push({ type: "image", contextId: item.contextId, newPhoto: newImageUrl });
          } 
          else if (item.targetType === "landmark") {
             if (!fileUpdates["data/media.json"]) fileUpdates["data/media.json"] = [];
             fileUpdates["data/media.json"].push({ type: "image", contextId: item.contextId, newPhoto: newImageUrl });
          }
          else {
             // 🚀 Article Hero Image - Scan all article files
             const articleFiles = ["culture", "education", "geography", "health", "infrastructure", "landmarks", "religion"];
             for (const cat of articleFiles) {
               const p = `data/articles/${cat}.json`;
               const fileData = await fetchGithubFile(p);
               if (fileData) {
                 let content = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
                 const hasArticle = content.articles.some((a: any) => a.id === item.contextId);
                 if (hasArticle) {
                   if (!fileUpdates[p]) fileUpdates[p] = [];
                   fileUpdates[p].push({ type: "image_hero", contextId: item.contextId, newImage: newImageUrl });
                   break; // Found it, stop scanning
                 }
               }
             }
          }
        }
      }

      // 🚀 Handle Text Edits (Agar koi text edit hua ho)
      if (item.field && item.newValue) {
        if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
        fileUpdates[item.filePath].push({ type: "text", contextId: item.contextId, field: item.field, newValue: item.newValue });
      }
    }

    // 2. Process JSON Updates
    for (const [filePath, updates] of Object.entries(fileUpdates)) {
      const fileData = await fetchGithubFile(filePath);
      if (fileData) {
        let currentContent = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));

        updates.forEach((u) => {
          if (u.type === "image" && filePath.includes("people.json")) {
             currentContent.people = currentContent.people.map((p: any) => {
               if (p.id === u.contextId) p.photo = u.newPhoto;
               return p;
             });
          }
          else if (u.type === "image" && filePath.includes("media.json")) {
             currentContent.landmarks = currentContent.landmarks.map((l: any) => {
               if (l.id === u.contextId) l.photo = u.newPhoto;
               return l;
             });
          }
          // 🚀 Update Article Hero
          else if (u.type === "image_hero" && filePath.includes("articles")) {
             currentContent.articles = currentContent.articles.map((a: any) => {
               if (a.id === u.contextId) a.hero = u.newImage;
               return a;
             });
          }
          // 🚀 Update Article Text (Title/Paragraphs)
          else if (u.type === "text" && filePath.includes("articles")) {
             currentContent.articles = currentContent.articles.map((a: any) => {
                if (a.id === u.contextId) {
                  if (u.field === "Article Title") a.title = u.newValue;
                  else if (u.field === "Article Subtitle") a.subtitle = u.newValue;
                  // (Baaki fields ke liye logic yahan add kar sakte hain)
                }
                return a;
             });
          }
        });

        filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
      }
    }

    // 3. Clear approved list
    queueContent.approved = [];
    filesToCommit.push({ path: queuePath, content: JSON.stringify(queueContent, null, 2) });

    // 4. Commit everything at once!
    const commitMsg = `Batch Publish: ${filesToCommit.length} file(s) updated via Dashboard`;
    await commitMultipleFiles(filesToCommit, commitMsg);

    return NextResponse.json({ success: true, count: filesToCommit.length });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Publish failed" }, { status: 500 });
  }
}