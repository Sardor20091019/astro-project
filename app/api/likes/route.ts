import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getAuthenticatedUser,
  resolveGuestToken,
  attachGuestCookie,
} from "@/server/auth.helper";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const likeRateLimitMap = new Map<string, RateLimitEntry>();
const MAX_LIKE_MUTATIONS_PER_MIN = 60;
const LIKE_RATE_WINDOW_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";
  const now = Date.now();
  const entry = likeRateLimitMap.get(ip);

  if (entry && now < entry.resetTime) {
    if (entry.count >= MAX_LIKE_MUTATIONS_PER_MIN) {
      return NextResponse.json(
        { error: "Too many like requests. Please slow down." },
        { status: 429 },
      );
    }
    entry.count += 1;
  } else {
    likeRateLimitMap.set(ip, {
      count: 1,
      resetTime: now + LIKE_RATE_WINDOW_MS,
    });
  }

  try {
    const body = await req.json();
    const parsedPhotoId = Number(body?.photoId);

    if (!Number.isInteger(parsedPhotoId)) {
      return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(req);
    const guest = resolveGuestToken(req);

    const userId = user?.id;
    const anonymousToken = guest.token;

    const existing = userId
      ? await db
          .selectFrom("Like")
          .selectAll()
          .where("photoId", "=", parsedPhotoId)
          .where("userId", "=", userId)
          .executeTakeFirst()
      : await db
          .selectFrom("Like")
          .selectAll()
          .where("photoId", "=", parsedPhotoId)
          .where("anonymousToken", "=", anonymousToken)
          .executeTakeFirst();

    if (existing) {
      await db
        .deleteFrom("Like")
        .where("id", "=", existing.id)
        .execute();
    } else {
      await db
        .insertInto("Like")
        .values({
          photoId: parsedPhotoId,
          userId: userId || null,
          anonymousToken: userId ? null : anonymousToken,
        })
        .execute();
    }

    const countResult = await db
      .selectFrom("Like")
      .where("photoId", "=", parsedPhotoId)
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst();

    const likeCount = Number(countResult?.count ?? 0);
    const res = NextResponse.json({ liked: !existing, likeCount });

    if (guest.isNew && !userId) {
      attachGuestCookie(res, anonymousToken);
    }

    return res;
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

