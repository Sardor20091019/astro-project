import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { Kysely, sql } from 'kysely';
import { DB } from '../database/types';

@Injectable()
export class PhotosService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
  ) {}

  async getApprovedPhotos(page = 1, limit = 24) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 24));
    const offset = (pageNum - 1) * limitNum;

    return await this.db
      .selectFrom('Photo')
      .leftJoin('User', 'User.id', 'Photo.userId')
      .select([
        'Photo.id',
        'Photo.url',
        'Photo.title',
        'Photo.category',
        'Photo.location',
        'Photo.coordinates',
        'Photo.camera',
        'Photo.iso',
        'Photo.aperture',
        'Photo.shutter',
        'Photo.focalLength',
        'Photo.authorName',
        'Photo.createdAt',
        sql<string | null>`COALESCE("User"."customImage", "User"."image")`.as('authorAvatar'),
        sql<number>`(SELECT count(*)::int FROM "Like" WHERE "photoId" = "Photo".id)`.as('likeCount'),
        sql<number>`(SELECT count(*)::int FROM "Comment" WHERE "photoId" = "Photo".id)`.as('commentCount'),
        sql<number>`(SELECT COALESCE(avg(value), 0)::float FROM "Rating" WHERE "photoId" = "Photo".id)`.as('avgRating'),
      ])
      .where('Photo.status', '=', 'APPROVED')
      .orderBy('Photo.createdAt', 'desc')
      .limit(limitNum)
      .offset(offset)
      .execute();
  }

  async getPhotoById(photoId: number, userId?: string, anonymousToken?: string) {
    const photo = await this.db
      .selectFrom('Photo')
      .leftJoin('User', 'User.id', 'Photo.userId')
      .select([
        'Photo.id',
        'Photo.url',
        'Photo.title',
        'Photo.category',
        'Photo.location',
        'Photo.coordinates',
        'Photo.camera',
        'Photo.iso',
        'Photo.aperture',
        'Photo.shutter',
        'Photo.focalLength',
        'Photo.authorName',
        'Photo.createdAt',
        'Photo.userId',
        sql<string | null>`COALESCE("User"."customImage", "User"."image")`.as('authorAvatar'),
      ])
      .where('Photo.id', '=', photoId)
      .executeTakeFirst();

    if (!photo) return null;

    const [ratingStats, likeCountRes, currentRating, currentLike, commentCountRes] = await Promise.all([
      this.db
        .selectFrom('Rating')
        .where('photoId', '=', photoId)
        .select([
          (eb) => eb.fn.avg('value').as('avg'),
          (eb) => eb.fn.count('id').as('count'),
        ])
        .executeTakeFirst(),
      this.db
        .selectFrom('Like')
        .where('photoId', '=', photoId)
        .select((eb) => eb.fn.count('id').as('count'))
        .executeTakeFirst(),
      userId
        ? this.db
            .selectFrom('Rating')
            .select('value')
            .where('photoId', '=', photoId)
            .where('userId', '=', userId)
            .executeTakeFirst()
        : Promise.resolve(null),
      userId
        ? this.db
            .selectFrom('Like')
            .selectAll()
            .where('photoId', '=', photoId)
            .where('userId', '=', userId)
            .executeTakeFirst()
        : anonymousToken
        ? this.db
            .selectFrom('Like')
            .selectAll()
            .where('photoId', '=', photoId)
            .where('anonymousToken', '=', anonymousToken)
            .executeTakeFirst()
        : Promise.resolve(null),
      this.db
        .selectFrom('Comment')
        .where('photoId', '=', photoId)
        .select((eb) => eb.fn.count('id').as('count'))
        .executeTakeFirst(),
    ]);

    const rawAvg = ratingStats?.avg;
    const ratingAverage = rawAvg !== null && rawAvg !== undefined 
      ? Number(Number(rawAvg).toFixed(1)) 
      : 0;

    return {
      ...photo,
      ratingAverage,
      ratingCount: Number(ratingStats?.count ?? 0),
      viewerRating: currentRating?.value ?? null,
      likeCount: Number(likeCountRes?.count ?? 0),
      viewerLiked: Boolean(currentLike),
      commentCount: Number(commentCountRes?.count ?? 0),
    };
  }
}