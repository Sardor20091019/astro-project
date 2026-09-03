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
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import { KyselyService } from '../database/kysely.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';

interface FormattedComment {
  id: number;
  body: string;
  comment: string;
  createdAt: Date;
  photoId: number;
  userId: string;
  rating: number;
  user: {
    name: string | null;
    image: string | null;
    customImage: string | null;
  };
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly db: KyselyService) {}

  @Get()
  async getReviews(@Query('photoId') photoIdStr: string) {
    const photoId = Number(photoIdStr);

    if (!Number.isInteger(photoId)) {
      throw new BadRequestException('Missing ID');
    }

    try {
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

      return rawComments.map((comment) => ({
        ...comment,
        comment: comment.body,
        rating: 0,
        user: {
          name: comment.name,
          image: comment.image,
          customImage: comment.customImage,
        },
      }));
    } catch (error) {
      console.error('Fetch Reviews Error:', error);
      throw new InternalServerErrorException('Error fetching reviews');
    }
  }

  @Post()
  async createReview(@Body() body: CreateReviewDto, @Req() req: Request) {
    const userId = req.cookies?.user_session as string | undefined;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const { photoId, rating, comment } = body;
      const parsedPhotoId = Number(photoId);
      const parsedRating = Number(rating);
      const cleanComment = String(comment ?? '').trim();

      if (
        !Number.isInteger(parsedPhotoId) ||
        !Number.isInteger(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        throw new BadRequestException('Invalid review');
      }

      await this.db
        .insertInto('Rating')
        .values({
          photoId: parsedPhotoId,
          value: parsedRating,
          userId: userId,
          updatedAt: new Date(),
        })
        .onConflict((oc) =>
          oc.columns(['photoId', 'userId']).doUpdateSet({
            value: parsedRating,
            updatedAt: new Date(),
          }),
        )
        .execute();

      let formattedComment: FormattedComment | null = null;

      if (cleanComment) {
        const inserted = await this.db
          .insertInto('Comment')
          .values({
            photoId: parsedPhotoId,
            body: cleanComment.slice(0, 1200),
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

        formattedComment = {
          id: commentRow.id,
          body: commentRow.body,
          comment: commentRow.body,
          createdAt: commentRow.createdAt,
          photoId: commentRow.photoId,
          userId: commentRow.userId,
          rating: parsedRating,
          user: {
            name: commentRow.name,
            image: commentRow.image,
            customImage: commentRow.customImage,
          },
        };
      }

      const countResult = await this.db
        .selectFrom('Comment')
        .where('photoId', '=', parsedPhotoId)
        .select((eb) => eb.fn.count('id').as('count'))
        .executeTakeFirst();

      const commentCount = Number(countResult?.count ?? 0);

      return { comment: formattedComment, commentCount };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error('Review Error:', error);
      throw new InternalServerErrorException('Failed to post review');
    }
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteReview(@Param('id') id: string) {
    const commentId = Number(id);

    if (!Number.isInteger(commentId)) {
      throw new BadRequestException('Invalid review id');
    }

    try {
      await this.db.deleteFrom('Comment').where('id', '=', commentId).execute();

      return { message: 'Deleted successfully' };
    } catch (error) {
      console.error('Delete review failed:', error);
      throw new InternalServerErrorException('Delete failed');
    }
  }
}
