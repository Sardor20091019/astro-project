import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi, UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { moderateImageUrl } from "@/lib/moderation";
import { parseCookieValue } from "./auth.helper";

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      let userId = session?.user?.id;
      if (!userId && req && "cookies" in req) {
        const raw = (req as any).cookies?.get?.("user_session")?.value;
        userId = parseCookieValue(raw) || undefined;
      }

      if (!userId) {
        throw new UploadThingError("Unauthorized");
      }

      const photoCountRes = await db
        .selectFrom("Photo")
        .where("userId", "=", userId)
        .select((eb) => eb.fn.count("id").as("count"))
        .executeTakeFirst();

      const photoCount = Number(photoCountRes?.count ?? 0);
      if (photoCount >= 30) {
        throw new UploadThingError("Upload limit reached.");
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = (file as any).ufsUrl ?? file.url;
      const moderation = await moderateImageUrl(fileUrl);

      if (!moderation.isSafe) {
        await utapi.deleteFiles(file.key).catch(() => {});
        return {
          isSafe: false,
          error:
            moderation.reason === "NUDITY_DETECTED"
              ? "Image rejected: Nudity detected by content moderation."
              : "Image failed safety checks.",
        };
      }

      return { isSafe: true, url: fileUrl, userId: metadata.userId };
    }),

  profileUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      let userId = session?.user?.id;
      if (!userId && req && "cookies" in req) {
        const raw = (req as any).cookies?.get?.("user_session")?.value;
        userId = parseCookieValue(raw) || undefined;
      }

      if (!userId) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId };
    })
    .onUploadComplete(({ file }) => {
      return { url: (file as any).ufsUrl ?? file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

