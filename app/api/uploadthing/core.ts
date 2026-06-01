import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

export const ourFileRouter = {
  // Define the upload route
  imageUploader: f({ 
    image: { 
      maxFileSize: "4MB", 
      maxFileCount: 1 
    } 
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new Error("Unauthorized");

      // Fetch user role and check upload count
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      // ADMIN check: Bypass limit
      // USER check: Enforce limit
      if (user?.role !== "ADMIN") {
        const photoCount = await prisma.photo.count({
          where: { userId: session.user.id },
        });

        const LIMIT = 10;
        if (photoCount >= LIMIT) {
          throw new Error("Upload limit reached. Delete old photos to add more.");
        }
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Logic to save the reference to your database
      try {
        await prisma.photo.create({
          data: {
            url: file.url,
            title: "Untitled", // You can update this later via an edit form
            userId: metadata.userId,
            status: "APPROVED",
          },
        });
        console.log("Upload complete for user:", metadata.userId);
      } catch (error) {
        console.error("Database save failed:", error);
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;