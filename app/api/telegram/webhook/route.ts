import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

interface TelegramWebhookBody {
  callback_query?: {
    id: string;
    data?: string;
    message?: {
      chat: {
        id: number;
      };
      message_id: number;
    };
  };
}

export async function POST(req: NextRequest) {
  const configuredSecret =
    process.env.TELEGRAM_WEBHOOK_SECRET || process.env.INTERNAL_API_SECRET;

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 403 },
    );
  }

  const secretToken = req.headers.get("x-telegram-bot-api-secret-token");

  const isMatch =
    typeof secretToken === "string" &&
    Buffer.byteLength(secretToken) === Buffer.byteLength(configuredSecret) &&
    crypto.timingSafeEqual(
      Buffer.from(secretToken),
      Buffer.from(configuredSecret),
    );

  if (!isMatch) {
    return NextResponse.json(
      { error: "Invalid Telegram webhook token" },
      { status: 403 },
    );
  }

  try {
    const body = (await req.json()) as TelegramWebhookBody;

    if (body?.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data;
      const chatId = callbackQuery.message?.chat.id;
      const messageId = callbackQuery.message?.message_id;

      if (!callbackData || !chatId || !messageId) {
        return NextResponse.json({ ok: true });
      }

      const [action, photoIdStr] = callbackData.split("_");
      const photoId = Number(photoIdStr);

      if (
        (action === "approve" || action === "reject") &&
        Number.isInteger(photoId)
      ) {
        const structuralStatus: "APPROVED" | "PENDING" =
          action === "approve" ? "APPROVED" : "PENDING";

        await db
          .updateTable("Photo")
          .set({ status: structuralStatus })
          .where("id", "=", photoId)
          .execute();

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const confirmationMessageText = `Update Complete: Image database entry status updated to ${structuralStatus}.`;

        if (botToken) {
          await fetch(
            `https://api.telegram.org/bot${botToken}/editMessageText`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: confirmationMessageText,
              }),
            },
          ).catch(() => {});

          await fetch(
            `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                callback_query_id: callbackQuery.id,
                text: `Entry status saved as ${structuralStatus}.`,
              }),
            },
          ).catch(() => {});
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Critical Telegram Webhook Failure Context:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

