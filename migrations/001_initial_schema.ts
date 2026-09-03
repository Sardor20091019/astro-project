import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {

  await db.schema.createType("Role").asEnum(["USER", "ADMIN"]).execute();
  await db.schema.createType("PhotoStatus").asEnum(["PENDING", "APPROVED"]).execute();
  await db.schema
    .createType("PhotoCategory")
    .asEnum(["ASTROPHOTOGRAPHY", "NATURE", "SKY", "MOON", "WARM", "STREET", "ABSTRACT", "OTHER"])
    .execute();


  await db.schema
    .createTable("User")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("name", "varchar")
    .addColumn("email", "varchar", (col) => col.unique())
    .addColumn("emailVerified", "timestamp")
    .addColumn("image", "varchar")
    .addColumn("customImage", "varchar")
    .addColumn("role", sql`"Role"`, (col) => col.defaultTo("USER").notNull())
    .addColumn("telegramId", "varchar", (col) => col.unique())
    .addColumn("telegramUsername", "varchar")
    .execute();


  await db.schema
    .createTable("Account")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("userId", "varchar", (col) => col.references("User.id").onDelete("cascade").notNull())
    .addColumn("type", "varchar", (col) => col.notNull())
    .addColumn("provider", "varchar", (col) => col.notNull())
    .addColumn("providerAccountId", "varchar", (col) => col.notNull())
    .addColumn("refresh_token", "varchar")
    .addColumn("access_token", "varchar")
    .addColumn("expires_at", "integer")
    .addColumn("token_type", "varchar")
    .addColumn("scope", "varchar")
    .addColumn("id_token", "varchar")
    .addColumn("session_state", "varchar")
    .addUniqueConstraint("Account_provider_providerAccountId_key", ["provider", "providerAccountId"])
    .execute();


  await db.schema
    .createTable("Session")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("sessionToken", "varchar", (col) => col.unique().notNull())
    .addColumn("userId", "varchar", (col) => col.references("User.id").onDelete("cascade").notNull())
    .addColumn("expires", "timestamp", (col) => col.notNull())
    .execute();


  await db.schema
    .createTable("VerificationToken")
    .addColumn("identifier", "varchar", (col) => col.notNull())
    .addColumn("token", "varchar", (col) => col.unique().notNull())
    .addColumn("expires", "timestamp", (col) => col.notNull())
    .addUniqueConstraint("VerificationToken_identifier_token_key", ["identifier", "token"])
    .execute();

  await db.schema
    .createTable("Photo")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("url", "varchar", (col) => col.notNull())
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("location", "varchar")
    .addColumn("coordinates", "varchar")
    .addColumn("camera", "varchar")
    .addColumn("iso", "integer")
    .addColumn("aperture", "varchar")
    .addColumn("shutter", "varchar")
    .addColumn("focalLength", "varchar")
    .addColumn("authorName", "varchar")
    .addColumn("category", sql`"PhotoCategory"`, (col) => col.defaultTo("OTHER").notNull())
    .addColumn("status", sql`"PhotoStatus"`, (col) => col.defaultTo("APPROVED").notNull())
    .addColumn("userId", "varchar", (col) => col.references("User.id").onDelete("cascade"))
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("views", "integer", (col) => col.defaultTo(0).notNull())
    .execute();


  await db.schema
    .createTable("Follows")
    .addColumn("followerId", "varchar", (col) => col.references("User.id").onDelete("cascade").notNull())
    .addColumn("followingId", "varchar", (col) => col.references("User.id").onDelete("cascade").notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addPrimaryKeyConstraint("Follows_pkey", ["followerId", "followingId"])
    .execute();


  await db.schema
    .createTable("Message")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("text", "text", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("isRead", "boolean", (col) => col.defaultTo(false).notNull())
    .addColumn("senderId", "varchar", (col) => col.references("User.id").onDelete("cascade").notNull())
    .addColumn("receiverId", "varchar", (col) => col.references("User.id").onDelete("cascade").notNull())
    .execute();

  await db.schema.createIndex("Message_senderId_idx").on("Message").column("senderId").execute();
  await db.schema.createIndex("Message_receiverId_idx").on("Message").column("receiverId").execute();

  await db.schema
    .createTable("Rating")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("photoId", "integer", (col) => col.references("Photo.id").onDelete("cascade").notNull())
    .addColumn("userId", "varchar", (col) => col.references("User.id").onDelete("cascade"))
    .addColumn("anonymousToken", "varchar")
    .addColumn("value", "integer", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("updatedAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addUniqueConstraint("photoId_anonymousToken_unique", ["photoId", "anonymousToken"])
    .execute();


  await sql`CREATE UNIQUE INDEX "photoId_userId_unique" ON "Rating" ("photoId", "userId") WHERE "userId" IS NOT NULL`.execute(db);
  await db.schema.createIndex("Rating_photoId_idx").on("Rating").column("photoId").execute();


  await db.schema
    .createTable("Like")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("photoId", "integer", (col) => col.references("Photo.id").onDelete("cascade").notNull())
    .addColumn("userId", "varchar", (col) => col.references("User.id").onDelete("cascade"))
    .addColumn("anonymousToken", "varchar")
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addUniqueConstraint("Like_photoId_anonymousToken_unique", ["photoId", "anonymousToken"])
    .execute();


  await sql`CREATE UNIQUE INDEX "Like_photoId_userId_unique" ON "Like" ("photoId", "userId") WHERE "userId" IS NOT NULL`.execute(db);
  await db.schema.createIndex("Like_photoId_idx").on("Like").column("photoId").execute();


  await db.schema
    .createTable("Comment")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("photoId", "integer", (col) => col.references("Photo.id").onDelete("cascade").notNull())
    .addColumn("userId", "varchar", (col) => col.references("User.id").onDelete("cascade").notNull())
    .addColumn("body", "text", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  await db.schema.createIndex("Comment_photoId_idx").on("Comment").column("photoId").execute();
  await db.schema.createIndex("Comment_userId_idx").on("Comment").column("userId").execute();

 
  await db.schema
    .createTable("otptoken")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("email", "varchar", (col) => col.notNull())
    .addColumn("token", "varchar", (col) => col.notNull())
    .addColumn("expires", "timestamp", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("failedAttempts", "integer", (col) => col.defaultTo(0).notNull())
    .addColumn("ipAddress", "varchar")
    .addUniqueConstraint("otptoken_email_token_key", ["email", "token"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("otptoken").execute();
  await db.schema.dropTable("Comment").execute();
  await db.schema.dropTable("Like").execute();
  await db.schema.dropTable("Rating").execute();
  await db.schema.dropTable("Message").execute();
  await db.schema.dropTable("Follows").execute();
  await db.schema.dropTable("Photo").execute();
  await db.schema.dropTable("VerificationToken").execute();
  await db.schema.dropTable("Session").execute();
  await db.schema.dropTable("Account").execute();
  await db.schema.dropTable("User").execute();

  await db.schema.dropType("PhotoCategory").execute();
  await db.schema.dropType("PhotoStatus").execute();
  await db.schema.dropType("Role").execute();
}