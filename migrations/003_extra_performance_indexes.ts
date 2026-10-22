import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createIndex("User_role_idx").on("User").column("role").execute();
  await db.schema.createIndex("Photo_status_category_idx").on("Photo").columns(["status", "category"]).execute();
  await db.schema.createIndex("Photo_status_id_idx").on("Photo").columns(["status", "id"]).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("User_role_idx").execute();
  await db.schema.dropIndex("Photo_status_category_idx").execute();
  await db.schema.dropIndex("Photo_status_id_idx").execute();
}

