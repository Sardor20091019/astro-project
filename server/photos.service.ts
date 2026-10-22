import { sql } from "kysely";
import * as fs from "fs/promises";
import * as path from "path";
import { db } from "@/lib/db";
import { moderateImageUrl } from "@/lib/moderation";

export enum PhotoCategory {
  ASTROPHOTOGRAPHY = "ASTROPHOTOGRAPHY",
  NATURE = "NATURE",
  SKY = "SKY",
  MOON = "MOON",
  WARM = "WARM",
  STREET = "STREET",
  ABSTRACT = "ABSTRACT",
  OTHER = "OTHER",
}

export interface CursorPhotosOptions {
  cursor?: string;
  seed?: number;
  limit?: number;
  category?: string;
}

export interface PaginatedPhotosResult {
  photos: any[];
  nextCursor: string | null;
  seed: number;
}

export interface CreatePhotoInput {
  photoUrl: string;
  title?: string;
  location?: string;
  coordinates?: string;
  camera?: string;
  iso?: number | string | null;
  aperture?: string;
  shutter?: string;
  focalLength?: string;
  category?: string;
}

export interface UpdatePhotoInput {
  title?: string;
  category?: string;
  location?: string;
}

export async function attachPhotoAggregates(photos: any[]): Promise<any[]> {
  if (!photos || photos.length === 0) return photos;
  const photoIds = photos.map((p) => p.id);

  const [likes, comments, ratings] = await Promise.all([
    db
      .selectFrom("Like")
      .select(["photoId", sql<number>`count(*)::int`.as("count")])
      .where("photoId", "in", photoIds)
      .groupBy("photoId")
      .execute(),
    db
      .selectFrom("Comment")
      .select(["photoId", sql<number>`count(*)::int`.as("count")])
      .where("photoId", "in", photoIds)
      .groupBy("photoId")
      .execute(),
    db
      .selectFrom("Rating")
      .select([
        "photoId",
        sql<number>`COALESCE(avg(value), 0)::float`.as("avg"),
      ])
      .where("photoId", "in", photoIds)
      .groupBy("photoId")
      .execute(),
  ]);

  const likeMap = new Map<number, number>(
    likes.map((l) => [l.photoId, Number(l.count)]),
  );
  const commentMap = new Map<number, number>(
    comments.map((c) => [c.photoId, Number(c.count)]),
  );
  const ratingMap = new Map<number, number>(
    ratings.map((r) => [r.photoId, Number(r.avg)]),
  );

  return photos.map((p) => ({
    ...p,
    likeCount: likeMap.get(p.id) ?? 0,
    commentCount: commentMap.get(p.id) ?? 0,
    avgRating: ratingMap.get(p.id) ?? 0,
  }));
}

