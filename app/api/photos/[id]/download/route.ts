import { NextRequest, NextResponse } from "next/server";
import { getPhotoById } from "@/server/photos.service";
import { photos as staticPhotos } from "@/data/photos";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
  }

  // 1. Resolve photo from database or fallback static data
  let photo = await getPhotoById(photoId).catch(() => null);
  if (!photo) {
    const staticItem = staticPhotos.find((p) => p.id === photoId);
    if (staticItem) {
      photo = {
        id: staticItem.id,
        url: staticItem.src,
        title: staticItem.title,
      } as any;
    }
  }

  if (!photo || !photo.url) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  try {
    let imageBuffer: Buffer;
    let contentType = "image/jpeg";

    if (photo.url.startsWith("http://") || photo.url.startsWith("https://")) {
      // Remote image (e.g. UploadThing CDN, AWS S3)
      const remoteRes = await fetch(photo.url);
      if (!remoteRes.ok) {
        throw new Error(`Failed to fetch remote image: ${remoteRes.status}`);
      }
      const arrayBuf = await remoteRes.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuf);
      contentType = remoteRes.headers.get("content-type") || "image/jpeg";
    } else {
      // Local image (e.g. /photos/p1.jpg or /uploads/...)
      const cleanPath = photo.url.replace(/^\/+/, "");
      let filePath = path.join(process.cwd(), "public", cleanPath);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), cleanPath);
      }
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found on disk: ${photo.url}`);
      }
      imageBuffer = await fs.promises.readFile(filePath);
      if (cleanPath.endsWith(".png")) contentType = "image/png";
      else if (cleanPath.endsWith(".webp")) contentType = "image/webp";
    }

    const cleanTitle = (photo.title || "photo").toLowerCase().replace(/[^a-z0-9]/g, "-") || "photo";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const filename = `${cleanTitle}-${photo.id}.${ext}`;

    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      },
    });
  } catch (err: any) {
    console.error(`[Download Route] Error serving photo ${photoId}:`, err);
    return NextResponse.json({ error: "Failed to download image" }, { status: 500 });
  }
}
