import { NextResponse } from "next/server";

// 🚀 Multi-file Commit (Supports Binary & Text)
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

// 🚀 Helper: GitHub se file fetch karna
async function fetchGithubFile(path: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } });
  if (!res.ok) return null;
  return await res.json();
}

// 🚀 Helper: GitHub se file delete karna
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
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

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
      
      // 🚀 Handle Image Upload (Move from pending to final)
      if (item.pendingImageUrl) {
        const pendingPath = item.pendingImageUrl.replace("/", ""); // public/images/pending/...
        const pendingFile = await fetchGithubFile(pendingPath);
        
        if (pendingFile) {
          const base64Content = pendingFile.content.replace(/\n/g, "");
          
          // Decide final path based on targetType
          let finalPath = "";
          if (item.targetType === "person") finalPath = `public/images/people/${item.contextId}.jpg`;
          else if (item.targetType === "landmark") finalPath = `public/images/landmarks/${item.contextId}.jpg`;
          else finalPath = `public/images/articles/${item.contextId}.jpg`; // default

          // Add final image to commit list
          filesToCommit.push({ path: finalPath, content: base64Content, encoding: "base64" });
          
          // Add delete to pending path (Needs handling, for now let's overwrite or just leave it. We will delete it manually to keep it simple, but let's just upload for now.)
          // Actually, deleting requires sha, we have pendingFile.sha. Let's do a separate fetch for delete.
          await deleteGithubFile(pendingPath, pendingFile.sha);

          // Add JSON update for image
          let targetJsonPath = "data/people.json"; // default
          if (item.targetType === "landmark") targetJsonPath = "data/media.json";
          // For articles, we need to search all files, which is complex in this loop. Let's just handle people and landmarks first.
          
          if (item.targetType === "person") {
             if (!fileUpdates[targetJsonPath]) fileUpdates[targetJsonPath] = [];
             fileUpdates[targetJsonPath].push({ type: "image", contextId: item.contextId, newPhoto: `/${finalPath.replace("public/", "")}` });
          }
        }
      }

      // 🚀 Handle Text Edits
      if (item.field && item.newValue) {
        // We assume item.filePath is correctly set from telegram-submit
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
          // Update Person Image
          if (u.type === "image" && filePath.includes("people.json")) {
             currentContent.people = currentContent.people.map((p: any) => {
               if (p.id === u.contextId) p.photo = u.newPhoto;
               return p;
             });
          }
          // Update Landmark Image
          else if (u.type === "image" && filePath.includes("media.json")) {
             currentContent.landmarks = currentContent.landmarks.map((l: any) => {
               if (l.id === u.contextId) l.photo = u.newPhoto;
               return l;
             });
          }
          // Update Text (Title, Bio, Paragraph, etc)
          else if (u.type === "text") {
             if (filePath.includes("people.json")) {
                currentContent.people = currentContent.people.map((p: any) => {
                  if (p.id === u.contextId) p[u.field.toLowerCase()] = u.newValue;
                  return p;
                });
             }
             // Add logic for articles if needed
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