export async function getApprovedPhotos(
  pageOrOptions?: number | CursorPhotosOptions,
  limitParam = 24,
): Promise<any> {
  if (typeof pageOrOptions === "number") {
    const pageNum = Math.max(1, pageOrOptions || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limitParam) || 24));
    const offset = (pageNum - 1) * limitNum;

    const photos = await db
      .selectFrom("Photo")
      .leftJoin("User", "User.id", "Photo.userId")
      .select([
        "Photo.id",
        "Photo.url",
        "Photo.title",
        "Photo.category",
        "Photo.location",
        "Photo.coordinates",
        "Photo.camera",
        "Photo.iso",
        "Photo.aperture",
        "Photo.shutter",
        "Photo.focalLength",
        "Photo.authorName",
        "Photo.createdAt",
        sql<string | null>`COALESCE("User"."customImage", "User"."image")`.as(
          "authorAvatar",
        ),
      ])
      .where("Photo.status", "=", "APPROVED")
      .orderBy("Photo.createdAt", "desc")
      .limit(limitNum)
      .offset(offset)
      .execute();

    return await attachPhotoAggregates(photos);
  }

  const options = pageOrOptions || {};
  const seedVal =
    typeof options.seed === "number" && !Number.isNaN(options.seed)
      ? options.seed
      : Math.floor(Math.random() * 1000000);
  const limitNum = Math.min(50, Math.max(1, Number(options.limit) || 24));

  let decodedCursor: { s: string; id: number } | null = null;
  if (options.cursor) {
    try {
      const jsonStr = Buffer.from(options.cursor, "base64url").toString("utf8");
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed?.s === "string" && typeof parsed?.id === "number") {
        decodedCursor = parsed;
      }
    } catch {}
  }

  let query = db
    .selectFrom("Photo")
    .leftJoin("User", "User.id", "Photo.userId")
    .select([
      "Photo.id",
      "Photo.url",
      "Photo.title",
      "Photo.category",
      "Photo.location",
      "Photo.coordinates",
      "Photo.camera",
      "Photo.iso",
      "Photo.aperture",
      "Photo.shutter",
      "Photo.focalLength",
      "Photo.authorName",
      "Photo.createdAt",
      sql<string | null>`COALESCE("User"."customImage", "User"."image")`.as(
        "authorAvatar",
      ),
      sql<string>`md5("Photo".id::text || ${sql.raw(seedVal.toString())}::text)`.as(
        "sortKey",
      ),
    ])
    .where("Photo.status", "=", "APPROVED");

  if (options.category) {
    query = query.where("Photo.category", "=", options.category as any);
  }

  if (decodedCursor) {
    const { s: cursorSortKey, id: cursorId } = decodedCursor;
    query = query.where((eb) =>
      eb.or([
        eb(
          sql`md5("Photo".id::text || ${sql.raw(seedVal.toString())}::text)`,
          ">",
          cursorSortKey,
        ),
        eb.and([
          eb(
            sql`md5("Photo".id::text || ${sql.raw(seedVal.toString())}::text)`,
            "=",
            cursorSortKey,
          ),
          eb("Photo.id", ">", cursorId),
        ]),
      ]),
    );
  }

  query = query
    .orderBy(sql`md5("Photo".id::text || ${sql.raw(seedVal.toString())}::text)`, "asc")
    .orderBy("Photo.id", "asc")
    .limit(limitNum + 1);

  const rows = await query.execute();
  const hasMore = rows.length > limitNum;
  const photos = hasMore ? rows.slice(0, limitNum) : rows;
  const lastItem = photos[photos.length - 1];

  let nextCursor: string | null = null;
  if (hasMore && lastItem && (lastItem as any).sortKey) {
    nextCursor = Buffer.from(
      JSON.stringify({ s: (lastItem as any).sortKey, id: lastItem.id }),
    ).toString("base64url");
  }

  const cleanedPhotos = photos.map(({ sortKey, ...rest }: any) => rest);
  const enrichedPhotos = await attachPhotoAggregates(cleanedPhotos);

  return {
    photos: enrichedPhotos,
    nextCursor,
    seed: seedVal,
  };
}

export async function getPhotoById(
  photoId: number,
  userId?: string,
  anonymousToken?: string,
) {
  const photo = await db
    .selectFrom("Photo")
    .leftJoin("User", "User.id", "Photo.userId")
    .select([
      "Photo.id",
      "Photo.url",
      "Photo.title",
      "Photo.category",
      "Photo.location",
      "Photo.coordinates",
      "Photo.camera",
      "Photo.iso",
      "Photo.aperture",
      "Photo.shutter",
      "Photo.focalLength",
      "Photo.authorName",
      "Photo.createdAt",
      "Photo.userId",
      sql<string | null>`COALESCE("User"."customImage", "User"."image")`.as(
        "authorAvatar",
      ),
    ])
    .where("Photo.id", "=", photoId)
    .executeTakeFirst();

  if (!photo) return null;

  const engagement = await getPhotoEngagement(photoId, userId, anonymousToken);

  return {
    ...photo,
    ...engagement,
  };
}

export async function getPhotoEngagement(
  photoId: number,
  userId?: string,
  anonymousToken?: string,
) {
  const [
    ratingStats,
    likeCountRes,
    currentRating,
    currentLike,
    commentCountRes,
  ] = await Promise.all([
    db
      .selectFrom("Rating")
      .where("photoId", "=", photoId)
      .select([
        (eb) => eb.fn.avg("value").as("avg"),
        (eb) => eb.fn.count("id").as("count"),
      ])
      .executeTakeFirst(),
    db
      .selectFrom("Like")
      .where("photoId", "=", photoId)
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst(),
    userId
      ? db
          .selectFrom("Rating")
          .select("value")
          .where("photoId", "=", photoId)
          .where("userId", "=", userId)
          .executeTakeFirst()
      : Promise.resolve(null),
    userId
      ? db
          .selectFrom("Like")
          .selectAll()
          .where("photoId", "=", photoId)
          .where("userId", "=", userId)
          .executeTakeFirst()
      : anonymousToken
        ? db
            .selectFrom("Like")
            .selectAll()
            .where("photoId", "=", photoId)
            .where("anonymousToken", "=", anonymousToken)
            .executeTakeFirst()
        : Promise.resolve(null),
    db
      .selectFrom("Comment")
      .where("photoId", "=", photoId)
      .select((eb) => eb.fn.count("id").as("count"))
      .executeTakeFirst(),
  ]);

  const rawAvg = ratingStats?.avg;
  const ratingAverage =
    rawAvg !== null && rawAvg !== undefined
      ? Number(Number(rawAvg).toFixed(1))
      : 0;

  return {
    ratingAverage,
    ratingCount: Number(ratingStats?.count ?? 0),
    viewerRating: currentRating?.value ?? null,
    likeCount: Number(likeCountRes?.count ?? 0),
    viewerLiked: Boolean(currentLike),
    commentCount: Number(commentCountRes?.count ?? 0),
  };
}

