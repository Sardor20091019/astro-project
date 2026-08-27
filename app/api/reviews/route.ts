import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { photoId, rating, comment } = await req.json();
    const parsedPhotoId = Number(photoId);
    const parsedRating = Number(rating);
    const cleanComment = String(comment ?? "").trim();

    if (!Number.isInteger(parsedPhotoId) || !Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Invalid review" }, { status: 400 });
    }

    // Kysely upsert for Rating using PostgreSQL onConflict on composite unique columns
    await db
      .insertInto("Rating")
      .values({
        photoId: parsedPhotoId,
        value: parsedRating,
        userId: session.user.id,
        updatedAt: new Date(),
      })
      .onConflict((oc) =>
        oc.columns(["photoId", "userId"]).doUpdateSet({
          value: parsedRating,
          updatedAt: new Date(),
        })
      )
      .execute();

    let formattedComment = null;

    if (cleanComment) {
      const inserted = await db
        .insertInto("Comment")
        .values({
          photoId: parsedPhotoId,
          body: cleanComment.slice(0, 1200),
          userId: session.user.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const commentRow = await db
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

      formattedComment = {
        id: commentRow.id,
        body: commentRow.body,
        comment: commentRow.body,
        createdAt: commentRow.createdAt,
        photoId: commentRow.photoId,
        userId: commentRow.userId,
        rating: parsedRating,
        user: {
          name: commentRow.name,
          image: commentRow.image,
          customImage: commentRow.customImage,
        },
      };
    }

    const countResult = await db
      .selectFrom("Comment")
      .where("photoId", "=", parsedPhotoId)
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst();

    const commentCount = Number(countResult?.count ?? 0);

    return NextResponse.json({ comment: formattedComment, commentCount }, { status: 201 });
  } catch (error) {
    console.error("Review Error:", error);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const photoId = Number(searchParams.get("photoId"));

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const rawComments = await db
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
      .where("Comment.photoId", "=", photoId)
      .orderBy("Comment.createdAt", "desc")
      .execute();

    const comments = rawComments.map((comment) => ({
      ...comment,
      comment: comment.body,
      rating: 0,
      user: {
        name: comment.name,
        image: comment.image,
        customImage: comment.customImage,
      },
    }));

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    return NextResponse.json({ error: "Error fetching reviews" }, { status: 500 });
  }
}