import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UTApi } from "uploadthing/server";
import { moderateImageUrl } from "@/lib/moderation";

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {
  imageUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 } 
  })
    .middleware(async () => {
      const session = (await getServerSession(authOptions)) as Session | null;
      if (!session?.user?.id) throw new Error("Unauthorized");

      const photoCount = await prisma.photo.count({
        where: { userId: session.user.id },
      });

      if (photoCount >= 30) throw new Error("Upload limit reached.");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const moderation = await moderateImageUrl(file.url);

      if (!moderation.isSafe) {
        console.log("CRITICAL: Flagged content block executed. Key:", file.key);
        // Wipe file out of cloud storage immediately
        await utapi.deleteFiles(file.key).catch(() => {});
        
        // Return JSON error state to client instead of breaking the pipeline
        return { isSafe: false, error: "SAFETY_VIOLATION" };
      }

      // Safe image: Persist to DB
      await prisma.photo.create({
        data: {
          url: file.url,
          title: "New Photo",
          userId: metadata.userId,
        },
      });

      return { isSafe: true, error: null };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;