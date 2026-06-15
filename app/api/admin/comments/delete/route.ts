import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface AdminSessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export async function DELETE(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOrigin = process.env.NEXTAUTH_URL;
  if (!origin || (allowedOrigin && origin !== allowedOrigin)) {
    return NextResponse.json({ error: "CSRF verification failed" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const user = session?.user as AdminSessionUser | undefined;

  if (!session || !user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const idString = searchParams.get("id");
    if (!idString) {
      return NextResponse.json({ error: "Missing comment identity target" }, { status: 400 });
    }

    const commentId = parseInt(idString, 10);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid identity format" }, { status: 400 });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Administrative execution error:", error);
    return NextResponse.json({ error: "Action execution failed" }, { status: 500 });
  }
}