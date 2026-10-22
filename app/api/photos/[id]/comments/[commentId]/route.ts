import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/server/auth.helper";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { commentId: commentIdStr } = await params;
  const commentId = Number(commentIdStr);

  if (!Number.isInteger(commentId)) {
    return NextResponse.json(
      { error: "Invalid comment id" },
      { status: 400 },
    );
  }

  try {
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

