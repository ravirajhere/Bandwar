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
      
      // 1. Handle Image Upload
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

      // 2. Handle NEW CONTENT (intent === "add")
      if (item.intent === "add") {
        const data = item.jsonObj;
        
        // ARTICLE
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

        // DIRECTORY
        else if (item.targetType === "directory") {
          const catId = data.Category || "general";
          if (item.customCategory) {
            if (!newCategories["data/directory.json"]) newCategories["data/directory.json"] = [];
            newCategories["data/directory.json"].push({ id: catId, title: item.customCategory, icon: "📁" });
          }
          const newItem = {
            id: item.contextId, name: data["Name"], categoryId: catId, phone: data["Phone Number"],
            address: data["Address"] || "", isEmergency: false, lastUpdated: item.timestamp.split('T')[0], lastEditedBy: item.userName
          };
          if (!fileUpdates["data/directory.json"]) fileUpdates["data/directory.json"] = [];
          fileUpdates["data/directory.json"].push({ type: "add_item", data: newItem });
        }

        // GALLERY IMAGE
        else if (item.targetType === "image") {
          const catId = data.Category || "general";
          if (item.customCategory) {
            if (!newCategories["data/media.json"]) newCategories["data/media.json"] = [];
            newCategories["data/media.json"].push({ id: catId, title: item.customCategory, icon: "📁" });
          }
          const newPhoto = {
            id: item.contextId, src: newImageUrl || "/icon.png", caption: data["Photo Title"],
            category: catId, year: data["Year"] || new Date().getFullYear().toString()
          };
          if (!fileUpdates["data/media.json"]) fileUpdates["data/media.json"] = [];
          fileUpdates["data/media.json"].push({ type: "add_photo", data: newPhoto });
        }

        // PERSON
        else if (item.targetType === "person") {
          const newPerson = {
            id: item.contextId, name: data["Full Name"], role: data["Role"], bio: data["Biography"],
            dob: data["Date of Birth"] || "", deathDate: data["Date of Death"] || "",
            photo: newImageUrl || "", lastUpdated: item.timestamp.split('T')[0], lastEditedBy: item.userName, tags: []
          };
          if (!fileUpdates["data/people.json"]) fileUpdates["data/people.json"] = [];
          fileUpdates["data/people.json"].push({ type: "add_person", data: newPerson });
        }
      }

      // 3. Handle EDITS
      if (item.intent === "edit" && item.field && item.newValue) {
        if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
        fileUpdates[item.filePath].push({ 
          type: "text", contextId: item.contextId, field: item.field, newValue: item.newValue,
          userName: item.userName, timestamp: item.timestamp 
        });
      }
      
      // 4. Handle EDIT IMAGE
      if (item.intent === "edit" && item.pendingImageUrl) {
         if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
         fileUpdates[item.filePath].push({ 
           type: "image_update", contextId: item.contextId, newImage: newImageUrl,
           userName: item.userName, timestamp: item.timestamp 
         });
      }
    }

    // 5. Apply All Updates to JSON Files
    for (const [filePath, updates] of Object.entries(fileUpdates)) {
      const fileData = await fetchGithubFile(filePath);
      
      let currentContent: any = fileData ? JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8")) : {};
      if (filePath.includes("articles") && !currentContent.articles) currentContent.articles = [];
      if (filePath.includes("directory") && !currentContent.items) currentContent.items = currentContent.items || [];
      if (filePath.includes("media") && !currentContent.gallery) currentContent.gallery = { categories: [], photos: [] };
      if (filePath.includes("people") && !currentContent.people) currentContent.people = [];

      updates.forEach((u) => {
        // ADD logic
        if (u.type === "add_article") currentContent.articles.push(u.data);
        if (u.type === "add_item") currentContent.items.push(u.data);
        if (u.type === "add_photo") currentContent.gallery.photos.push(u.data);
        if (u.type === "add_person") currentContent.people.push(u.data);
        
        // EDIT text logic
        if (u.type === "text") {
           const itemDate = new Date(u.timestamp).getTime();
           
           if (filePath.includes("articles")) {
              currentContent.articles = currentContent.articles.map((a: any) => {
                 if (a.id === u.contextId) {
                   if (u.field === "Article Title") a.title = u.newValue;
                   else if (u.field === "Article Subtitle") a.subtitle = u.newValue;
                   
                   const currentDate = new Date(a.lastUpdated || "2000-01-01").getTime();
                   if (itemDate >= currentDate) {
                     a.lastUpdated = u.timestamp.split('T')[0];
                     a.lastEditedBy = u.userName;
                   }
                 }
                 return a;
              });
           }
           if (filePath.includes("people")) {
              currentContent.people = currentContent.people.map((p: any) => {
                 if (p.id === u.contextId) {
                   p[u.field.toLowerCase()] = u.newValue;
                   const currentDate = new Date(p.lastUpdated || "2000-01-01").getTime();
                   if (itemDate >= currentDate) {
                     p.lastUpdated = u.timestamp.split('T')[0];
                     p.lastEditedBy = u.userName;
                   }
                 }
                 return p;
              });
           }
           if (filePath.includes("directory")) {
              currentContent.items = currentContent.items.map((i: any) => {
                 if (i.id === u.contextId) {
                   if (u.field === "Phone Number") i.phone = u.newValue;
                   const currentDate = new Date(i.lastUpdated || "2000-01-01").getTime();
                   if (itemDate >= currentDate) {
                     i.lastUpdated = u.timestamp.split('T')[0];
                     i.lastEditedBy = u.userName;
                   }
                 }
                 return i;
              });
           }
        }

        // EDIT image logic
        if (u.type === "image_update" && filePath.includes("articles")) {
           currentContent.articles = currentContent.articles.map((a: any) => {
              if (a.id === u.contextId) {
                a.hero = u.newImage;
                const currentDate = new Date(a.lastUpdated || "2000-01-01").getTime();
                if (new Date(u.timestamp).getTime() >= currentDate) {
                  a.lastUpdated = u.timestamp.split('T')[0];
                  a.lastEditedBy = u.userName;
                }
              }
              return a;
           });
        }
      });

      filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
    }

    // 6. Add New Categories
    for (const [filePath, cats] of Object.entries(newCategories)) {
      const fileData = await fetchGithubFile(filePath);
      let currentContent: any = fileData ? JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8")) : {};
      
      if (filePath.includes("categories.json")) {
        if (!currentContent.categories) currentContent.categories = [];
        cats.forEach((cat: any) => {
          if (!currentContent.categories.find((c: any) => c.id === cat.id)) currentContent.categories.push(cat);
        });
      }
      if (filePath.includes("directory.json")) {
        if (!currentContent.categories) currentContent.categories = [];
        cats.forEach((cat: any) => {
          if (!currentContent.categories.find((c: any) => c.id === cat.id)) currentContent.categories.push(cat);
        });
      }
      if (filePath.includes("media.json")) {
        if (!currentContent.gallery) currentContent.gallery = {};
        if (!currentContent.gallery.categories) currentContent.gallery.categories = [];
        cats.forEach((cat: any) => {
          if (!currentContent.gallery.categories.find((c: any) => c.id === cat.id)) currentContent.gallery.categories.push(cat);
        });
      }
      const existingIndex = filesToCommit.findIndex(f => f.path === filePath);
      if (existingIndex !== -1) filesToCommit[existingIndex].content = JSON.stringify(currentContent, null, 2);
      else filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
    }

    // 7. Clear Queue
    queueContent.approved = [];
    const queueIndex = filesToCommit.findIndex(f => f.path === queuePath);
    if (queueIndex !== -1) filesToCommit[queueIndex].content = JSON.stringify(queueContent, null, 2);
    else filesToCommit.push({ path: queuePath, content: JSON.stringify(queueContent, null, 2) });

    await commitMultipleFiles(filesToCommit, `Batch Publish: Content & Metadata Update`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}