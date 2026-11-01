import { NextResponse } from "next/server";

async function commitMultipleFiles(files: { path: string; content: string }[], message: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const branch = "main";

  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers: { Authorization: `Bearer ${token}` } });
  const ref = await refRes.json();
  
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${ref.object.sha}`, { headers: { Authorization: `Bearer ${token}` } });
  const commit = await commitRes.json();
  
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
    body: JSON.stringify({ base_tree: commit.tree.sha, tree })
  });
  const newTree = await treeRes.json();

  const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] })
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
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const queuePath = "data/queue.json";
    const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${queuePath}`;
    
    const queueRes = await fetch(queueUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } });
    const queueData = await queueRes.json();
    let queueContent = JSON.parse(Buffer.from(queueData.content, 'base64').toString('utf-8'));

    if (!queueContent.approved || queueContent.approved.length === 0) {
      return NextResponse.json({ error: "No approved items to publish." }, { status: 400 });
    }

    const fileUpdates: Record<string, any[]> = {};
    queueContent.approved.forEach((item: any) => {
      if (!fileUpdates[item.filePath]) fileUpdates[item.filePath] = [];
      fileUpdates[item.filePath].push(item);
    });

    const filesToCommit = [];

    for (const [filePath, items] of Object.entries(fileUpdates)) {
      const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
      const fileRes = await fetch(getFileUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } });
      
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        let currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

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

    // Update Telegram Messages for all published items
    await Promise.all(queueContent.approved.map(async (item: any) => {
      if (item.telegramMessageId && item.chatId) {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: item.chatId,
            message_id: item.telegramMessageId,
            reply_markup: { 
              inline_keyboard: [[{ 
                text: "🚀 Published Live on Website", 
                callback_data: "done" 
              }]] 
            }
          })
        });
      }
    }));

    queueContent.approved = [];
    filesToCommit.push({ path: queuePath, content: JSON.stringify(queueContent, null, 2) });

    const commitMsg = `Batch Publish: ${filesToCommit.length - 1} file(s) updated`;
    await commitMultipleFiles(filesToCommit, commitMsg);

    return NextResponse.json({ success: true, count: filesToCommit.length - 1 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}