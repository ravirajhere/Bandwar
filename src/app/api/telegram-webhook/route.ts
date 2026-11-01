import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const data = await req.json();

    if (data.callback_query) {
      const { message, data: callbackData } = data.callback_query;
      const chatId = message.chat.id;
      const messageId = message.message_id;
      const [action, editId] = callbackData.split(":");

      if (action === "approve" || action === "reject") {
        const queuePath = "data/queue.json";
        const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${queuePath}`;
        
        const queueRes = await fetch(queueUrl, {
          headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
        });
        
        if (queueRes.ok) {
          const queueData = await queueRes.json();
          let queueContent = JSON.parse(Buffer.from(queueData.content, 'base64').toString('utf-8'));
          
          if (!queueContent.pending) queueContent.pending = [];
          if (!queueContent.approved) queueContent.approved = [];

          const itemIndex = queueContent.pending.findIndex((i: any) => i.id === editId);
          
          if (itemIndex !== -1) {
            const item = queueContent.pending[itemIndex];
            queueContent.pending.splice(itemIndex, 1);

            if (action === "approve") {
              queueContent.approved.push({ ...item, approvedVia: "Telegram" });
            }

            // Save updated queue to GitHub
            await fetch(queueUrl, {
              method: "PUT",
              headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
              body: JSON.stringify({
                message: `Telegram: ${action} ${editId}`,
                content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString('base64'),
                sha: queueData.sha
              })
            });

            // Update Telegram Message (Remove buttons)
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                reply_markup: { 
                  inline_keyboard: [[{ 
                    text: action === "approve" ? "✅ Staged for Publish (via Telegram)" : "❌ Rejected (via Telegram)", 
                    callback_data: "done" 
                  }]] 
                }
              })
            });
          }
        }
      }

      // Acknowledge Telegram
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: data.callback_query.id })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}