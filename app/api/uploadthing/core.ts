import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { UTApi, UploadThingError } from "uploadthing/server";
import { moderateImageUrl } from "@/lib/moderation";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {

  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new UploadThingError("Unauthorized");
      
      const photoCount = await prisma.photo.count({ where: { userId: session.user.id } });
      if (photoCount >= 30) throw new UploadThingError("Upload limit reached.");
      
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = file.ufsUrl ?? file.url;
      const moderation = await moderateImageUrl(fileUrl);
      if (!moderation.isSafe) {
        await utapi.deleteFiles(file.key).catch(() => {});
        return { isSafe: false, error: "SAFETY_VIOLATION" };
      }
      return { isSafe: true, url: fileUrl, userId: metadata.userId };
    }),


  profileUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;