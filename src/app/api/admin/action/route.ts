import { NextResponse } from "next/server";

// 🚀 Helper: GitHub se file delete karna
async function deleteGithubFile(path: string) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  
  try {
    // Pehle file ka SHA nikalna padega delete karne ke liye
    const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
    });

    if (!getRes.ok) return; // Agar file pehle se nahi hai toh kuch mat karo

    const fileData = await getRes.json();

    // Ab file delete karo
    const deleteUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    await fetch(deleteUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `Delete rejected image: ${path}`,
        sha: fileData.sha
      })
    });
  } catch (error) {
    console.error("Failed to delete file from GitHub:", error);
  }
}

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const { editId, action } = await req.json();
    const queuePath = "data/queue.json";

    const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${queuePath}`;
    const queueRes = await fetch(queueUrl, { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" } });
    
    const queueData = await queueRes.json();
    let queueContent = JSON.parse(Buffer.from(queueData.content, 'base64').toString('utf-8'));

    if (!queueContent.pending) queueContent.pending = [];
    if (!queueContent.approved) queueContent.approved = [];

    const itemIndex = queueContent.pending.findIndex((i: any) => i.id === editId);
    if (itemIndex === -1) throw new Error("Item not found");

    const item = queueContent.pending[itemIndex];
    queueContent.pending.splice(itemIndex, 1);

    // 🚀 AGAR REJECT HUA HAI AUR IMAGE THI, TOH GITHUB SE DELETE KARO
    if (action === "reject" && item.pendingImageUrl) {
      // item.pendingImageUrl hota hai "/images/pending/edit_123.jpg"
      // GitHub path hota hai "public/images/pending/edit_123.jpg"
      const filePathToDelete = `public${item.pendingImageUrl}`;
      await deleteGithubFile(filePathToDelete);
    }

    // Agar Approve hua hai, toh approved list mein daalo
    if (action === "approve") {
      queueContent.approved.push({ ...item, approvedVia: "Dashboard" });
    }

    // Update Queue JSON
    await fetch(queueUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `Dashboard: ${action} ${editId}`,
        content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString('base64'),
        sha: queueData.sha
      })
    });

    // Telegram Message Update (Sync)
    if (item.telegramMessageId && item.chatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: item.chatId,
          message_id: item.telegramMessageId,
          reply_markup: { 
            inline_keyboard: [[{ 
              text: action === "approve" ? "✅ Staged via Dashboard" : "❌ Rejected via Dashboard", 
              callback_data: "done" 
            }]] 
          }
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}