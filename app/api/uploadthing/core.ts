import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { UTApi, UploadThingError } from "uploadthing/server";
import { moderateImageUrl } from "@/lib/moderation";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {
  imageUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 } 
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      console.log("UT MIDDLEWARE SESSION:", JSON.stringify(session, null, 2));
      const userId = session?.user?.id;

      if (!userId) {
        console.error("UT MIDDLEWARE: Unauthorized. Missing session.user.id.");
        throw new UploadThingError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      console.log("UT MIDDLEWARE: Authorized User CUID:", userId);

      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!userExists) {
        throw new UploadThingError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      const photoCount = await prisma.photo.count({
        where: { userId },
      });

      if (photoCount >= 30) {
        throw new UploadThingError({ code: "BAD_REQUEST", message: "Upload limit reached." });
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = file.ufsUrl ?? file.url;
      const moderation = await moderateImageUrl(fileUrl);

      if (!moderation.isSafe) {
        console.log("CRITICAL: Flagged content block executed. Key:", file.key);
        await utapi.deleteFiles(file.key).catch(() => {});
        return { isSafe: false, error: "SAFETY_VIOLATION" };
      }

      try {
        await prisma.photo.create({
          data: {
            url: fileUrl,
            title: "New Photo",
            userId: metadata.userId,
          },
        });
      } catch (dbError) {
        console.error("Database save failed:", dbError);
        await utapi.deleteFiles(file.key).catch(() => {});
        return { isSafe: false, error: "DATABASE_ERROR" };
      }

      return { isSafe: true, error: null };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
