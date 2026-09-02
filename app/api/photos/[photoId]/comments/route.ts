import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const { photoId: photoIdStr } = await params;
  const photoId = Number(photoIdStr);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json(
      { error: "Invalid photo ID" },
      { status: 400 }
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
      { status: 500 }
    );
  }
}
