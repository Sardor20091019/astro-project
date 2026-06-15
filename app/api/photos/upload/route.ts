import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

enum PhotoCategory {
  ASTROPHOTOGRAPHY = "ASTROPHOTOGRAPHY",
  NATURE = "NATURE",
  SKY = "SKY",
  MOON = "MOON",
  WARM = "WARM",
  STREET = "STREET",
  ABSTRACT = "ABSTRACT",
  OTHER = "OTHER"
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOrigin = process.env.NEXTAUTH_URL;
  if (!origin || (allowedOrigin && origin !== allowedOrigin)) {
    return NextResponse.json({ error: "CSRF verification failed" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const photoUrl = formData.get("photoUrl") as string | null;

    if (!photoUrl || !photoUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid image URL provided" }, { status: 400 });
    }

    const val = (key: string) => {
      const value = formData.get(key);
      if (!value) return null;
      const clean = String(value).replace(/<[^>]*>/g, "").trim();
      return clean !== "" ? clean : null;
    };

    const rawTitle = formData.get("title");
    const cleanTitle = rawTitle ? String(rawTitle).replace(/<[^>]*>/g, "").trim() : "Untitled frame";
    const title = cleanTitle !== "" ? cleanTitle : "Untitled frame";

    const rawCategory = String(formData.get("category") || "OTHER").toUpperCase();
    const category = Object.values(PhotoCategory).includes(rawCategory as PhotoCategory)
      ? (rawCategory as PhotoCategory)
      : PhotoCategory.OTHER;

    const isoStr = formData.get("iso");
    const iso = isoStr ? parseInt(isoStr as string, 10) || null : null;

    const newPhoto = await prisma.photo.create({
      data: {
        url: photoUrl,
        title: title,
        location: val("location"),
        coordinates: val("coordinates"),
        camera: val("camera"),
        iso: iso,
        aperture: val("aperture"),
        shutter: val("shutter"),
        focalLength: val("focalLength"),
        authorName: String(session.user.name || "Anonymous").trim(),
        category: category,
        status: "PENDING",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      id: newPhoto.id,
      url: newPhoto.url,
      title: newPhoto.title,
      authorName: newPhoto.authorName,
      status: newPhoto.status
    }, { status: 201 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}