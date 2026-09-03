import { createUploadthing, type FileRouter } from 'uploadthing/express';
import { UTApi } from 'uploadthing/server';
import type { Request } from 'express';
import { db } from '../shared/db';
import { moderateImageUrl } from '../shared/moderation';

const f = createUploadthing();
const utapi = new UTApi();

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

export const ourFileRouter: FileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const typedReq = req as unknown as RequestWithCookies;
      const userId = typedReq.cookies?.user_session as string | undefined;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const photoCountRes = await db
        .selectFrom('Photo')
        .where('userId', '=', userId)
        .select((eb) => eb.fn.count('id').as('count'))
        .executeTakeFirst();

      const photoCount = Number(photoCountRes?.count ?? 0);
      if (photoCount >= 30) throw new Error('Upload limit reached.');

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
    .middleware(({ req }) => {
      const typedReq = req as unknown as RequestWithCookies;
      const userId = typedReq.cookies?.user_session as string | undefined;
      if (!userId) {
        throw new Error('Unauthorized');
      }
      return { userId };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl ?? file.url };
    }),
};

export type OurFileRouter = typeof ourFileRouter;
