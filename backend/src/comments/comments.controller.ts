import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { KyselyService } from '../database/kysely.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly db: KyselyService) {}

  @Get()
  async getComments(@Query('photoId') photoIdStr: string) {
    const photoId = Number(photoIdStr);

    if (!Number.isInteger(photoId)) {
      throw new BadRequestException('Missing or invalid photo id');
    }

    const rawComments = await this.db
      .selectFrom('Comment')
      .innerJoin('User', 'User.id', 'Comment.userId')
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
        name: c.name,
        image: c.image,
        customImage: c.customImage,
      },
    }));
  }

  @Post()
  async createComment(
    @Body() bodyData: { photoId: number | string; body: string },
    @Req() req: Request,
  ) {
    const userId = req.cookies?.user_session;

    if (!userId) {
      throw new UnauthorizedException('Login required to comment');
    }

    const { photoId, body } = bodyData;
    const parsedPhotoId = Number(photoId);
    const cleanBody = String(body ?? '').trim();

    if (!Number.isInteger(parsedPhotoId) || cleanBody.length < 2) {
      throw new BadRequestException('Invalid comment');
    }

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
      .innerJoin('User', 'User.id', 'Comment.userId')
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
        name: commentRow.name,
        image: commentRow.image,
        customImage: commentRow.customImage,
      },
    };
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteComment(@Param('id') id: string) {
    const commentId = Number(id);

    if (!Number.isInteger(commentId)) {
      throw new BadRequestException('Invalid comment id');
    }

    await this.db.deleteFrom('Comment').where('id', '=', commentId).execute();

    return { message: 'Comment deleted' };
  }
}
