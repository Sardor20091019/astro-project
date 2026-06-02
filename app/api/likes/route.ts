import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const { photoId } = await req.json();
  const parsedPhotoId = Number(photoId);

  if (!Number.isInteger(parsedPhotoId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  const anonymousToken = cookieStore.get("astro_guest")?.value ?? randomUUID();
  const shouldSetGuestCookie = !cookieStore.get("astro_guest");

  const existing = session?.user?.id
    ? await prisma.like.findUnique({
        where: { photoId_userId: { photoId: parsedPhotoId, userId: session.user.id } },
      })
    : await prisma.like.findUnique({
        where: { photoId_anonymousToken: { photoId: parsedPhotoId, anonymousToken } },
      });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: {
        photoId: parsedPhotoId,
        userId: session?.user?.id,
        anonymousToken: session?.user?.id ? null : anonymousToken,
      },
    });
  }

  const likeCount = await prisma.like.count({ where: { photoId: parsedPhotoId } });
  const response = NextResponse.json({ liked: !existing, likeCount });
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
