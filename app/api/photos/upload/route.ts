/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const formData = await req.formData();
    const photoUrl = formData.get("photoUrl") as string | null;

    if (!photoUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }


    const val = (key: string) => {
      const value = formData.get(key);
      return value && String(value).trim() !== "" ? String(value).trim() : null;
    };


    const newPhoto = await prisma.photo.create({
      data: {
        url: photoUrl,
        title: String(formData.get("title") || "Untitled frame").trim(),
        location: val("location"),
        coordinates: val("coordinates"),
        camera: val("camera"),
  
        iso: formData.get("iso") ? parseInt(formData.get("iso") as string) || null : null,
        aperture: val("aperture"),
        shutter: val("shutter"),
        focalLength: val("focalLength"),
        authorName: String(formData.get("authorName") || session?.user?.name || "Anonymous").trim(),
        category: (String(formData.get("category") || "OTHER")) as any,
        status: "APPROVED", 
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}