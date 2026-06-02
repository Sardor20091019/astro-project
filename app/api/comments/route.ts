import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const photoId = Number(searchParams.get("photoId"));

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Missing or invalid photo id" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { photoId },
    include: {
      user: {
        select: { name: true, image: true, customImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required to comment" }, { status: 401 });
  }

  const { photoId, body } = await req.json();
  const parsedPhotoId = Number(photoId);
  const cleanBody = String(body ?? "").trim();

  if (!Number.isInteger(parsedPhotoId) || cleanBody.length < 2) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      photoId: parsedPhotoId,
      body: cleanBody.slice(0, 1200),
      userId: session.user.id,
    },
    include: {
      user: {
        select: { name: true, image: true, customImage: true },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
