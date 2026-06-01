import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const commentId = Number(id);

  if (!Number.isInteger(commentId)) {
    return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
  }

  try {
    await prisma.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete review failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
