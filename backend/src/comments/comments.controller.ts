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
import { CreateCommentDto } from './dto/create-comment.dto';

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
      const rawComments = await this.db
        .selectFrom('Comment')
        .leftJoin('User', 'User.id', 'Comment.userId')
        .select([
          'Comment.id',
          'Comment.body',
          'Comment.createdAt',
          'Comment.photoId',
          'Comment.userId',
          'User.name',
          'User.image',
          'User.customImage',
        ])
        .where('Comment.photoId', '=', photoId)
        .orderBy('Comment.createdAt', 'desc')
        .execute();

      return rawComments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        photoId: c.photoId,
        userId: c.userId,
        user: {
          name: c.name || 'Anonymous',
          image: c.image ?? null,
          customImage: c.customImage ?? null,
        },
      }));
    } catch (error: unknown) {
      console.error('CRITICAL GET COMMENTS ERROR:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to retrieve comments';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  @Post()
  async createComment(
    @Param('photoId') photoIdStr: string,
    @Body() bodyData: CreateCommentDto,
    @Req() req: Request,
  ) {
    const userId = req.cookies?.user_session as string | undefined;

    if (!userId) {
      throw new UnauthorizedException('Login required to comment');
    }

    const parsedPhotoId = Number(photoIdStr);
    const cleanBody = bodyData.body.trim();

    if (!Number.isInteger(parsedPhotoId)) {
      throw new BadRequestException('Invalid photo id');
    }

    try {
      const inserted = await this.db
        .insertInto('Comment')
        .values({
          photoId: parsedPhotoId,
          body: cleanBody.slice(0, 1200),
          userId: userId,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      const commentRow = await this.db
        .selectFrom('Comment')
        .leftJoin('User', 'User.id', 'Comment.userId')
        .select([
          'Comment.id',
          'Comment.body',
          'Comment.createdAt',
          'Comment.photoId',
          'Comment.userId',
          'User.name',
          'User.image',
          'User.customImage',
        ])
        .where('Comment.id', '=', inserted.id)
        .executeTakeFirstOrThrow();

      return {
        id: commentRow.id,
        body: commentRow.body,
        createdAt: commentRow.createdAt,
        photoId: commentRow.photoId,
        userId: commentRow.userId,
        user: {
          name: commentRow.name || 'Anonymous',
          image: commentRow.image ?? null,
          customImage: commentRow.customImage ?? null,
        },
      };
    } catch (error: unknown) {
      console.error('CRITICAL CREATE COMMENT ERROR:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to post comment';
      throw new InternalServerErrorException(errorMessage);
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
      await this.db.deleteFrom('Comment').where('id', '=', commentId).execute();
      return { message: 'Comment deleted' };
    } catch (error: unknown) {
      console.error('CRITICAL DELETE COMMENT ERROR:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete comment';
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
