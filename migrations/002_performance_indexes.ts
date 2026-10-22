import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Photo foreign key and filter indexes
  await db.schema.createIndex("Photo_userId_idx").on("Photo").column("userId").execute();
  await db.schema.createIndex("Photo_status_createdAt_idx").on("Photo").columns(["status", "createdAt"]).execute();
  await db.schema.createIndex("Photo_category_idx").on("Photo").column("category").execute();

  // Follows reverse index (enables fast follower counts and joins)
  await db.schema.createIndex("Follows_followingId_idx").on("Follows").column("followingId").execute();

  // OTP token lookup, expiration cleanup, and rate limiting indexes
  await db.schema.createIndex("otptoken_email_idx").on("otptoken").column("email").execute();
  await db.schema.createIndex("otptoken_ipAddress_createdAt_idx").on("otptoken").columns(["ipAddress", "createdAt"]).execute();
  await db.schema.createIndex("otptoken_expires_idx").on("otptoken").column("expires").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("Photo_userId_idx").execute();
  await db.schema.dropIndex("Photo_status_createdAt_idx").execute();
  await db.schema.dropIndex("Photo_category_idx").execute();
  await db.schema.dropIndex("Follows_followingId_idx").execute();
  await db.schema.dropIndex("otptoken_email_idx").execute();
  await db.schema.dropIndex("otptoken_ipAddress_createdAt_idx").execute();
  await db.schema.dropIndex("otptoken_expires_idx").execute();
}

