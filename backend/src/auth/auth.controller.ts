import {
  Controller,
  Post,
  Body,
  Res,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Response } from 'express';
import * as crypto from 'crypto';
import { KyselyService } from '../database/kysely.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly db: KyselyService) {}

  @Post('telegram')
  async telegramAuth(
    @Body() body: TelegramAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { hash, ...userData } = body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (!botToken) {
        console.error('CRITICAL: TELEGRAM_BOT_TOKEN is missing in .env');
        throw new InternalServerErrorException('Server misconfiguration');
      }

      if (!hash) {
        throw new UnauthorizedException('Invalid authentication hash');
      }

      const secret = crypto.createHash('sha256').update(botToken).digest();

      const sortedKeys = Object.keys(userData).sort();
      const dataCheckString = sortedKeys
        .map((key) => `${key}=${String(userData[key])}`)
        .join('\n');

      const hmac = crypto
        .createHmac('sha256', secret)
        .update(dataCheckString)
        .digest('hex');

      if (hmac !== hash) {
        console.error('HMAC Mismatch!');
        throw new UnauthorizedException('Invalid authentication hash');
      }

      const authDate = Number(userData.auth_date);
      const nowSec = Math.floor(Date.now() / 1000);
      if (isNaN(authDate) || Math.abs(nowSec - authDate) > 86400) {
        throw new UnauthorizedException('Authentication data expired');
      }

      const telegramIdStr = userData.id.toString();
      const telegramUsername = userData.username ?? null;
      const userImage = userData.photo_url ?? null;
      const userName = [userData.first_name, userData.last_name]
        .filter(Boolean)
        .join(' ');

      const user = await this.db
        .insertInto('User')
        .values({
          id: crypto.randomUUID(),
          telegramId: telegramIdStr,
          telegramUsername,
          image: userImage,
          name: userName,
        })
        .onConflict((oc) =>
          oc.column('telegramId').doUpdateSet({
            telegramUsername,
            image: userImage,
            name: userName,
          }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

      res.cookie('user_session', user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      return { success: true, user };
    } catch (error: unknown) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error('Telegram Auth Error:', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
