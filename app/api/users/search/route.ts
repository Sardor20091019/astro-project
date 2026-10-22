import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const trimmedQuery = query.replace(/[<>]/g, "").trim();

    if (!trimmedQuery) {
      return NextResponse.json([]);
    }

    const escapedQuery = trimmedQuery.replace(/[%_\\]/g, "\\$&");

    const users = await db
      .selectFrom("User")
      .select(["id", "name", "image", "telegramUsername"])
      .where("id", "!=", user.id)
      .where((eb) =>
        eb.or([
          eb("name", "ilike", `%${escapedQuery}%`),
          eb("telegramUsername", "ilike", `%${escapedQuery}%`),
        ]),
      )
      .limit(10)
      .execute();

    return NextResponse.json(users);
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

