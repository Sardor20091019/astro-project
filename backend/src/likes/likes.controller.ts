import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { KyselyService } from '../database/kysely.service';

@Controller('likes')
export class LikesController {
  constructor(private readonly db: KyselyService) {}

  @Post()
  async toggleLike(
    @Body() body: { photoId: number | string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { photoId } = body;
      const parsedPhotoId = Number(photoId);

      if (!Number.isInteger(parsedPhotoId)) {
        throw new BadRequestException('Invalid photo id');
      }

      const cookies = req.cookies as Record<string, string> | undefined;
      const userId = cookies?.user_session;
      const existingGuestToken = cookies?.astro_guest;
      const anonymousToken = existingGuestToken ?? crypto.randomUUID();
      const shouldSetGuestCookie = !existingGuestToken;

      const existing = userId
        ? await this.db
            .selectFrom('Like')
            .selectAll()
            .where('photoId', '=', parsedPhotoId)
            .where('userId', '=', userId)
            .executeTakeFirst()
        : await this.db
            .selectFrom('Like')
            .selectAll()
            .where('photoId', '=', parsedPhotoId)
            .where('anonymousToken', '=', anonymousToken)
            .executeTakeFirst();

      if (existing) {
        await this.db
          .deleteFrom('Like')
          .where('id', '=', existing.id)
          .execute();
      } else {
        await this.db
          .insertInto('Like')
          .values({
            photoId: parsedPhotoId,
            userId: userId || null,
            anonymousToken: userId ? null : anonymousToken,
          })
          .execute();
      }

      const countResult = await this.db
        .selectFrom('Like')
        .where('photoId', '=', parsedPhotoId)
        .select((eb) => eb.fn.count('id').as('count'))
        .executeTakeFirst();

      const likeCount = Number(countResult?.count ?? 0);

      if (shouldSetGuestCookie) {
        res.cookie('astro_guest', anonymousToken, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 1000 * 31536000,
          path: '/',
        });
      }

      return { liked: !existing, likeCount };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Like API error:', error);
      throw new InternalServerErrorException('Server Error');
    }
  }
}
