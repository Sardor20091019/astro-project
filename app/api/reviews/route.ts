import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { photoId, rating, comment } = await req.json();
    const parsedPhotoId = Number(photoId);
    const parsedRating = Number(rating);
    const cleanComment = String(comment ?? "").trim();

    if (!Number.isInteger(parsedPhotoId) || !Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Invalid review" }, { status: 400 });
    }

    await prisma.rating.upsert({
      where: { photoId_userId: { photoId: parsedPhotoId, userId: session.user.id } },
      update: { value: parsedRating },
      create: {
        photoId: parsedPhotoId,
        value: parsedRating,
        userId: session.user.id,
      },
    });

    const newComment = cleanComment
      ? await prisma.comment.create({
          data: {
            photoId: parsedPhotoId,
            body: cleanComment.slice(0, 1200),
            userId: session.user.id,
          },
        })
      : null;

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Review Error:", error);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const photoId = Number(searchParams.get("photoId"));

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { photoId },
      include: {
        user: {
          select: { name: true, image: true, customImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      comments.map((comment) => ({
        ...comment,
        comment: comment.body,
        rating: 0,
      })),
    );
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    return NextResponse.json({ error: "Error fetching reviews" }, { status: 500 });
  }
}
