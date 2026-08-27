import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const users = await db
      .selectFrom("User")
      .select(["id", "name", "image", "email"])
      .where("id", "!=", session.user.id)
      .where((eb) =>
        eb.or([
          eb("name", "ilike", `%${query}%`),
          eb("email", "ilike", `%${query}%`),
        ])
      )
      .limit(10)
      .execute();

    return NextResponse.json(users);
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}