import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getAuthenticatedUser,
  resolveGuestToken,
  attachGuestCookie,
} from "@/server/auth.helper";
import { MemoryRateLimiter, getClientIdentifier } from "@/lib/rate-limit";

const likeLimiter = new MemoryRateLimiter(60, 60 * 1000);

export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req, "likes");
  const rateCheck = likeLimiter.check(clientId, 60, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many like requests. Please slow down." },
      { status: 429 },
    );
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

