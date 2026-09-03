"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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


  const inserted = await db
    .insertInto("Comment")
    .values({
      photoId: parsedPhotoId,
      body: cleanBody.slice(0, 1200),
      userId: session.user.id,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  const comment = await db
    .selectFrom("Comment")
    .innerJoin("User", "User.id", "Comment.userId")
    .select([
      "Comment.id",
      "Comment.body",
      "Comment.createdAt",
      "Comment.photoId",
      "Comment.userId",
      "User.name",
      "User.image",
      "User.customImage",
    ])
    .where("Comment.id", "=", inserted.id)
    .executeTakeFirstOrThrow();


  const countResult = await db
    .selectFrom("Comment")
    .where("photoId", "=", parsedPhotoId)
    .select((eb) => eb.fn.count("id").as("count"))
    .executeTakeFirst();

  const commentCount = Number(countResult?.count ?? 0);

  revalidatePath(`/photos/${parsedPhotoId}`);

  return {
    ok: true as const,
    comment: {
      ...comment,
      createdAt: comment.createdAt instanceof Date 
        ? comment.createdAt.toISOString() 
        : new Date(comment.createdAt).toISOString(),
    },
    commentCount,
  };
}