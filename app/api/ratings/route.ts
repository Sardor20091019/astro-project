/* eslint-disable @typescript-eslint/no-unused-vars */
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { photoId, value } = await req.json();
    const parsedPhotoId = Number(photoId);
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedPhotoId) || !Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const anonymousToken = cookieStore.get("astro_guest")?.value ?? randomUUID();
    const shouldSetGuestCookie = !cookieStore.get("astro_guest");

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
    const ratingAverage = rawAvg !== null && rawAvg !== undefined 
      ? Number(Number(rawAvg).toFixed(1)) 
      : 0;
    const ratingCount = Number(stats?.count ?? 0);

    const response = NextResponse.json({
      ratingAverage,
      ratingCount,
      viewerRating: parsedValue,
    });

    if (shouldSetGuestCookie) {
      response.cookies.set("astro_guest", anonymousToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 31536000,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    console.error("Rating API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}