import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Telegram credentials missing" }, { status: 500 });
    }

    // Form data se fields nikalna
    const type = formData.get("type") as string;
    const imageFile = formData.get("image") as File | null;

    // Message format banana
    let caption = `<b>✨ New ${type.toUpperCase()} Submission</b>\n<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    
    formData.forEach((value, key) => {
      if (key !== "type" && key !== "image" && typeof value === "string" && value.trim() !== "") {
        caption += `<b>${key}:</b>\n${value}\n\n`;
      }
    });

    // Agar image hai, toh sendPhoto use karenge
    if (imageFile && imageFile.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append("chat_id", chatId);
      photoFormData.append("caption", caption);
      photoFormData.append("parse_mode", "HTML");
      
      // Image ko Telegram par bhejne ke liye
      photoFormData.append("photo", imageFile, imageFile.name);

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: photoFormData,
      });

      const data = await response.json();
      if (!data.ok) {
        console.error("Telegram sendPhoto error:", data);
        return NextResponse.json({ error: "Telegram API failed", details: data.description }, { status: 500 });
      }
    } else {
      // Agar image nahi hai, toh sirf text message bhejenge
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: caption,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        console.error("Telegram sendMessage error:", data);
        return NextResponse.json({ error: "Telegram API failed", details: data.description }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}