export async function createPhoto(
  input: CreatePhotoInput,
  userId: string,
) {
  const dbUser = await db
    .selectFrom("User")
    .select(["id", "name"])
    .where("id", "=", userId)
    .executeTakeFirst();

  if (!dbUser) {
    throw new Error("Authenticated user not found");
  }
  const authorName = dbUser.name || "Anonymous Creator";

  const photoUrl = input.photoUrl;
  if (!photoUrl || typeof photoUrl !== "string") {
    throw new Error("No image URL provided");
  }

  const isTrustedUrl =
    photoUrl.startsWith("/uploads/") ||
    /^https:\/\/([a-zA-Z0-9-]+\.)*(ufs\.sh|utfs\.io|uploadthing\.com)\//i.test(
      photoUrl,
    );

  if (!isTrustedUrl) {
    throw new Error("Image URL must originate from trusted storage providers");
  }

  let photoStatus = "PENDING";
  if (photoUrl.startsWith("https://")) {
    const modResult = await moderateImageUrl(photoUrl);
    if (!modResult.isSafe) {
      if (modResult.reason === "NUDITY_DETECTED") {
        throw new Error("Image rejected: content failed moderation guidelines");
      }
      photoStatus = "PENDING";
    } else {
      photoStatus = "APPROVED";
    }
  }

  const isoVal = input.iso;
  const parsedIso =
    isoVal !== undefined && isoVal !== null ? Number(isoVal) : null;

  const rawCategory = String(input.category || "OTHER").toUpperCase();
  const category = Object.values(PhotoCategory).includes(
    rawCategory as PhotoCategory,
  )
    ? (rawCategory as PhotoCategory)
    : PhotoCategory.OTHER;

  const cleanTitle = input.title
    ? String(input.title).replace(/[<>]/g, "").trim()
    : "Untitled frame";

  return await db
    .insertInto("Photo")
    .values({
      url: photoUrl,
      title: cleanTitle || "Untitled frame",
      location: input.location
        ? input.location.replace(/[<>]/g, "").trim()
        : null,
      coordinates: input.coordinates ? input.coordinates.trim() : null,
      camera: input.camera ? input.camera.trim() : null,
      iso: Number.isNaN(parsedIso) ? null : parsedIso,
      aperture: input.aperture ? input.aperture.trim() : null,
      shutter: input.shutter ? input.shutter.trim() : null,
      focalLength: input.focalLength ? input.focalLength.trim() : null,
      authorName: authorName,
      category: category,
      status: photoStatus as any,
      userId: userId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updatePhoto(
  photoId: number,
  input: UpdatePhotoInput,
  userId: string,
  isAdmin = false,
) {
  const photo = await db
    .selectFrom("Photo")
    .selectAll()
    .where("id", "=", photoId)
    .executeTakeFirst();

  if (!photo) throw new Error("Photo not found");

  if (!isAdmin && photo.userId !== userId) {
    throw new Error("Forbidden: You can only update your own photos");
  }

  const updateData: Record<string, unknown> = {};
  if (typeof input.title === "string" && input.title.trim()) {
    updateData.title = input.title.replace(/[<>]/g, "").trim();
  }
  if (typeof input.category === "string") {
    updateData.category = input.category;
  }
  if (typeof input.location === "string") {
    updateData.location = input.location.replace(/[<>]/g, "").trim() || null;
  }

  if (Object.keys(updateData).length === 0) return photo;

  return await db
    .updateTable("Photo")
    .set(updateData)
    .where("id", "=", photoId)
    .returningAll()
    .executeTakeFirst();
}

export async function deletePhoto(
  photoId: number,
  userId: string,
  isAdmin = false,
) {
  const photo = await db
    .selectFrom("Photo")
    .selectAll()
    .where("id", "=", photoId)
    .executeTakeFirst();

  if (!photo) throw new Error("Photo not found");

  if (!isAdmin && photo.userId !== userId) {
    throw new Error("Forbidden: You can only delete your own photos");
  }

  if (photo.url.startsWith("/uploads/")) {
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const targetPath = path.resolve(
      process.cwd(),
      "public",
      photo.url.replace(/^\/+/, ""),
    );
    if (!targetPath.startsWith(uploadsDir + path.sep)) {
      throw new Error("Invalid photo file path");
    }
    try {
      await fs.unlink(targetPath);
    } catch {}
  }

  await db.deleteFrom("Photo").where("id", "=", photoId).execute();
  return { success: true };
}

