/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const formData = await req.formData();
    // Read the text image URL passed from your SubmitPage
    const photoUrl = formData.get("photoUrl") as string | null;

    if (!photoUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // Save directly to Neon Database
    const newPhoto = await prisma.photo.create({
      data: {
        url: photoUrl,
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
        status: "APPROVED", // Always live immediately
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}