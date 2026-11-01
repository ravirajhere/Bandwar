import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const { editId, action } = await req.json();
    const queuePath = "data/queue.json";

    // 1. Fetch Queue
    const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${queuePath}`;
    const queueRes = await fetch(queueUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
    });
    const queueData = await queueRes.json();
    const queueContent = JSON.parse(Buffer.from(queueData.content, 'base64').toString('utf-8'));

    // 2. Find Item
    const itemToProcess = queueContent.pending.find((i: any) => i.id === editId);
    if (!itemToProcess) throw new Error("Item not found in queue");

    // 3. If APPROVE, update the target file (using the logic we built earlier)
    if (action === "approve") {
      const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${itemToProcess.filePath}`;
      const fileRes = await fetch(getFileUrl, {
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
      });
      
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        let currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
        
        // Update Logic (Same as webhook)
        const { contextId, intent, jsonObj, filePath } = itemToProcess;
        
        if (filePath.includes("people.json") && intent === "edit") {
          currentContent.people = currentContent.people.map((p: any) => {
            if (p.id === contextId) p[jsonObj.field.toLowerCase()] = jsonObj.suggestedValue;
            return p;
          });
        }
        // ... (Add other file logic here as we did in webhook)
        
        // Commit updated target file
        await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
          body: JSON.stringify({
            message: `Dashboard Approved: Update ${contextId}`,
            content: Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64'),
            sha: fileData.sha
          })
        });
      }
    }

    // 4. Remove item from queue
    queueContent.pending = queueContent.pending.filter((i: any) => i.id !== editId);

    // Commit updated queue
    await fetch(queueUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `Queue Update: ${action} ${editId}`,
        content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString('base64'),
        sha: queueData.sha
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}