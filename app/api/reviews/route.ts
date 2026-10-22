import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const photoIdStr = searchParams.get("photoId");
  const photoId = Number(photoIdStr);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const rawComments = await db
      .selectFrom("Comment")
      .leftJoin("User", "User.id", "Comment.userId")
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

    const reviews = rawComments.map((comment) => ({
      ...comment,
      comment: comment.body,
      rating: 0,
      user: {
        name: comment.name || "Anonymous",
        image: comment.image ?? null,
        customImage: comment.customImage ?? null,
      },
    }));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to submit review" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { photoId, rating, comment } = body;
    const parsedPhotoId = Number(photoId);
    const parsedRating = Number(rating);
    const cleanComment = String(comment ?? "")
      .replace(/[<>]/g, "")
      .trim();

    if (
      !Number.isInteger(parsedPhotoId) ||
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return NextResponse.json(
        { error: "Invalid review data" },
        { status: 400 },
      );
    }

    await db
      .insertInto("Rating")
      .values({
        photoId: parsedPhotoId,
        value: parsedRating,
        userId: user.id,
        updatedAt: new Date(),
      })
      .onConflict((oc) =>
        oc.columns(["photoId", "userId"]).doUpdateSet({
          value: parsedRating,
          updatedAt: new Date(),
        }),
      )
      .execute();

    let formattedComment: any = null;

    if (cleanComment) {
      const inserted = await db
        .insertInto("Comment")
        .values({
          photoId: parsedPhotoId,
          body: cleanComment.slice(0, 1200),
          userId: user.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const commentRow = await db
        .selectFrom("Comment")
        .leftJoin("User", "User.id", "Comment.userId")
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
          name: commentRow.name || "Anonymous",
          image: commentRow.image ?? null,
          customImage: commentRow.customImage ?? null,
        },
      };
    }

    const countResult = await db
      .selectFrom("Comment")
      .where("photoId", "=", parsedPhotoId)
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst();

    const commentCount = Number(countResult?.count ?? 0);

    return NextResponse.json({ comment: formattedComment, commentCount });
  } catch (error) {
    console.error("Review Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

