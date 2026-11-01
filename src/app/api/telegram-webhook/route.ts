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
        // ✅ FIX: Ab hum bina tags ke data extract kar rahe hain
        // Ye code plain text mein se "Target File: data/people.json" utha lega
        const filePathMatch = originalText.match(/Target File:\s*([^\n]+)/);
        
        // Ye code "📋 PAYLOAD:" ke baad wali line utha lega
        const jsonBase64Match = originalText.match(/PAYLOAD:\s*\n([^\n]+)/);

        if (filePathMatch && jsonBase64Match) {
          const filePath = filePathMatch[1].trim();
          const jsonBase64 = jsonBase64Match[1].trim();
          
          const payload = JSON.parse(Buffer.from(jsonBase64, 'base64').toString('utf-8'));

          // 1. Fetch current file from GitHub
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
          const { intent, jsonObj } = payload;

          // 2. UPDATE LOGIC
          if (filePath.includes("people.json")) {
            if (intent === "edit") {
              updatedContent.people = updatedContent.people.map((p: any) => {
                if (p.id === contextId) {
                  // Update the specific field (e.g., role -> suggestedValue)
                  p[jsonObj.field.toLowerCase()] = jsonObj.suggestedValue; 
                  p.lastEditedBy = "Verified Editor (Telegram)";
                }
                return p;
              });
            } else if (intent === "add") {
               // Add logic for new person
               const newId = jsonObj["Full Name"]?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-bandwar";
               updatedContent.people.push({
                 id: newId,
                 name: jsonObj["Full Name"],
                 role: jsonObj["Role"],
                 bio: jsonObj["Biography"],
                 dob: jsonObj["Date of Birth"],
                 deathDate: jsonObj["Date of Death"],
                 lastEditedBy: "Verified Editor (Telegram)"
               });
            }
          }

          // 3. Commit back to GitHub
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
        } else {
          // Agar regex fail hota hai, toh error throw karo taaki pata chale
          throw new Error("Data extraction failed. Could not find file path or payload.");
        }

        // 4. Update Telegram Message (Success)
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
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    
    // Agar error aata hai, to Telegram par message bhejenge debug ke liye
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `❌ Webhook Error: ${error.message}` })
    });

    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}