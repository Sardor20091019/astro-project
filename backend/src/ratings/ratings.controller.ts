// backend/src/ratings/ratings.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  Res, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { KyselyService } from '../database/kysely.service';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly db: KyselyService) {}

  @Post()
  async createOrUpdateRating(
    @Body() body: { photoId: any; value: any },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const { photoId, value } = body;
      const parsedPhotoId = Number(photoId);
      const parsedValue = Number(value);

      if (!Number.isInteger(parsedPhotoId) || !Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 5) {
        throw new BadRequestException('Invalid rating');
      }

      const userId = req.cookies?.user_session;
      const existingGuestToken = req.cookies?.astro_guest;
      const anonymousToken = existingGuestToken ?? crypto.randomUUID();
      const shouldSetGuestCookie = !existingGuestToken;

      const existing = userId
        ? await this.db
            .selectFrom('Rating')
            .selectAll()
            .where('photoId', '=', parsedPhotoId)
            .where('userId', '=', userId)
            .executeTakeFirst()
        : await this.db
            .selectFrom('Rating')
            .selectAll()
            .where('photoId', '=', parsedPhotoId)
            .where('anonymousToken', '=', anonymousToken)
            .executeTakeFirst();

      if (existing) {
        await this.db
          .updateTable('Rating')
          .set({
            value: parsedValue,
            updatedAt: new Date(),
          })
          .where('id', '=', existing.id)
          .execute();
      } else {
        await this.db
          .insertInto('Rating')
          .values({
            photoId: parsedPhotoId,
            value: parsedValue,
            userId: userId || null,
            anonymousToken: userId ? null : anonymousToken,
            updatedAt: new Date(),
          })
          .execute();
      }

      const stats = await this.db
        .selectFrom('Rating')
        .where('photoId', '=', parsedPhotoId)
        .select([
          (eb) => eb.fn.avg('value').as('avg'),
          (eb) => eb.fn.count('id').as('count'),
        ])
        .executeTakeFirst();

      const rawAvg = stats?.avg;
      const ratingAverage = rawAvg !== null && rawAvg !== undefined 
        ? Number(Number(rawAvg).toFixed(1)) 
        : 0;
      const ratingCount = Number(stats?.count ?? 0);

      if (shouldSetGuestCookie) {
        res.cookie('astro_guest', anonymousToken, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 1000 * 31536000,
          path: '/',
        });
      }

      return {
        ratingAverage,
        ratingCount,
        viewerRating: parsedValue,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Rating API Error:', error);
      throw new InternalServerErrorException('Server Error');
    }
  }
}