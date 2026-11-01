import { NextResponse } from "next/server";

// 🚀 HELPER: Multiple Files ko ek hi Commit mein push karne ke liye
async function commitMultipleFiles(files: { path: string; content: string }[], message: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const branch = "main";

  // 1. Get latest commit SHA
  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers: { Authorization: `Bearer ${token}` } });
  const ref = await refRes.json();
  const commitSha = ref.object.sha;

  // 2. Get base tree
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`, { headers: { Authorization: `Bearer ${token}` } });
  const commit = await commitRes.json();
  const baseTreeSha = commit.tree.sha;

  // 3. Create blobs for each file
  const tree = await Promise.all(files.map(async (f) => {
    const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: f.content, encoding: "utf-8" })
    });
    const blob = await blobRes.json();
    return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  // 4. Create new tree
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree })
  });
  const newTree = await treeRes.json();

  // 5. Create commit
  const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message, tree: newTree.sha, parents: [commitSha] })
  });
  const newCommit = await newCommitRes.json();

  // 6. Update branch reference
  await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sha: newCommit.sha })
  });
}

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const { editId, action } = await req.json();
    const queuePath = "data/queue.json";

    // 1. Fetch Queue file from GitHub
    const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${queuePath}`;
    const queueRes = await fetch(queueUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
    });
    const queueData = await queueRes.json();
    const queueContent = JSON.parse(Buffer.from(queueData.content, 'base64').toString('utf-8'));

    // 2. Find Item
    const itemToProcess = queueContent.pending.find((i: any) => i.id === editId);
    if (!itemToProcess) throw new Error("Item not found in queue");

    const filesToCommit = []; // Isme hum saari files push karenge

    // 3. If APPROVE, target file update karo
    if (action === "approve") {
      const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${itemToProcess.filePath}`;
      const fileRes = await fetch(getFileUrl, {
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
      });
      
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        let currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
        const { contextId, intent, jsonObj, filePath } = itemToProcess;
        
        // --- UPDATE LOGIC (Same as webhook) ---
        if (filePath.includes("people.json") && intent === "edit") {
          currentContent.people = currentContent.people.map((p: any) => {
            if (p.id === contextId) p[jsonObj.field.toLowerCase()] = jsonObj.suggestedValue;
            return p;
          });
        }
        // (Baaki files ka logic yahan aayega)
        
        // Target file ko list mein daalo
        filesToCommit.push({ path: filePath, content: JSON.stringify(currentContent, null, 2) });
      }
    }

    // 4. Queue se item hatao
    queueContent.pending = queueContent.pending.filter((i: any) => i.id !== editId);
    // Queue file ko list mein daalo
    filesToCommit.push({ path: queuePath, content: JSON.stringify(queueContent, null, 2) });

    // 5. 🚀 EK HI COMMIT MEIN DONO FILES PUSH KARO
    await commitMultipleFiles(filesToCommit, `Dashboard: ${action} ${editId} (${itemToProcess.contextId})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}