import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getAuthenticatedUser,
  resolveGuestToken,
  attachGuestCookie,
} from "@/server/auth.helper";
import { MemoryRateLimiter, getClientIdentifier } from "@/lib/rate-limit";

const ratingLimiter = new MemoryRateLimiter(30, 60 * 1000);

export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req, "ratings");
  const rateCheck = ratingLimiter.check(clientId, 30, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many rating requests. Please slow down." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const parsedPhotoId = Number(body?.photoId);
    const parsedValue = Number(body?.value);

    if (
      !Number.isInteger(parsedPhotoId) ||
      !Number.isInteger(parsedValue) ||
      parsedValue < 1 ||
      parsedValue > 5
    ) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(req);
    const guest = resolveGuestToken(req);

    const userId = user?.id;
    const anonymousToken = guest.token;

    const existing = userId
      ? await db
          .selectFrom("Rating")
          .selectAll()
          .where("photoId", "=", parsedPhotoId)
          .where("userId", "=", userId)
          .executeTakeFirst()
      : await db
          .selectFrom("Rating")
          .selectAll()
          .where("photoId", "=", parsedPhotoId)
          .where("anonymousToken", "=", anonymousToken)
          .executeTakeFirst();

    if (existing) {
      await db
        .updateTable("Rating")
        .set({
          value: parsedValue,
          updatedAt: new Date(),
        })
        .where("id", "=", existing.id)
        .execute();
    } else {
      await db
        .insertInto("Rating")
        .values({
          photoId: parsedPhotoId,
          value: parsedValue,
          userId: userId || null,
          anonymousToken: userId ? null : anonymousToken,
          updatedAt: new Date(),
        })
        .execute();
    }

    const stats = await db
      .selectFrom("Rating")
      .where("photoId", "=", parsedPhotoId)
      .select([
        (eb) => eb.fn.avg("value").as("avg"),
        (eb) => eb.fn.count("id").as("count"),
      ])
      .executeTakeFirst();

    const rawAvg = stats?.avg;
    const ratingAverage =
      rawAvg !== null && rawAvg !== undefined
        ? Number(Number(rawAvg).toFixed(1))
        : 0;
    const ratingCount = Number(stats?.count ?? 0);

    const res = NextResponse.json({
      ratingAverage,
      ratingCount,
      viewerRating: parsedValue,
    });

    if (guest.isNew && !userId) {
      attachGuestCookie(res, anonymousToken);
    }

    return res;
  } catch (error) {
    console.error("Rating API Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

