import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  const anonymousToken = cookieStore.get("astro_guest")?.value;
  const viewerWhere = session?.user?.id
    ? { photoId_userId: { photoId, userId: session.user.id } }
    : anonymousToken
      ? { photoId_anonymousToken: { photoId, anonymousToken } }
      : null;

  const [ratingStats, likeCount, currentRating, currentLike, commentCount] = await Promise.all([
    prisma.rating.aggregate({
      where: { photoId },
      _avg: { value: true },
      _count: { id: true },
    }),
    prisma.like.count({ where: { photoId } }),
    viewerWhere ? prisma.rating.findUnique({ where: viewerWhere }) : null,
    viewerWhere ? prisma.like.findUnique({ where: viewerWhere }) : null,
    prisma.comment.count({ where: { photoId } }),
  ]);

  return NextResponse.json({
    ratingAverage: ratingStats._avg.value ? Number(ratingStats._avg.value.toFixed(1)) : 0,
    ratingCount: ratingStats._count.id,
    viewerRating: currentRating?.value ?? null,
    likeCount,
    viewerLiked: Boolean(currentLike),
    commentCount,
  });
}
