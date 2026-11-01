import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const data = await req.json();

    if (data.callback_query) {
      const callbackQuery = data.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const callbackData = callbackQuery.data; 
      const originalText = callbackQuery.message.text || callbackQuery.message.caption || "";

      const [action, contextId] = callbackData.split(":");

      if (action === "approve") {
        // 1. Message se file path aur JSON data nikalo
        const filePathMatch = originalText.match(/Target File:<\/b> <code>(.*?)<\/code>/);
        const jsonBase64Match = originalText.match(/JSON PAYLOAD \(Base64\):<\/b>\n<code>(.*?)<\/code>/);

        if (filePathMatch && jsonBase64Match) {
          const filePath = filePathMatch[1];
          const jsonObj = JSON.parse(Buffer.from(jsonBase64Match[1], 'base64').toString('utf-8'));

          // 2. GitHub API se current file fetch karo
          const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
          const fileRes = await fetch(getFileUrl, {
            headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
          });
          
          if (fileRes.ok) {
            const fileData = await fileRes.json();
            const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
            
            // 3. Update Logic (Ye example hai, aap ise apne hisaab se modify kar sakte hain)
            let updatedContent = JSON.stringify({ ...currentContent, ...jsonObj }, null, 2);

            // 4. Push back to GitHub
            const putFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
            await fetch(putFileUrl, {
              method: "PUT",
              headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
              body: JSON.stringify({
                message: `Auto-Approved: Update ${contextId} via Telegram Bot`,
                content: Buffer.from(updatedContent).toString('base64'),
                sha: fileData.sha
              })
            });
          }
        }

        // 5. Telegram ko batado ki ho gaya
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

      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQuery.id, text: `Action: ${action}` })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}