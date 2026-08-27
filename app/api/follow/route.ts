import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetUserId } = await req.json();
  if (!targetUserId || targetUserId === session.user.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const existing = await db
    .selectFrom("Follows")
    .selectAll()
    .where("followerId", "=", session.user.id)
    .where("followingId", "=", targetUserId)
    .executeTakeFirst();

  if (existing) {
    await db
      .deleteFrom("Follows")
      .where("followerId", "=", session.user.id)
      .where("followingId", "=", targetUserId)
      .execute();
  } else {
    await db
      .insertInto("Follows")
      .values({
        followerId: session.user.id,
        followingId: targetUserId,
      })
      .execute();
  }

  const countResult = await db
    .selectFrom("Follows")
    .where("followingId", "=", targetUserId)
    .select((eb) => eb.fn.count("followerId").as("count"))
    .executeTakeFirst();

  const followerCount = Number(countResult?.count ?? 0);

  return NextResponse.json({ following: !existing, followerCount });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");

  if (!targetUserId) {
    return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
  }

  const [followerCountRes, followingCountRes] = await Promise.all([
    db
      .selectFrom("Follows")
      .where("followingId", "=", targetUserId)
      .select((eb) => eb.fn.count("followerId").as("count"))
      .executeTakeFirst(),
    db
      .selectFrom("Follows")
      .where("followerId", "=", targetUserId)
      .select((eb) => eb.fn.count("followingId").as("count"))
      .executeTakeFirst(),
  ]);

  const followerCount = Number(followerCountRes?.count ?? 0);
  const followingCount = Number(followingCountRes?.count ?? 0);

  let isFollowing = false;
  if (session?.user?.id) {
    const rel = await db
      .selectFrom("Follows")
      .select("followerId")
      .where("followerId", "=", session.user.id)
      .where("followingId", "=", targetUserId)
      .executeTakeFirst();
    
    isFollowing = Boolean(rel);
  }

  return NextResponse.json({ followerCount, followingCount, isFollowing });
}