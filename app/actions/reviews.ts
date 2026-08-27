"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

  // Kysely upsert with updatedAt provided
  await db
    .insertInto("Rating")
    .values({
      photoId,
      value: rating,
      userId: user.id,
      updatedAt: new Date(),
    })
    .onConflict((oc) =>
      oc.columns(["photoId", "userId"]).doUpdateSet({
        value: rating,
        updatedAt: new Date(),
      })
    )
    .execute();

  if (comment) {
    await db
      .insertInto("Comment")
      .values({
        photoId,
        body: comment.slice(0, 1200),
        userId: user.id,
      })
      .execute();
  }
}

export async function getReviewStats(photoId: number) {
  const stats = await db
    .selectFrom("Rating")
    .where("photoId", "=", photoId)
    .select([
      (eb) => eb.fn.avg("value").as("averageRating"),
      (eb) => eb.fn.count("id").as("totalReviews"),
    ])
    .executeTakeFirst();

  const rawAvg = stats?.averageRating;
  const averageRating = rawAvg !== null && rawAvg !== undefined 
    ? Number(Number(rawAvg).toFixed(1)) 
    : 0;
  
  const totalReviews = Number(stats?.totalReviews ?? 0);

  return {
    averageRating,
    totalReviews,
  };
}