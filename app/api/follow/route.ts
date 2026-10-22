import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/server/auth.helper";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to follow users" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId || targetUserId === user.id) {
      return NextResponse.json(
        { error: "Invalid target user" },
        { status: 400 },
      );
    }

    const existing = await db
      .selectFrom("Follows")
      .selectAll()
      .where("followerId", "=", user.id)
      .where("followingId", "=", targetUserId)
      .executeTakeFirst();

    if (existing) {
      await db
        .deleteFrom("Follows")
        .where("followerId", "=", user.id)
        .where("followingId", "=", targetUserId)
        .execute();
    } else {
      await db
        .insertInto("Follows")
        .values({
          followerId: user.id,
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
  } catch (error) {
    console.error("Follow toggle error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");

  if (!targetUserId) {
    return NextResponse.json(
      { error: "Missing targetUserId" },
      { status: 400 },
    );
  }

  const user = await getAuthenticatedUser(req);

  try {
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
    if (user?.id) {
      const rel = await db
        .selectFrom("Follows")
        .select("followerId")
        .where("followerId", "=", user.id)
        .where("followingId", "=", targetUserId)
        .executeTakeFirst();

      isFollowing = Boolean(rel);
    }

    return NextResponse.json({ followerCount, followingCount, isFollowing });
  } catch (error) {
    console.error("Follow stats error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

