"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function submitReview(formData: FormData) {
  const session = await getServerSession(authOptions) as { user?: { id?: string } } | null;
  const user = session?.user;
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  const photoId = Number(formData.get("photoId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(photoId) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Invalid review");
  }

  await prisma.rating.upsert({
    where: { photoId_userId: { photoId, userId: user.id } },
    update: { value: rating },
    create: { photoId, value: rating, userId: user.id },
  });

  if (comment) {
    await prisma.comment.create({
      data: {
        photoId,
        body: comment.slice(0, 1200),
        userId: user.id,
      },
    });
  }
}

export async function getReviewStats(photoId: number) {
  const stats = await prisma.rating.aggregate({
    where: {
      photoId: photoId,
    },
    _avg: {
      value: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    averageRating: stats._avg.value ? Number(stats._avg.value.toFixed(1)) : 0,
    totalReviews: stats._count.id,
  };
}
