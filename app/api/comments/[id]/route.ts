import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const commentId = Number(id);

  if (!Number.isInteger(commentId)) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
  }

  await db
    .deleteFrom("Comment")
    .where("id", "=", commentId)
    .execute();

  return NextResponse.json({ message: "Comment deleted" });
}