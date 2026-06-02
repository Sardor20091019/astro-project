"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitComment(photoId: number, body: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsedPhotoId = Number(photoId);
  const cleanBody = String(body ?? "").trim();

  if (!Number.isInteger(parsedPhotoId) || cleanBody.length < 2) {
    throw new Error("Invalid comment");
  }

  const comment = await prisma.comment.create({
    data: {
      photoId: parsedPhotoId,
      body: cleanBody.slice(0, 1200),
      userId: session.user.id,
    },
    include: {
      user: {
        select: { name: true, image: true, customImage: true },
      },
    },
  });

  const commentCount = await prisma.comment.count({
    where: { photoId: parsedPhotoId },
  });

  revalidatePath(`/photos/${parsedPhotoId}`);

  return {
    comment: {
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    },
    commentCount,
  };
}
