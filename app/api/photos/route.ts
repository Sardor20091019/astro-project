import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const formData = await req.formData();
    // 1. READ THE TEXT URL SENT BY UPLOADTHING
    const photoUrl = formData.get("photoUrl") as string | null;

    if (!photoUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // 2. SAVE DIRECTLY TO NEON DATABASE
    const newPhoto = await prisma.photo.create({
      data: {
        url: photoUrl, // Directly uses the secure UploadThing link
        title: String(formData.get("title") || "Untitled frame").trim(),
        location: String(formData.get("location") || "").trim() || null,
        coordinates: String(formData.get("coordinates") || "").trim() || null,
        camera: String(formData.get("camera") || "").trim() || null,
        iso: Number(formData.get("iso")) || null,
        aperture: String(formData.get("aperture") || "").trim() || null,
        shutter: String(formData.get("shutter") || "").trim() || null,
        focalLength: String(formData.get("focalLength") || "").trim() || null,
        authorName: String(formData.get("authorName") || session?.user?.name || "Anonymous").trim() || null,
        category: (String(formData.get("category") || "OTHER")) as any,
        status: "APPROVED", // Stays instantly live!
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error("Database Save Error:", error);
    return NextResponse.json({ error: "Failed to publish frame to database" }, { status: 500 });
  }
}