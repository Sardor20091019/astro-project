import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PhotoStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Intercept Telegram Inline Button Interactions (Callback Queries)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data; // Formatted as "approve_id" or "reject_id"
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      const [action, photoId] = callbackData.split("_");

      if ((action === "approve" || action === "reject") && photoId) {
        const structuralStatus: PhotoStatus = action === "approve" ? PhotoStatus.APPROVED : ("REJECTED" as PhotoStatus);

        // 1. Mutate operational database record status state
        await prisma.photo.update({
          where: { id: photoId },
          data: { status: structuralStatus },
        });

        // 2. Transmit confirmation updates directly back to the active conversation UI
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const confirmationMessageText = `✅ Update Complete: Image database entry status updated to ${structuralStatus}.`;

        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: confirmationMessageText,
          }),
        });

        // 3. Close out loading latency states on mobile interfaces
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: `Entry status saved as ${structuralStatus}.`,
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Critical Telegram Webhook Failure Context:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}