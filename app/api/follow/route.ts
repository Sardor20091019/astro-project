import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"
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

  // 1. Use 'follows' (plural) to match your schema model 'Follows'
  const existing = await prisma.follows.findUnique({
    where: { 
      followerId_followingId: { 
        followerId: session.user.id, 
        followingId: targetUserId 
      } 
    },
  });

  if (existing) {
    // 2. Fix: Change .follow to .follows
    await prisma.follows.delete({ 
      where: { 
        followerId_followingId: { 
          followerId: session.user.id, 
          followingId: targetUserId 
        } 
      } 
    });
  } else {
    // 3. Fix: Change .follow to .follows
    await prisma.follows.create({
      data: { followerId: session.user.id, followingId: targetUserId },
    });
  }

  const followerCount = await prisma.follows.count({ where: { followingId: targetUserId } });
  return NextResponse.json({ following: !existing, followerCount });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");

  if (!targetUserId) {
    return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
  }

  // 4. Fix: Change all instances of .follow to .follows
  const [followerCount, followingCount] = await Promise.all([
    prisma.follows.count({ where: { followingId: targetUserId } }),
    prisma.follows.count({ where: { followerId: targetUserId } }),
  ]);

  let isFollowing = false;
  if (session?.user?.id) {
    const rel = await prisma.follows.findUnique({
      where: { 
        followerId_followingId: { 
          followerId: session.user.id, 
          followingId: targetUserId 
        } 
      },
    });
    isFollowing = Boolean(rel);
  }

  return NextResponse.json({ followerCount, followingCount, isFollowing });
}