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
          
          if (fileRes.ok) {
            const fileData = await fileRes.json();
            let currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
            let updatedContent = currentContent;

            // 3. 🚀 THE MAGIC UPDATE LOGIC 🚀
            const { intent, jsonObj } = payload;

            if (filePath.includes("people.json")) {
              if (intent === "edit") {
                // Find person in array and update field
                updatedContent.people = updatedContent.people.map((p: any) => {
                  if (p.id === contextId) {
                    p[jsonObj.field.toLowerCase()] = jsonObj.suggestedValue; 
                    p.lastEditedBy = "Verified Editor";
                  }
                  return p;
                });
              } else if (intent === "add") {
                // Add new person
                const newId = jsonObj["Full Name"]?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-bandwar";
                updatedContent.people.push({
                  id: newId,
                  name: jsonObj["Full Name"],
                  role: jsonObj["Role"],
                  bio: jsonObj["Biography"],
                  dob: jsonObj["Date of Birth"],
                  deathDate: jsonObj["Date of Death"]
                });
              }
            } 
            else if (filePath.includes("directory.json")) {
               if (intent === "edit") {
                updatedContent.items = updatedContent.items.map((item: any) => {
                  if (item.id === contextId) {
                    item.phone = jsonObj.suggestedValue; // Assuming phone update
                    item.lastEditedBy = "Verified Editor";
                  }
                  return item;
                });
              }
            }
            // Add more file types here (media.json, articles, etc.)

            // 4. Commit back to GitHub
            const putFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
            await fetch(putFileUrl, {
              method: "PUT",
              headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
              body: JSON.stringify({
                message: `Auto-Approved: Update ${contextId} via Telegram`,
                content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
                sha: fileData.sha
              })
            });
          }
        }

        // Update Telegram Message
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
        body: JSON.stringify({ callback_query_id: data.callback_query.id })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}