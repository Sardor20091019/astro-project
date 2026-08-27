import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetUserId } = await req.json();
    const currentUserId = session.user.id;

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    const existingFollow = await db
      .selectFrom("Follows")
      .selectAll()
      .where("followerId", "=", currentUserId)
      .where("followingId", "=", targetUserId)
      .executeTakeFirst();

    if (existingFollow) {
      await db
        .deleteFrom("Follows")
        .where("followerId", "=", currentUserId)
        .where("followingId", "=", targetUserId)
        .execute();

      return NextResponse.json({ message: "Unfollowed successfully", following: false });
    } else {
      await db
        .insertInto("Follows")
        .values({
          followerId: currentUserId,
          followingId: targetUserId,
        })
        .execute();

      return NextResponse.json({ message: "Followed successfully", following: true });
    }
  } catch (error) {
    console.error("Follow Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}