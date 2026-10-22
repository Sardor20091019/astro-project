import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/server/auth.helper";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json(
      { error: "Invalid photo ID" },
      { status: 400 },
    );
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

    const comments = rawComments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt:
        c.createdAt instanceof Date
          ? c.createdAt.toISOString()
          : c.createdAt,
      photoId: c.photoId,
      userId: c.userId,
      user: {
        name: c.name || "Anonymous",
        image: c.image ?? null,
        customImage: c.customImage ?? null,
      },
    }));

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json(
      { error: "Invalid photo ID" },
      { status: 400 },
    );
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to comment" },
      { status: 401 },
    );
  }

  try {
    const bodyData = await req.json();
    const cleanBody = String(bodyData.body ?? "")
      .replace(/[<>]/g, "")
      .trim();

    if (!cleanBody) {
      return NextResponse.json(
        { error: "Comment body cannot be empty" },
        { status: 400 },
      );
    }

    const inserted = await db
      .insertInto("Comment")
      .values({
        photoId,
        body: cleanBody.slice(0, 1200),
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

    return NextResponse.json({
      id: commentRow.id,
      body: commentRow.body,
      createdAt:
        commentRow.createdAt instanceof Date
          ? commentRow.createdAt.toISOString()
          : commentRow.createdAt,
      photoId: commentRow.photoId,
      userId: commentRow.userId,
      user: {
        name: commentRow.name || "Anonymous",
        image: commentRow.image ?? null,
        customImage: commentRow.customImage ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}

