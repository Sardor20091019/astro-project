import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const { photoId, value } = await req.json();
  const parsedPhotoId = Number(photoId);
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedPhotoId) || !Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  const anonymousToken = cookieStore.get("astro_guest")?.value ?? randomUUID();
  const shouldSetGuestCookie = !cookieStore.get("astro_guest");

  if (session?.user?.id) {
    await prisma.rating.upsert({
      where: { photoId_userId: { photoId: parsedPhotoId, userId: session.user.id } },
      update: { value: parsedValue },
      create: { photoId: parsedPhotoId, userId: session.user.id, value: parsedValue },
    });
  } else {
    await prisma.rating.upsert({
      where: { photoId_anonymousToken: { photoId: parsedPhotoId, anonymousToken } },
      update: { value: parsedValue },
      create: { photoId: parsedPhotoId, anonymousToken, value: parsedValue },
    });
  }

  const stats = await prisma.rating.aggregate({
    where: { photoId: parsedPhotoId },
    _avg: { value: true },
    _count: { id: true },
  });

  const response = NextResponse.json({
    ratingAverage: stats._avg.value ? Number(stats._avg.value.toFixed(1)) : 0,
    ratingCount: stats._count.id,
    viewerRating: parsedValue,
  });

  if (shouldSetGuestCookie) {
    response.cookies.set("astro_guest", anonymousToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}
