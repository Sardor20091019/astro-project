import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getToken } from "next-auth/jwt"; // Direct JWT decryption tool
import { prisma } from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { moderateImageUrl } from "@/lib/moderation";

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {
  imageUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 } 
  })
    // 1. Pass the underlying NextRequest wrapper object from UploadThing
    .middleware(async ({ req }) => {
      
      // 2. Decode the session token directly from the request cookies manually
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      // 3. Extract your synced database CUID from the token payload
      const userId = token?.id as string | undefined;

      if (!userId) {
        console.error("UT MIDDLEWARE: Extraction failed. No active token found.");
        throw new Error("Unauthorized: Invalid or missing session token.");
      }

      console.log("UT MIDDLEWARE: Decrypted token successfully for User CUID:", userId);

      // 4. Run your database validation rules
      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!userExists) {
        throw new Error("Unauthorized: User profile missing from database.");
      }

      const photoCount = await prisma.photo.count({
        where: { userId },
      });

      if (photoCount >= 30) {
        throw new Error("Upload limit reached.");
      }

      // Return metadata payload to pass down to .onUploadComplete
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