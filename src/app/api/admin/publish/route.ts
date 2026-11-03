import { NextResponse } from "next/server";

// 🚀 Multi-file Commit
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

async function fetchGithubFile(path: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } });
  if (!res.ok) return null;
  return await res.json();
}

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
    const newCategories: Record<string, any> = {};

    for (const item of queueContent.approved) {
      
      let newImageUrl = "";
      if (item.pendingImageUrl) {
        const pendingPath = `public${item.pendingImageUrl}`; 
        const pendingFile = await fetchGithubFile(pendingPath);
        
        if (pendingFile) {
          const base64Content = pendingFile.content.replace(/\n/g, "");
          let finalPath = "";
          if (item.currentImagePath && item.currentImagePath !== "Unknown") {
             finalPath = `public/${item.currentImagePath.startsWith("/") ? item.currentImagePath.slice(1) : item.currentImagePath}`;
          } else {
             if (item.targetType === "person") finalPath = `public/images/people/${item.contextId}.jpg`;
             else if (item.targetType === "landmark") finalPath = `public/images/landmarks/${item.contextId}.jpg`;
             else finalPath = `public/images/articles/${item.contextId}.jpg`; 
          }

          filesToCommit.push({ path: finalPath, content: base64Content, encoding: "base64" });
          await deleteGithubFile(pendingPath, pendingFile.sha);
          newImageUrl = `/${finalPath.replace("public/", "")}?t=${Date.now()}`;
        }
      }

      // Handle NEW CONTENT (Add)
      if (item.intent === "add") {
        // ... (Add logic same as before)
        const data = item.jsonObj;
        if (item.targetType === "article") {
          const catId = data.Category || "general";
          if (item.customCategory) {
            if (!newCategories["data/categories.json"]) newCategories["data/categories.json"] = [];
            newCategories["data/categories.json"].push({ id: catId, title: item.customCategory, icon: "📁", description: "User contributed category" });
          }
          const newArticle = {
            id: item.contextId, title: data["Article Title"], subtitle: "New contribution",
            summary: data["Story"].slice(0, 150) + "...", categories: [catId],
            content: [{ heading: "Overview", text: data["Story"] }],
            hero: newImageUrl || null, lastUpdated: item.timestamp.split('T')[0], lastEditedBy: item.userName
          };
          const filePath = `data/articles/${catId}.json`;
          if (!fileUpdates[filePath]) fileUpdates[filePath] = [];
          fileUpdates[filePath].push({ type: "add_article", data: newArticle });
        }
        // ... (Directory, Image, Person add logic)
      }

      // Handle TEXT EDITS
      if (item.intent === "edit" && item.field && item.newValue) {
        if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
        fileUpdates[item.filePath].push({ 
          type: "text", contextId: item.contextId, field: item.field, newValue: item.newValue,
          userName: item.userName, timestamp: item.timestamp 
        });
      }
      
      // 🚀 FIXED: Handle IMAGE UPDATES
      if (item.intent === "image_update" || (item.intent === "edit" && item.pendingImageUrl)) {
         if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
         fileUpdates[item.filePath].push({ 
           type: "image_update", contextId: item.contextId, newImage: newImageUrl,
           userName: item.userName, timestamp: item.timestamp 
         });
      }
    }

    // Apply Updates to JSON Files
    for (const [filePath, updates] of Object.entries(fileUpdates)) {
      const fileData = await fetchGithubFile(filePath);
      
      let currentContent: any = fileData ? JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8")) : {};
      if (filePath.includes("articles") && !currentContent.articles) currentContent.articles = [];
      if (filePath.includes("directory") && !currentContent.items) currentContent.items = currentContent.items || [];
      if (filePath.includes("media") && !currentContent.gallery) currentContent.gallery = { categories: [], photos: [] };
      if (filePath.includes("media") && !currentContent.landmarks) currentContent.landmarks = [];
      if (filePath.includes("people") && !currentContent.people) currentContent.people = [];

      updates.forEach((u) => {
        const itemDate = new Date(u.timestamp).getTime();
        
        // --- ARTICLE UPDATES ---
        if (filePath.includes("articles")) {
          currentContent.articles = currentContent.articles.map((a: any) => {
            if (a.id === u.contextId) { // 🚀 Target specific article by ID
              
              if (u.type === "text") {
                if (u.field === "Article Title") a.title = u.newValue;
                else if (u.field === "Article Subtitle") a.subtitle = u.newValue;
                else if (u.field === "Article Summary") a.summary = u.newValue;
                else if (u.field.startsWith("Paragraph: ")) {
                  const headingName = u.field.replace("Paragraph: ", "");
                  a.content = a.content.map((block: any) => {
                    if (block.heading === headingName) block.text = u.newValue;
                    return block;
                  });
                }
              }
              
              if (u.type === "image_update") {
                a.hero = u.newImage;
              }

              // 🚀 Update Metadata for targeted article
              const currentDate = new Date(a.lastUpdated || "2000-01-01").getTime();
              if (itemDate >= currentDate) {
                a.lastUpdated = u.timestamp.split('T')[0];
                a.lastEditedBy = u.userName;
              }
            }
            return a;
          });
        }

        // --- PEOPLE UPDATES ---
        if (filePath.includes("people")) {
          currentContent.people = currentContent.people.map((p: any) => {
            if (p.id === u.contextId) {
              if (u.type === "text") p[u.field.toLowerCase()] = u.newValue;
              if (u.type === "image_update") p.photo = u.newImage;

              const currentDate = new Date(p.lastUpdated || "2000-01-01").getTime();
              if (itemDate >= currentDate) {
                p.lastUpdated = u.timestamp.split('T')[0];
                p.lastEditedBy = u.userName;
              }
            }
            return p;
          });
        }
        // ... (Directory aur Landmark update logic bhi same rahega)
      });

      filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
    }

    // Clear Queue
    queueContent.approved = [];
    const queueIndex = filesToCommit.findIndex(f => f.path === queuePath);
    if (queueIndex !== -1) filesToCommit[queueIndex].content = JSON.stringify(queueContent, null, 2);
    else filesToCommit.push({ path: queuePath, content: JSON.stringify(queueContent, null, 2) });

    await commitMultipleFiles(filesToCommit, `Batch Publish: Content & Metadata Update`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Publish Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}