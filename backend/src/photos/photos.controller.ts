import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { sql } from 'kysely';
import { KyselyService } from '../database/kysely.service';
import { PhotosService } from './photos.service';
import { ADMIN_EMAILS } from '../auth/guards/admin-auth.guard';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

enum PhotoCategory {
  ASTROPHOTOGRAPHY = 'ASTROPHOTOGRAPHY',
  NATURE = 'NATURE',
  SKY = 'SKY',
  MOON = 'MOON',
  WARM = 'WARM',
  STREET = 'STREET',
  ABSTRACT = 'ABSTRACT',
  OTHER = 'OTHER',
}

@Controller('photos')
export class PhotosController {
  constructor(
    private readonly db: KyselyService,
    private readonly photosService: PhotosService,
  ) {}

  @Get()
  async getAllPhotos() {
    try {
      return await this.db
        .selectFrom('Photo')
        .selectAll()
        .orderBy(sql`random()`)
        .execute();
    } catch (error: unknown) {
      console.error('CRITICAL FETCH PHOTOS ERROR:', error);
      throw new InternalServerErrorException('Failed to fetch photos');
    }
  }

  @Get(':id')
  async getPhoto(@Param('id') id: string, @Req() req: Request) {
    const photoId = Number(id);
    if (!Number.isInteger(photoId)) {
      throw new BadRequestException('Invalid photo id');
    }

    const userId = req.cookies?.user_session as string | undefined;
    const anonymousToken = req.cookies?.astro_guest as string | undefined;

    const photo = await this.photosService.getPhotoById(
      photoId,
      userId,
      anonymousToken,
    );
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return photo;
  }

  @Get(':id/engagement')
  async getEngagement(@Param('id') id: string, @Req() req: Request) {
    const photoId = Number(id);
    if (!Number.isInteger(photoId)) {
      throw new BadRequestException('Invalid photo id');
    }

    const userId = req.cookies?.user_session as string | undefined;
    const anonymousToken = req.cookies?.astro_guest as string | undefined;

    const [
      ratingStats,
      likeCountRes,
      currentRating,
      currentLike,
      commentCountRes,
    ] = await Promise.all([
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
    const ratingAverage =
      rawAvg !== null && rawAvg !== undefined
        ? Number(Number(rawAvg).toFixed(1))
        : 0;

    return {
      ratingAverage,
      ratingCount: Number(ratingStats?.count ?? 0),
      viewerRating: currentRating?.value ?? null,
      likeCount: Number(likeCountRes?.count ?? 0),
      viewerLiked: Boolean(currentLike),
      commentCount: Number(commentCountRes?.count ?? 0),
    };
  }

  @Delete(':id')
  async deletePhoto(@Param('id') id: string, @Req() req: Request) {
    const userId = req.cookies?.user_session as string | undefined;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const photoId = Number(id);
    if (!Number.isInteger(photoId))
      throw new BadRequestException('Invalid photo id');

    const user = await this.db
      .selectFrom('User')
      .select(['email'])
      .where('id', '=', userId)
      .executeTakeFirst();

    const photo = await this.db
      .selectFrom('Photo')
      .selectAll()
      .where('id', '=', photoId)
      .executeTakeFirst();

    if (!photo) throw new NotFoundException('Photo not found');

    const isAdmin = user?.email
      ? ADMIN_EMAILS.includes(user.email.toLowerCase().trim())
      : false;
    if (!isAdmin && photo.userId !== userId) {
      throw new ForbiddenException('You can only delete your own photos');
    }

    if (photo.url.startsWith('/uploads/')) {
      try {
        await fs.unlink(path.join(process.cwd(), 'public', photo.url));
      } catch {
        /* Ignore missing uploaded files */
      }
    }

    await this.db.deleteFrom('Photo').where('id', '=', photoId).execute();
    return { success: true };
  }

  @Patch(':id')
  async updatePhoto(
    @Param('id') id: string,
    @Body() body: UpdatePhotoDto,
    @Req() req: Request,
  ) {
    const userId = req.cookies?.user_session as string | undefined;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const photoId = Number(id);
    if (!Number.isInteger(photoId))
      throw new BadRequestException('Invalid photo id');

    const user = await this.db
      .selectFrom('User')
      .select(['email'])
      .where('id', '=', userId)
      .executeTakeFirst();

    const photo = await this.db
      .selectFrom('Photo')
      .selectAll()
      .where('id', '=', photoId)
      .executeTakeFirst();

    if (!photo) throw new NotFoundException('Not found');

    const isAdmin = user?.email
      ? ADMIN_EMAILS.includes(user.email.toLowerCase().trim())
      : false;
    if (!isAdmin && photo.userId !== userId)
      throw new ForbiddenException('Forbidden');

    const updateData: Record<string, unknown> = {};
    if (typeof body.title === 'string' && body.title.trim())
      updateData.title = body.title.trim();
    if (typeof body.category === 'string') updateData.category = body.category;
    if (typeof body.location === 'string')
      updateData.location = body.location.trim() || null;

    if (Object.keys(updateData).length === 0) return photo;

    return await this.db
      .updateTable('Photo')
      .set(updateData)
      .where('id', '=', photoId)
      .returningAll()
      .executeTakeFirst();
  }

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadPhoto(@Body() body: CreatePhotoDto, @Req() req: Request) {
    if (!body.photoUrl || !String(body.photoUrl).startsWith('https://')) {
      throw new BadRequestException('Invalid image URL provided');
    }
    return this.handlePhotoCreation(body, req);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async createPhoto(@Body() body: CreatePhotoDto, @Req() req: Request) {
    return this.handlePhotoCreation(body, req);
  }

  private async handlePhotoCreation(body: CreatePhotoDto, req: Request) {
    const userId = req.cookies?.user_session as string | undefined;
    let userName = 'Anonymous';

    if (userId) {
      const dbUser = await this.db
        .selectFrom('User')
        .select(['name'])
        .where('id', '=', userId)
        .executeTakeFirst();
      if (dbUser?.name) userName = dbUser.name;
    }

    try {
      const photoUrl = body.photoUrl;
      if (!photoUrl) throw new BadRequestException('No image URL provided');

      const isoVal = body.iso;
      const parsedIso =
        isoVal !== undefined && isoVal !== null ? Number(isoVal) : null;

      const rawCategory = String(body.category || 'OTHER').toUpperCase();
      const category = Object.values(PhotoCategory).includes(
        rawCategory as PhotoCategory,
      )
        ? (rawCategory as PhotoCategory)
        : PhotoCategory.OTHER;

      const cleanTitle = body.title
        ? String(body.title)
            .replace(/<[^>]*>/g, '')
            .trim()
        : 'Untitled frame';

      return await this.db
        .insertInto('Photo')
        .values({
          url: photoUrl,
          title: cleanTitle || 'Untitled frame',
          location: body.location ? body.location.trim() : null,
          coordinates: body.coordinates ? body.coordinates.trim() : null,
          camera: body.camera ? body.camera.trim() : null,
          iso: Number.isNaN(parsedIso) ? null : parsedIso,
          aperture: body.aperture ? body.aperture.trim() : null,
          shutter: body.shutter ? body.shutter.trim() : null,
          focalLength: body.focalLength ? body.focalLength.trim() : null,
          authorName: body.authorName ? body.authorName.trim() : userName,
          category: category,
          status: 'APPROVED',
          userId: userId ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      console.error('Database Save Error:', error);
      throw new InternalServerErrorException(
        'Failed to publish frame to database',
      );
    }
  }
}
