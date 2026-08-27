import { unlink } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const photoId = Number(id);
  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const photo = await db
    .selectFrom("Photo")
    .selectAll()
    .where("id", "=", photoId)
    .executeTakeFirst();

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const admin = isAdmin(session.user.email);
  const owner = photo.userId === session.user.id;

  if (!admin && !owner) {
    return NextResponse.json({ error: "You can only delete your own photos" }, { status: 403 });
  }

  if (photo.url.startsWith("/uploads/")) {
    try {
      await unlink(join(process.cwd(), "public", photo.url));
    } catch {}
  }

  await db
    .deleteFrom("Photo")
    .where("id", "=", photoId)
    .execute();

  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const photoId = Number(id);
  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const photo = await db
    .selectFrom("Photo")
    .selectAll()
    .where("id", "=", photoId)
    .executeTakeFirst();

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = isAdmin(session.user.email);
  const owner = photo.userId === session.user.id;

  if (!admin && !owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updateData: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) updateData.title = body.title.trim();
  if (typeof body.category === "string") updateData.category = body.category;
  if (typeof body.location === "string") updateData.location = body.location.trim() || null;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(photo);
  }

  const updated = await db
    .updateTable("Photo")
    .set(updateData)
    .where("id", "=", photoId)
    .returningAll()
    .executeTakeFirst();

  return NextResponse.json(updated);
}