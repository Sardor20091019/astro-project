"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitComment(photoId: number, body: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { ok: false as const, error: "UNAUTHORIZED" };
  }

  const parsedPhotoId = Number(photoId);
  const cleanBody = String(body ?? "").trim();

  if (!Number.isInteger(parsedPhotoId) || cleanBody.length < 2) {
    return { ok: false as const, error: "INVALID_COMMENT" };
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
    ok: true as const,
    comment: {
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    },
    commentCount,
  };
}
