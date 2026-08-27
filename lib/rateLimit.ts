import { db } from "@/lib/db";

export async function isRateLimited(ip: string, limit: number = 5, windowMs: number = 60000): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMs);

  const result = await db
    .selectFrom("otptoken")
    .select((eb) => eb.fn.count("id").as("count"))
    .where("ipAddress", "=", ip)
    .where("createdAt", ">=", cutoff)
    .executeTakeFirst();

  const requestCount = Number(result?.count ?? 0);

  return requestCount >= limit;
}