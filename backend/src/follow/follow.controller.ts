import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { KyselyService } from '../database/kysely.service';

@Controller('follow')
export class FollowController {
  constructor(private readonly db: KyselyService) {}

  @Post()
  async toggleFollow(
    @Body() body: { targetUserId: string },
    @Req() req: Request,
  ) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const currentUserId = cookies?.user_session;
    if (!currentUserId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { targetUserId } = body;
    if (!targetUserId || targetUserId === currentUserId) {
      throw new BadRequestException('Invalid target');
    }

    const existing = await this.db
      .selectFrom('Follows')
      .selectAll()
      .where('followerId', '=', currentUserId)
      .where('followingId', '=', targetUserId)
      .executeTakeFirst();

    if (existing) {
      await this.db
        .deleteFrom('Follows')
        .where('followerId', '=', currentUserId)
        .where('followingId', '=', targetUserId)
        .execute();
    } else {
      await this.db
        .insertInto('Follows')
        .values({
          followerId: currentUserId,
          followingId: targetUserId,
        })
        .execute();
    }

    const countResult = await this.db
      .selectFrom('Follows')
      .where('followingId', '=', targetUserId)
      .select((eb) => eb.fn.count('followerId').as('count'))
      .executeTakeFirst();

    const followerCount = Number(countResult?.count ?? 0);

    return { following: !existing, followerCount };
  }

  @Get()
  async getFollowStats(
    @Query('targetUserId') targetUserId: string,
    @Req() req: Request,
  ) {
    if (!targetUserId) {
      throw new BadRequestException('Missing targetUserId');
    }

    const cookies = req.cookies as Record<string, string> | undefined;
    const currentUserId = cookies?.user_session;

    const [followerCountRes, followingCountRes] = await Promise.all([
      this.db
        .selectFrom('Follows')
        .where('followingId', '=', targetUserId)
        .select((eb) => eb.fn.count('followerId').as('count'))
        .executeTakeFirst(),
      this.db
        .selectFrom('Follows')
        .where('followerId', '=', targetUserId)
        .select((eb) => eb.fn.count('followingId').as('count'))
        .executeTakeFirst(),
    ]);

    const followerCount = Number(followerCountRes?.count ?? 0);
    const followingCount = Number(followingCountRes?.count ?? 0);

    let isFollowing = false;
    if (currentUserId) {
      const rel = await this.db
        .selectFrom('Follows')
        .select('followerId')
        .where('followerId', '=', currentUserId)
        .where('followingId', '=', targetUserId)
        .executeTakeFirst();

      isFollowing = Boolean(rel);
    }

    return { followerCount, followingCount, isFollowing };
  }
}
