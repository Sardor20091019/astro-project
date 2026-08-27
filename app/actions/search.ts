"use server";

import { db } from "@/lib/db";

export async function searchUsers(query: string) {
  const cleanQuery = String(query ?? "").trim();
  if (!cleanQuery) return [];

  return await db
    .selectFrom("User")
    .select(["id", "name", "image", "telegramUsername"])
    .where((eb) =>
      eb.or([
        eb("name", "ilike", `%${cleanQuery}%`),
        eb("telegramUsername", "ilike", `%${cleanQuery}%`),
      ])
    )
    .limit(5)
    .execute();
}