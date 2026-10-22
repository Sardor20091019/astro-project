import { NextRequest, NextResponse } from "next/server";
import { getPhotoEngagement } from "@/server/photos.service";
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

  const user = await getAuthenticatedUser(req);
  const guest = resolveGuestToken(req);

  const engagement = await getPhotoEngagement(
    photoId,
    user?.id,
    guest.token,
  );

  return NextResponse.json(engagement);
}

