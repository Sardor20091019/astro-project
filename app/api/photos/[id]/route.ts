import { NextRequest, NextResponse } from "next/server";
import {
  getPhotoById,
  updatePhoto,
  deletePhoto,
} from "@/server/photos.service";
import {
  getAuthenticatedUser,
  resolveGuestToken,
} from "@/server/auth.helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const queryUserId = searchParams.get("userId") || undefined;
  const queryAnonToken = searchParams.get("anonymousToken") || undefined;

  const user = await getAuthenticatedUser(req);
  const guest = resolveGuestToken(req);

  const userId = user?.id || queryUserId;
  const anonymousToken = guest.token || queryAnonToken;

  const photo = await getPhotoById(photoId, userId, anonymousToken);
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return NextResponse.json(photo);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updatePhoto(
      photoId,
      body,
      user.id,
      user.role === "ADMIN",
    );
    return NextResponse.json(updated);
  } catch (err: any) {
    const status = err.message?.includes("Forbidden")
      ? 403
      : err.message?.includes("not found")
        ? 404
        : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await deletePhoto(
      photoId,
      user.id,
      user.role === "ADMIN",
    );
    return NextResponse.json(result);
  } catch (err: any) {
    const status = err.message?.includes("Forbidden")
      ? 403
      : err.message?.includes("not found")
        ? 404
        : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

