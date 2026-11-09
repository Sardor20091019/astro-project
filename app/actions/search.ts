"use server";

import { db } from "@/lib/db";

export async function searchUsers(query: string) {
  const cleanQuery = String(query ?? "").trim().slice(0, 100);
  if (!cleanQuery) return [];

  const escapedQuery = cleanQuery.replace(/[%_\\]/g, "\\$&");

  return await db
    .selectFrom("User")
    .select(["id", "name", "image", "telegramUsername"])
    .where((eb) =>
      eb.or([
        eb("name", "ilike", `%${escapedQuery}%`),
        eb("telegramUsername", "ilike", `%${escapedQuery}%`),
      ])
    )
    .limit(5)
    .execute();
}