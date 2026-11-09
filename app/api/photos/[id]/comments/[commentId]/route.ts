import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/server/auth.helper";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: photoIdStr, commentId: commentIdStr } = await params;
  const photoId = Number(photoIdStr);
  const commentId = Number(commentIdStr);

  if (!Number.isInteger(commentId) || !Number.isInteger(photoId)) {
    return NextResponse.json(
      { error: "Invalid comment or photo id" },
      { status: 400 },
    );
  }

  try {
    const existing = await db
      .selectFrom("Comment")
      .select(["id", "userId", "photoId"])
      .where("id", "=", commentId)
      .where("photoId", "=", photoId)
      .executeTakeFirst();

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const isAuthor = existing.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete this comment" },
        { status: 403 },
      );
    }

    await db.deleteFrom("Comment").where("id", "=", commentId).execute();
    return NextResponse.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}

