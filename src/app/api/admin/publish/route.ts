import { NextResponse } from "next/server";

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

    // ==========================================
    // 1. PROCESS ALL APPROVED ITEMS
    // ==========================================
    for (const item of queueContent.approved) {
      
      // 🚀 AUTO-CORRECTION: Verify filePath is correct
      if (item.targetType === "article" && item.intent !== "add" && item.contextId) {
        const currentFile = await fetchGithubFile(item.filePath);
        let foundCorrect = false;
        
        if (currentFile) {
          const cc = JSON.parse(Buffer.from(currentFile.content, "base64").toString("utf-8"));
          if (cc.articles?.some((a: any) => a.id === item.contextId)) foundCorrect = true;
        }
        
        if (!foundCorrect) {
          const articleCats = ["culture", "education", "geography", "health", "infrastructure", "landmarks", "religion", "history"];
          for (const cat of articleCats) {
            const testPath = `data/articles/${cat}.json`;
            if (testPath === item.filePath) continue;
            const fd = await fetchGithubFile(testPath);
            if (fd) {
              const cc = JSON.parse(Buffer.from(fd.content, "base64").toString("utf-8"));
              if (cc.articles?.some((a: any) => a.id === item.contextId)) {
                item.filePath = testPath;
                break;
              }
            }
          }
        }
      }

      let newImageUrl = "";

      // Handle Image Upload (Move to final destination)
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

      // Handle New Categories
      if (item.customCategory && item.jsonObj?.Category) {
        const catId = item.jsonObj.Category;
        let catFile = "data/categories.json";
        if (item.targetType === "directory") catFile = "data/directory.json";
        else if (item.targetType === "image") catFile = "data/media.json";

        if (!newCategories[catFile]) newCategories[catFile] = [];
        newCategories[catFile].push({ id: catId, title: item.customCategory, icon: "📁", description: "User contributed" });
      }

      // Push item to fileUpdates for later processing
      if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
      fileUpdates[item.filePath].push({ ...item, newImageUrl });
    }

    // ==========================================
    // 2. APPLY UPDATES TO TARGET JSON FILES
    // ==========================================
    for (const [filePath, updates] of Object.entries(fileUpdates)) {
      const fileData = await fetchGithubFile(filePath);
      
      let currentContent: any = fileData ? JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8")) : {};
      
      if (filePath.includes("articles") && !currentContent.articles) currentContent.articles = [];
      if (filePath.includes("directory") && !currentContent.items) currentContent.items = currentContent.items || [];
      if (filePath.includes("media") && !currentContent.gallery) currentContent.gallery = { categories: [], photos: [] };
      if (filePath.includes("media") && !currentContent.landmarks) currentContent.landmarks = [];
      if (filePath.includes("people") && !currentContent.people) currentContent.people = [];

      for (const u of updates) {
        const itemDate = new Date(u.timestamp).getTime();

        // A. NEW ARTICLE
        if (u.targetType === "article" && u.intent === "add") {
          const data = u.jsonObj;
          const newArticle = {
            id: u.contextId,
            title: data["Article Title"] || "Untitled",
            subtitle: "New contribution",
            summary: data["Story"] ? data["Story"].slice(0, 150) + "..." : "",
            categories: [data.Category || "general"],
            content: [{ heading: "Overview", text: data["Story"] || "" }],
            hero: u.newImageUrl || null,
            lastUpdated: u.timestamp.split('T')[0],
            lastEditedBy: u.userName
          };
          currentContent.articles.push(newArticle);
        }

        // B. NEW PERSON
        else if (u.targetType === "person" && u.intent === "add") {
          const data = u.jsonObj;
          const newPerson = {
            id: u.contextId,
            name: data["Full Name"] || "Unknown",
            role: data["Role"] || "",
            bio: data["Biography"] || "",
            dob: data["Date of Birth"] || "",
            deathDate: data["Date of Death"] || "",
            photo: u.newImageUrl || "",
            lastUpdated: u.timestamp.split('T')[0],
            lastEditedBy: u.userName
          };
          currentContent.people.push(newPerson);
        }

        // C. NEW DIRECTORY ITEM
        else if (u.targetType === "directory" && u.intent === "add") {
          const data = u.jsonObj;
          const newItem = {
            id: u.contextId,
            name: data["Name"] || "Unknown",
            categoryId: data.Category || "general",
            phone: data["Phone Number"] || "",
            address: data["Address"] || "",
            isEmergency: false,
            lastUpdated: u.timestamp.split('T')[0],
            lastEditedBy: u.userName
          };
          currentContent.items.push(newItem);
        }

        // D. NEW GALLERY PHOTO
        else if (u.targetType === "image" && u.intent === "add") {
          const data = u.jsonObj;
          const newPhoto = {
            id: u.contextId,
            src: u.newImageUrl || "/icon.png",
            caption: data["Photo Title"] || "New Photo",
            category: data.Category || "general",
            year: data["Year"] || new Date().getFullYear().toString()
          };
          currentContent.gallery.photos.push(newPhoto);
        }

        // E. EXISTING ARTICLE UPDATES
        else if (filePath.includes("articles")) {
          currentContent.articles = currentContent.articles.map((a: any) => {
            if (a.id === u.contextId) {
              
              if (u.intent === "image_update") a.hero = u.newImageUrl;
              
              if (u.intent === "edit") {
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
                else if (u.field.startsWith("Infobox: ")) {
                  const infoKey = u.field.replace("Infobox: ", "");
                  if (a.infobox) a.infobox[infoKey] = u.newValue;
                }
              }

              const currentDate = new Date(a.lastUpdated || "2000-01-01").getTime();
              if (itemDate >= currentDate) {
                a.lastUpdated = u.timestamp.split('T')[0];
                a.lastEditedBy = u.userName;
              }
            }
            return a;
          });
        }

        // F. EXISTING PERSON UPDATES
        else if (filePath.includes("people")) {
          currentContent.people = currentContent.people.map((p: any) => {
            if (p.id === u.contextId) {
              
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

              const currentDate = new Date(p.lastUpdated || "2000-01-01").getTime();
              if (itemDate >= currentDate) {
                p.lastUpdated = u.timestamp.split('T')[0];
                p.lastEditedBy = u.userName;
              }
            }
            return p;
          });
        }

        // G. EXISTING DIRECTORY UPDATES
        else if (filePath.includes("directory")) {
          currentContent.items = currentContent.items.map((i: any) => {
            if (i.id === u.contextId) {
              if (u.intent === "edit") {
                if (u.field === "Phone Number") i.phone = u.newValue;
                else if (u.field === "Address") i.address = u.newValue;
                else if (u.field === "Timing") i.timing = u.newValue;
              }

              const currentDate = new Date(i.lastUpdated || "2000-01-01").getTime();
              if (itemDate >= currentDate) {
                i.lastUpdated = u.timestamp.split('T')[0];
                i.lastEditedBy = u.userName;
              }
            }
            return i;
          });
        }

        // H. EXISTING LANDMARK UPDATES
        else if (filePath.includes("media.json")) {
          currentContent.landmarks = currentContent.landmarks.map((l: any) => {
            if (l.id === u.contextId) {
              if (u.intent === "edit" && u.field === "Coordinates") {
                const parts = u.newValue.split(",");
                if (parts.length === 2) {
                   l.lat = parseFloat(parts[0].trim());
                   l.lng = parseFloat(parts[1].trim());
                }
              }
            }
            return l;
          });
        }
      }

      filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
    }

    // ==========================================
    // 3. ADD NEW CATEGORIES
    // ==========================================
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

    // ==========================================
    // 4. CLEAR QUEUE & COMMIT
    // ==========================================
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