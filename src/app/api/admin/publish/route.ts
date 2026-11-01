import { NextResponse } from "next/server";

// 🚀 Multi-file commit logic
async function commitMultipleFiles(files: { path: string; content: string }[], message: string) {
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
      body: JSON.stringify({ content: f.content, encoding: "utf-8" })
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

export async function POST() {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const queuePath = "data/queue.json";
    const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${queuePath}`;
    
    // 1. Fetch Queue
    const queueRes = await fetch(queueUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } });
    const queueData = await queueRes.json();
    let queueContent = JSON.parse(Buffer.from(queueData.content, 'base64').toString('utf-8'));

    if (!queueContent.approved || queueContent.approved.length === 0) {
      return NextResponse.json({ error: "No approved items to publish." }, { status: 400 });
    }

    // 2. Group edits by file to avoid fetching same file multiple times
    const fileUpdates: Record<string, any[]> = {};
    queueContent.approved.forEach((item: any) => {
      if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
      fileUpdates[item.filePath].push(item);
    });

    const filesToCommit = [];

    // 3. Process each file
    for (const [filePath, items] of Object.entries(fileUpdates)) {
      const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
      const fileRes = await fetch(getFileUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } });
      
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        let currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

        // Apply all edits for this file
        items.forEach((item) => {
          const { contextId, intent, jsonObj } = item;
          
          if (filePath.includes("people.json") && intent === "edit") {
            currentContent.people = currentContent.people.map((p: any) => {
              if (p.id === contextId) p[jsonObj.field.toLowerCase()] = jsonObj.suggestedValue;
              return p;
            });
          }
          // Add logic for directory, media, articles here...
        });

        filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
      }
    }

    // 4. Clear approved list
    queueContent.approved = [];
    filesToCommit.push({ path: queuePath, content: JSON.stringify(queueContent, null, 2) });

    // 5. 🚀 PUSH EVERYTHING IN ONE COMMIT
    const commitMsg = `Batch Publish: ${filesToCommit.length - 1} file(s) updated from Dashboard`;
    await commitMultipleFiles(filesToCommit, commitMsg);

    return NextResponse.json({ success: true, count: filesToCommit.length - 1 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}