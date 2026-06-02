import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
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

// Update this section in app/api/ratings/route.ts
const existing = userId
  ? await prisma.rating.findUnique({ 
      where: { 
        photoId_userId_unique: { photoId: parsedPhotoId, userId } 
      } 
    })
  : await prisma.rating.findUnique({ 
      where: { 
        photoId_anonymousToken_unique: { photoId: parsedPhotoId, anonymousToken } 
      } 
    });

    // Manual Update/Create logic
    if (existing) {
      await prisma.rating.update({
        where: { id: existing.id },
        data: { value: parsedValue },
      });
    } else {
      await prisma.rating.create({
        data: {
          photoId: parsedPhotoId,
          value: parsedValue,
          userId: userId || null,
          anonymousToken: userId ? null : anonymousToken,
        },
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
        maxAge: 31536000,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}