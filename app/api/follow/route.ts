import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetUserId } = await req.json();
  if (!targetUserId || targetUserId === session.user.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: targetUserId },
    });
  }

  const followerCount = await prisma.follow.count({ where: { followingId: targetUserId } });
  return NextResponse.json({ following: !existing, followerCount });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");

  if (!targetUserId) {
    return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
  }

  const [followerCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetUserId } }),
    prisma.follow.count({ where: { followerId: targetUserId } }),
  ]);

  let isFollowing = false;
  if (session?.user?.id) {
    const rel = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
    });
    isFollowing = Boolean(rel);
  }

  return NextResponse.json({ followerCount, followingCount, isFollowing });
}
