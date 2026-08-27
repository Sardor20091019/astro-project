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
    const { photoId } = await req.json();
    const parsedPhotoId = Number(photoId);

    if (!Number.isInteger(parsedPhotoId)) {
      return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const anonymousToken = cookieStore.get("astro_guest")?.value ?? randomUUID();
    const shouldSetGuestCookie = !cookieStore.get("astro_guest");

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
          id: randomUUID(),
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
    const response = NextResponse.json({ liked: !existing, likeCount });

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
    console.error("Like API error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}