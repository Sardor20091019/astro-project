// backend/src/user/user-follow.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  UnauthorizedException, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import type { Request } from 'express';
import { KyselyService } from '../database/kysely.service';

@Controller('user/follow')
export class UserFollowController {
  constructor(private readonly db: KyselyService) {}

  @Post()
  async toggleFollow(
    @Body() body: { targetUserId: string }, 
    @Req() req: Request
  ) {
    const currentUserId = req.cookies?.user_session;
    if (!currentUserId) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const { targetUserId } = body;

      if (!targetUserId || currentUserId === targetUserId) {
        throw new BadRequestException('You cannot follow yourself');
      }

      const existingFollow = await this.db
        .selectFrom('Follows')
        .selectAll()
        .where('followerId', '=', currentUserId)
        .where('followingId', '=', targetUserId)
        .executeTakeFirst();

      if (existingFollow) {
        await this.db
          .deleteFrom('Follows')
          .where('followerId', '=', currentUserId)
          .where('followingId', '=', targetUserId)
          .execute();

        return { message: 'Unfollowed successfully', following: false };
      } else {
        await this.db
          .insertInto('Follows')
          .values({
            followerId: currentUserId,
            followingId: targetUserId,
          })
          .execute();

        return { message: 'Followed successfully', following: true };
      }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Follow Error:', error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}