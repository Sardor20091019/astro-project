import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/server/auth.helper";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const commentId = Number(id);

  if (!Number.isInteger(commentId)) {
    return NextResponse.json(
      { error: "Invalid review id" },
      { status: 400 },
    );
  }

  try {
    await db.deleteFrom("Comment").where("id", "=", commentId).execute();
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete review failed:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

