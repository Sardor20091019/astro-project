import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      url, title, category, location, coordinates, 
      camera, iso, aperture, shutter, focalLength, authorName 
    } = body;

    if (!url || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // This handles your Neon database insertions
    const newPhoto = await prisma.photo.create({
      data: {
        url,
        title,
        category,
        location,
        coordinates,
        camera,
        iso: iso ? parseInt(iso) : null,
        aperture,
        shutter,
        focalLength,
        authorName,
        userId: session.user.id,
        status: "APPROVED" 
      },
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error("Database submission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}