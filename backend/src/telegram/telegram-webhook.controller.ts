import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { KyselyService } from '../database/kysely.service';

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

@Controller('telegram-webhook')
export class TelegramWebhookController {
  constructor(private readonly db: KyselyService) {}

  @Post()
  async handleWebhook(
    @Body() body: TelegramWebhookBody,
    @Headers('x-telegram-bot-api-secret-token') secretHeader?: string,
  ) {
    const expectedSecret =
      process.env.TELEGRAM_WEBHOOK_SECRET ||
      (process.env.TELEGRAM_BOT_TOKEN
        ? crypto
            .createHash('sha256')
            .update(process.env.TELEGRAM_BOT_TOKEN)
            .digest('hex')
            .slice(0, 32)
        : null);

    if (expectedSecret) {
      if (!secretHeader) {
        throw new UnauthorizedException('Missing Telegram webhook secret token');
      }

      const secretBuffer = Buffer.from(secretHeader);
      const expectedBuffer = Buffer.from(expectedSecret);

      if (
        secretBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(secretBuffer, expectedBuffer)
      ) {
        throw new UnauthorizedException('Invalid Telegram webhook secret token');
      }
    }

    try {
      if (body?.callback_query) {
        const callbackQuery = body.callback_query;
        const callbackData = callbackQuery.data;
        const chatId = callbackQuery.message?.chat.id;
        const messageId = callbackQuery.message?.message_id;

        if (!callbackData || !chatId || !messageId) {
          return { ok: true };
        }

        const [action, photoIdStr] = callbackData.split('_');
        const photoId = Number(photoIdStr);

        if (
          (action === 'approve' || action === 'reject') &&
          Number.isInteger(photoId)
        ) {
          const structuralStatus: 'APPROVED' | 'PENDING' =
            action === 'approve' ? 'APPROVED' : 'PENDING';

          await this.db
            .updateTable('Photo')
            .set({ status: structuralStatus })
            .where('id', '=', photoId)
            .execute();

          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            const confirmationMessageText = `✅ Update Complete: Image database entry status updated to ${structuralStatus}.`;

            await fetch(
              `https://api.telegram.org/bot${botToken}/editMessageText`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  message_id: messageId,
                  text: confirmationMessageText,
                }),
              },
            );

            await fetch(
              `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callback_query_id: callbackQuery.id,
                  text: `Entry status saved as ${structuralStatus}.`,
                }),
              },
            );
          }
        }
      }

      return { ok: true };
    } catch (error) {
      console.error('Critical Telegram Webhook Failure Context:', error);
      throw new InternalServerErrorException({ ok: false });
    }
  }
}
