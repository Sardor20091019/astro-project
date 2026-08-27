import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const photoId = Number(searchParams.get("photoId"));

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Missing or invalid photo id" }, { status: 400 });
  }

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

  const comments = rawComments.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt,
    photoId: c.photoId,
    userId: c.userId,
    user: {
      name: c.name,
      image: c.image,
      customImage: c.customImage,
    },
  }));

  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required to comment" }, { status: 401 });
  }

  const { photoId, body } = await req.json();
  const parsedPhotoId = Number(photoId);
  const cleanBody = String(body ?? "").trim();

  if (!Number.isInteger(parsedPhotoId) || cleanBody.length < 2) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
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

  const comment = {
    id: commentRow.id,
    body: commentRow.body,
    createdAt: commentRow.createdAt,
    photoId: commentRow.photoId,
    userId: commentRow.userId,
    user: {
      name: commentRow.name,
      image: commentRow.image,
      customImage: commentRow.customImage,
    },
  };

  return NextResponse.json(comment, { status: 201 });
}