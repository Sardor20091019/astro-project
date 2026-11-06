import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import { KyselyService } from '../database/kysely.service';

@Controller('users/search')
export class UsersSearchController {
  constructor(private readonly db: KyselyService) {}

  @Get()
  async searchUsers(@Query('q') query: string = '', @Req() req: Request) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const currentUserId = cookies?.user_session;
    if (!currentUserId) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const trimmedQuery = query.trim().slice(0, 50);
      if (!trimmedQuery) {
        return [];
      }

      // Restrict returned fields to public profile fields (prevent PII email leakage)
      const users = await this.db
        .selectFrom('User')
        .select(['id', 'name', 'image'])
        .where('id', '!=', currentUserId)
        .where((eb) =>
          eb.or([
            eb('name', 'ilike', `%${trimmedQuery}%`),
            eb('telegramUsername', 'ilike', `%${trimmedQuery}%`),
          ]),
        )
        .limit(10)
        .execute();

      return users;
    } catch (error) {
      console.error('User search error:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
