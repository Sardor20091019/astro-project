import { createUploadthing, type FileRouter } from 'uploadthing/express';
import { UTApi, UploadThingError } from 'uploadthing/server';
import { db } from '@shared/db';
import { moderateImageUrl } from '@shared/moderation';
const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter: FileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const userId = (req as any).cookies?.user_session;
      if (!userId) throw new UploadThingError('Unauthorized');

      const photoCountRes = await db
        .selectFrom('Photo')
        .where('userId', '=', userId)
        .select((eb) => eb.fn.count('id').as('count'))
        .executeTakeFirst();

      const photoCount = Number(photoCountRes?.count ?? 0);
      if (photoCount >= 30) throw new UploadThingError('Upload limit reached.');

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = file.ufsUrl ?? file.url;
      const moderation = await moderateImageUrl(fileUrl);

      if (!moderation.isSafe) {
        await utapi.deleteFiles(file.key).catch(() => {});
        return {
          isSafe: false,
          error:
            moderation.reason === 'NUDITY_DETECTED'
              ? 'Image rejected: Nudity detected by content moderation.'
              : 'Image failed safety checks.',
        };
      }

      return { isSafe: true, url: fileUrl, userId: metadata.userId };
    }),

  profileUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const userId = (req as any).cookies?.user_session;
      if (!userId) throw new UploadThingError('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url };
    }),
};

export type OurFileRouter = typeof ourFileRouter;
