// backend/src/photos/photos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { Kysely, sql } from 'kysely';
import { DB } from '../database/types';

@Injectable()
export class PhotosService {
  constructor(@InjectKysely() private readonly db: Kysely<DB>) {}

  async getApprovedPhotos() {
    return await this.db
      .selectFrom('Photo')
      .select((eb) => [
        'Photo.id',
        'Photo.url',
        'Photo.title',
        'Photo.location',
        'Photo.coordinates',
        'Photo.camera',
        'Photo.iso',
        'Photo.aperture',
        'Photo.shutter',
        'Photo.focalLength',
        'Photo.authorName',
        'Photo.category',
        'Photo.status',
        'Photo.userId',
        'Photo.createdAt',
        'Photo.updatedAt',
        'Photo.views',
        sql<number>`(SELECT count(*)::int FROM "Like" WHERE "photoId" = "Photo".id)`.as(
          'likeCount',
        ),
        sql<number>`(SELECT count(*)::int FROM "Comment" WHERE "photoId" = "Photo".id)`.as(
          'commentCount',
        ),
        sql<number>`(SELECT COALESCE(avg(value), 0)::float FROM "Rating" WHERE "photoId" = "Photo".id)`.as(
          'avgRating',
        ),
      ])
      .where('Photo.status', '=', 'APPROVED')
      .orderBy('Photo.createdAt', 'asc')
      .execute();
  }

  async getPhotoById(id: number, userId?: string, anonymousToken?: string) {
    const photo = await this.db
      .selectFrom('Photo')
      .select((eb) => [
        'Photo.id',
        'Photo.url',
        'Photo.title',
        'Photo.location',
        'Photo.coordinates',
        'Photo.camera',
        'Photo.iso',
        'Photo.aperture',
        'Photo.shutter',
        'Photo.focalLength',
        'Photo.authorName',
        'Photo.category',
        'Photo.status',
        'Photo.userId',
        'Photo.createdAt',
        'Photo.updatedAt',
        'Photo.views',
        sql<number>`(SELECT count(*)::int FROM "Like" WHERE "photoId" = "Photo".id)`.as(
          'likeCount',
        ),
        sql<number>`(SELECT count(*)::int FROM "Comment" WHERE "photoId" = "Photo".id)`.as(
          'commentCount',
        ),
        sql<number>`(SELECT COALESCE(avg(value), 0)::float FROM "Rating" WHERE "photoId" = "Photo".id)`.as(
          'avgRating',
        ),
      ])
      .where('Photo.id', '=', id)
      .where('Photo.status', '=', 'APPROVED')
      .executeTakeFirst();

    if (!photo) return null;

    let viewerRating: number | null = null;
    let viewerLiked = false;

    if (userId) {
      const rating = await this.db
        .selectFrom('Rating')
        .select('value')
        .where('photoId', '=', id)
        .where('userId', '=', userId)
        .executeTakeFirst();
      viewerRating = rating?.value ?? null;

      const like = await this.db
        .selectFrom('Like')
        .select('id')
        .where('photoId', '=', id)
        .where('userId', '=', userId)
        .executeTakeFirst();
      viewerLiked = !!like;
    } else if (anonymousToken) {
      const rating = await this.db
        .selectFrom('Rating')
        .select('value')
        .where('photoId', '=', id)
        .where('anonymousToken', '=', anonymousToken)
        .executeTakeFirst();
      viewerRating = rating?.value ?? null;

      const like = await this.db
        .selectFrom('Like')
        .select('id')
        .where('photoId', '=', id)
        .where('anonymousToken', '=', anonymousToken)
        .executeTakeFirst();
      viewerLiked = !!like;
    }

    return {
      ...photo,
      viewerRating,
      viewerLiked,
    };
  }
}
