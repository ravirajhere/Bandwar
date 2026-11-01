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
      const originalText = message.text || message.caption || "";

      const [action, contextId] = callbackData.split(":");

      if (action === "approve") {
        // 1. Extract File Path and Base64 JSON
        const filePathMatch = originalText.match(/Target File:<\/b> <code>(.*?)<\/code>/);
        const jsonBase64Match = originalText.match(/PAYLOAD:<\/b>\n<code>(.*?)<\/code>/);

        if (filePathMatch && jsonBase64Match) {
          const filePath = filePathMatch[1];
          const payload = JSON.parse(Buffer.from(jsonBase64Match[1], 'base64').toString('utf-8'));

          // 2. Fetch current file from GitHub
          const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
          const fileRes = await fetch(getFileUrl, {
            headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
          });
          
          if (!fileRes.ok) {
             throw new Error(`GitHub GET failed: ${fileRes.status} ${await fileRes.text()}`);
          }

          const fileData = await fileRes.json();
          let currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
          let updatedContent = currentContent;

          // 3. UPDATE LOGIC (For People.json)
          const { intent, jsonObj } = payload;
          
          if (filePath.includes("people.json")) {
            if (intent === "edit") {
              updatedContent.people = updatedContent.people.map((p: any) => {
                if (p.id === contextId) {
                  // Dynamic field update
                  p[jsonObj.field.toLowerCase()] = jsonObj.suggestedValue; 
                  p.lastEditedBy = "Verified Editor";
                }
                return p;
              });
            }
          }
          // You can add more file types here (directory.json, media.json, etc.)

          // 4. Commit back to GitHub
          const putFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
          const putRes = await fetch(putFileUrl, {
            method: "PUT",
            headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
            body: JSON.stringify({
              message: `Auto-Approved: Update ${contextId} via Telegram`,
              content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
              sha: fileData.sha
            })
          });

          if (!putRes.ok) {
            const errorText = await putRes.text();
            throw new Error(`GitHub PUT failed: ${putRes.status} ${errorText}`);
          }
        }

        // 5. Update Telegram Message (Success)
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [[{ text: "✅ Approved & Published", callback_data: "done" }]] }
          })
        });

      } else if (action === "reject") {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [[{ text: "❌ Rejected", callback_data: "done" }]] }
          })
        });
      }

      // Acknowledge Telegram
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: data.callback_query.id })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    // Agar error aata hai, to Telegram par message bhejenge debug ke liye
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `❌ Webhook Error: ${error.message}` })
    });
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}