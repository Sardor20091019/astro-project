import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import { KyselyService } from '../database/kysely.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('photos/:photoId/comments')
export class CommentsController {
  constructor(private readonly db: KyselyService) {}

  @Get()
  async getComments(@Param('photoId') photoIdStr: string) {
    const photoId = Number(photoIdStr);

    if (!Number.isInteger(photoId)) {
      throw new BadRequestException('Missing or invalid photo id');
    }

    try {
      // Trying lowercase table names ('comment', 'user') as PostgreSQL defaults to lowercase
      const rawComments = await this.db
        .selectFrom('comment' as any)
        .leftJoin('user' as any, 'user.id', 'comment.userId')
        .select([
          'comment.id',
          'comment.body',
          'comment.createdAt',
          'comment.photoId',
          'comment.userId',
          'user.name',
          'user.image',
          'user.customImage',
        ])
        .where('comment.photoId', '=', photoId)
        .orderBy('comment.createdAt', 'desc')
        .execute();

      return rawComments.map((c: any) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        photoId: c.photoId,
        userId: c.userId,
        user: {
          name: c.name || 'Anonymous',
          image: c.image,
          customImage: c.customImage,
        },
      }));
    } catch (error: any) {
      console.error('CRITICAL GET COMMENTS ERROR:', error);
      // Temporarily exposing error message to trace the exact Postgres crash reason
      throw new InternalServerErrorException(
        error?.message || 'Failed to retrieve comments',
      );
    }
  }

  @Post()
  async createComment(
    @Param('photoId') photoIdStr: string,
    @Body() bodyData: { body: string },
    @Req() req: Request,
  ) {
    const userId = req.cookies?.user_session;

    if (!userId) {
      throw new UnauthorizedException('Login required to comment');
    }

    const parsedPhotoId = Number(photoIdStr);
    const cleanBody = String(bodyData?.body ?? '').trim();

    if (!Number.isInteger(parsedPhotoId) || cleanBody.length < 2) {
      throw new BadRequestException('Invalid comment');
    }

    try {
      const inserted = await this.db
        .insertInto('comment' as any)
        .values({
          photoId: parsedPhotoId,
          body: cleanBody.slice(0, 1200),
          userId: userId,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      const commentRow = await this.db
        .selectFrom('comment' as any)
        .leftJoin('user' as any, 'user.id', 'comment.userId')
        .select([
          'comment.id',
          'comment.body',
          'comment.createdAt',
          'comment.photoId',
          'comment.userId',
          'user.name',
          'user.image',
          'user.customImage',
        ])
        .where('comment.id', '=', (inserted as any).id)
        .executeTakeFirstOrThrow();

      return {
        id: (commentRow as any).id,
        body: (commentRow as any).body,
        createdAt: (commentRow as any).createdAt,
        photoId: (commentRow as any).photoId,
        userId: (commentRow as any).userId,
        user: {
          name: (commentRow as any).name || 'Anonymous',
          image: (commentRow as any).image,
          customImage: (commentRow as any).customImage,
        },
      };
    } catch (error: any) {
      console.error('CRITICAL CREATE COMMENT ERROR:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to post comment',
      );
    }
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteComment(@Param('id') id: string) {
    const commentId = Number(id);

    if (!Number.isInteger(commentId)) {
      throw new BadRequestException('Invalid comment id');
    }

    try {
      await this.db
        .deleteFrom('comment' as any)
        .where('id', '=', commentId)
        .execute();
      return { message: 'Comment deleted' };
    } catch (error: any) {
      console.error('CRITICAL DELETE COMMENT ERROR:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete comment',
      );
    }
  }
}
