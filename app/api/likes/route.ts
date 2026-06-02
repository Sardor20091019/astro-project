import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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

    // 1. Identify existing like record
    const whereCondition = userId
      ? { photoId_userId: { photoId: parsedPhotoId, userId } }
      : { photoId_anonymousToken: { photoId: parsedPhotoId, anonymousToken } };

    const existing = await prisma.like.findUnique({ where: whereCondition });

    // 2. Toggle Like (Delete or Create)
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: {
          photoId: parsedPhotoId,
          userId: userId || null,
          anonymousToken: userId ? null : anonymousToken,
        },
      });
    }

    // 3. Return updated count
    const likeCount = await prisma.like.count({ where: { photoId: parsedPhotoId } });
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
    console.error("Like Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}