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

  if (!session || !user || user.role !== "ADMIN" || !user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("id");
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing user identity target" }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Self-destruction blocked" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: targetUserId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Administrative execution error:", error);
    return NextResponse.json({ error: "Action execution failed" }, { status: 500 });
  }
}