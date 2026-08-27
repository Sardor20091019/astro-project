/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      const [action, photoIdStr] = callbackData.split("_");
      const photoId = Number(photoIdStr);

      if ((action === "approve" || action === "reject") && Number.isInteger(photoId)) {
        const structuralStatus = action === "approve" ? "APPROVED" : "REJECTED";

        await db
          .updateTable("Photo")
          .set({ status: structuralStatus as any })
          .where("id", "=", photoId)
          .execute();

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