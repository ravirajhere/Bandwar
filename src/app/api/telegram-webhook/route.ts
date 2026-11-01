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
        // 1. Extract File Path and Base64 Payload
        const filePathMatch = originalText.match(/Target File:\s*([^\n]+)/);
        const jsonBase64Match = originalText.match(/PAYLOAD:\s*\n([^\n]+)/);

        if (filePathMatch && jsonBase64Match) {
          const filePath = filePathMatch[1].trim();
          const payload = JSON.parse(Buffer.from(jsonBase64Match[1].trim(), 'base64').toString('utf-8'));

          // 2. Fetch current file from GitHub
          const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
          const fileRes = await fetch(getFileUrl, {
            headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
          });
          
          if (!fileRes.ok) throw new Error(`GitHub GET failed: ${fileRes.status}`);

          const fileData = await fileRes.json();
          let currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
          let updatedContent = currentContent;
          const { intent, jsonObj } = payload;

          // 3. 🧠 UNIVERSAL UPDATE LOGIC (For All Files)
          
          // --- A. PEOPLE.JSON ---
          if (filePath.includes("people.json")) {
            if (intent === "edit") {
              updatedContent.people = updatedContent.people.map((p: any) => {
                if (p.id === contextId) p[jsonObj.field.toLowerCase()] = jsonObj.suggestedValue;
                return p;
              });
            } else if (intent === "add") {
              const newId = jsonObj["Full Name"]?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-bandwar";
              updatedContent.people.push({ id: newId, name: jsonObj["Full Name"], role: jsonObj["Role"], bio: jsonObj["Biography"], dob: jsonObj["Date of Birth"], deathDate: jsonObj["Date of Death"] });
            }
          }

          // --- B. DIRECTORY.JSON ---
          else if (filePath.includes("directory.json")) {
            if (intent === "edit") {
              updatedContent.items = updatedContent.items.map((item: any) => {
                // Agar phone update ho raha hai
                if (item.id === contextId) {
                  item.phone = jsonObj.suggestedValue;
                  item.lastUpdated = new Date().toISOString().split('T')[0];
                }
                return item;
              });
            }
          }

          // --- C. MEDIA.JSON (Landmarks) ---
          else if (filePath.includes("media.json")) {
            if (intent === "add") {
              // Naya Landmark add karna
              const newId = jsonObj["Landmark Name"]?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
              updatedContent.landmarks.push({
                id: newId,
                name: jsonObj["Landmark Name"],
                category: jsonObj["Category"],
                description: jsonObj["Description"] || "",
                lat: parseFloat(jsonObj["latitude"]),
                lng: parseFloat(jsonObj["longitude"]),
                icon: "📍"
              });
            } else if (intent === "edit") {
              // Location update karna
              updatedContent.landmarks = updatedContent.landmarks.map((l: any) => {
                if (l.id === contextId) {
                  l.lat = parseFloat(jsonObj.new_lat);
                  l.lng = parseFloat(jsonObj.new_lng);
                }
                return l;
              });
            }
          }

          // --- D. ARTICLES (*.json) ---
          else if (filePath.includes("articles/")) {
            if (intent === "edit") {
              updatedContent.articles = updatedContent.articles.map((article: any) => {
                if (article.id === contextId) {
                  // Agar Title/Summary edit ho raha hai
                  if (jsonObj.field === "Article Title") article.title = jsonObj.suggestedValue;
                  else if (jsonObj.field === "Article Summary") article.summary = jsonObj.suggestedValue;
                  // Agar koi specific paragraph edit ho raha hai (e.g., field name is "Paragraph: History")
                  else if (jsonObj.field.startsWith("Paragraph: ")) {
                    const headingName = jsonObj.field.replace("Paragraph: ", "");
                    article.content = article.content.map((block: any) => {
                      if (block.heading === headingName) {
                        block.text = jsonObj.suggestedValue;
                      }
                      return block;
                    });
                  }
                  article.lastUpdated = new Date().toISOString().split('T')[0];
                }
                return article;
              });
            }
          }

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

          if (!putRes.ok) throw new Error(`GitHub PUT failed: ${putRes.status}`);
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
        // Reject Logic...
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
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `❌ Webhook Error: ${error.message}` })
    });
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}