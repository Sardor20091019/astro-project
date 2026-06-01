import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${safeName}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, uniqueName), Buffer.from(await file.arrayBuffer()));

    const newPhoto = await prisma.photo.create({
      data: {
        url: `/uploads/${uniqueName}`,
        title: String(formData.get("title") || "Untitled frame").trim(),
        location: String(formData.get("location") || "").trim() || null,
        coordinates: String(formData.get("coordinates") || "").trim() || null,
        camera: String(formData.get("camera") || "").trim() || null,
        iso: Number(formData.get("iso")) || null,
        aperture: String(formData.get("aperture") || "").trim() || null,
        shutter: String(formData.get("shutter") || "").trim() || null,
        focalLength: String(formData.get("focalLength") || "").trim() || null,
        authorName: String(formData.get("authorName") || session?.user?.name || "").trim() || null,
        category: (String(formData.get("category") || "OTHER")) as any,
        status: "APPROVED", // always live immediately
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
