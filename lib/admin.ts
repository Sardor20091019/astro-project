import { db } from "@/lib/db";

export async function isAdmin(identifier?: string | null): Promise<boolean> {
  if (!identifier) return false;
  if (identifier === "ADMIN") return true;

  const user = await db
    .selectFrom("User")
    .select("role")
    .where((eb) =>
      eb.or([
        eb("id", "=", identifier),
        eb("email", "=", identifier.toLowerCase().trim()),
      ])
    )
    .executeTakeFirst();

  return user?.role === "ADMIN";
}

export function isAdminRole(role?: string | null): boolean {
  return role === "ADMIN";
}
