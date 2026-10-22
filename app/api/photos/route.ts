import { NextRequest, NextResponse } from "next/server";
import {
  getApprovedPhotos,
  createPhoto,
} from "@/server/photos.service";
import { getAuthenticatedUser } from "@/server/auth.helper";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") || undefined;
    const seed = searchParams.get("seed");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const category = searchParams.get("category") || undefined;

    let result;
    if (cursor !== undefined || seed !== null || page === null) {
      const parsedSeed = seed !== null ? Number(seed) : undefined;
      const parsedLimit = limit !== null ? Number(limit) : 24;
      result = await getApprovedPhotos({
        cursor: cursor || undefined,
        seed: Number.isInteger(parsedSeed) ? parsedSeed : undefined,
        limit: parsedLimit,
        category: category || undefined,
      });
    } else {
      const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
      const limitNum = Math.min(
        100,
        Math.max(1, parseInt(limit || "24", 10) || 24),
      );
      result = await getApprovedPhotos(pageNum, limitNum);
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    console.error("CRITICAL FETCH PHOTOS ERROR:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your request." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to publish photos" },
        { status: 401 },
      );
    }

    let body: any;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await req.json();
    }

    const created = await createPhoto(body, user.id);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    const message = error?.message || "Failed to create photo";
    const status =
      message.includes("rejected") ||
      message.includes("originat") ||
      message.includes("No image")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

