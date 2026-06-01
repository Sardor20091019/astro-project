import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { prisma } from "@/lib/prisma"; 

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) throw new Error("Unauthorized");
      
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      
      const newPhoto = await prisma.photo.create({
        data: {
          title: file.name,        
          url: file.url,           
          userId: metadata.userId, 
        },
      });

      return { photoId: newPhoto.id, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;