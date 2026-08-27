import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const [session, cookieStore] = await Promise.all([
    getServerSession(authOptions), 
    cookies()
  ]);
  
  const anonymousToken = cookieStore.get("astro_guest")?.value;
  const userId = session?.user?.id;

  const [ratingStats, likeCountRes, currentRating, currentLike, commentCountRes] = await Promise.all([
    db
      .selectFrom("Rating")
      .where("photoId", "=", photoId)
      .select([
        (eb) => eb.fn.avg("value").as("avg"),
        (eb) => eb.fn.count("id").as("count"),
      ])
      .executeTakeFirst(),
    db
      .selectFrom("Like")
      .where("photoId", "=", photoId)
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst(),
    userId
      ? db
          .selectFrom("Rating")
          .select("value")
          .where("photoId", "=", photoId)
          .where("userId", "=", userId)
          .executeTakeFirst()
      : Promise.resolve(null),
    userId
      ? db
          .selectFrom("Like")
          .selectAll()
          .where("photoId", "=", photoId)
          .where("userId", "=", userId)
          .executeTakeFirst()
      : anonymousToken
      ? db
          .selectFrom("Like")
          .selectAll()
          .where("photoId", "=", photoId)
          .where("anonymousToken", "=", anonymousToken)
          .executeTakeFirst()
      : Promise.resolve(null),
    db
      .selectFrom("Comment")
      .where("photoId", "=", photoId)
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst(),
  ]);

  const rawAvg = ratingStats?.avg;
  const ratingAverage = rawAvg !== null && rawAvg !== undefined 
    ? Number(Number(rawAvg).toFixed(1)) 
    : 0;
  
  const ratingCount = Number(ratingStats?.count ?? 0);
  const likeCount = Number(likeCountRes?.count ?? 0);
  const commentCount = Number(commentCountRes?.count ?? 0);

  return NextResponse.json({
    ratingAverage,
    ratingCount,
    viewerRating: currentRating?.value ?? null,
    likeCount,
    viewerLiked: Boolean(currentLike),
    commentCount,
  });
}