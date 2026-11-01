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
      const callbackData = callbackQuery.data; // e.g. "approve:contextId"
      const originalText = callbackQuery.message.text || callbackQuery.message.caption;

      const [action, contextId] = callbackData.split(":");

      if (action === "approve") {
        // 1. Telegram ko dikhao ki approve ho gaya
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [[{ text: "✅ Approved & Published", callback_data: "done" }]] }
          })
        });

        // 2. Extract JSON from the message
        // Message ke andar JSON '<pre> ... </pre>' ke beech mein hai
        const jsonMatch = originalText.match(/<pre>([\s\S]*?)<\/pre>/);
        
        if (jsonMatch && jsonMatch[1]) {
          const jsonString = jsonMatch[1];
          // Yahan hum GitHub API call karenge (Filhaal isko console log kar rahe hain)
          console.log("JSON TO SAVE:", jsonString);
          
          // TODO: GitHub API logic to update file will go here
          // For now, let's just let the user know it worked.
        }

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

      // Telegram ko batana ki action complete ho gaya
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