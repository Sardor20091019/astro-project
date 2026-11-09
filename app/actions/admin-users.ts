"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id && !session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  if (!userId || typeof userId !== "string") {
    return { success: false, error: "Invalid target user ID" };
  }

  const sessionUserId = session.user.id;
  const sessionEmail = session.user.email;

  // Authorize caller against database
  const caller = await db
    .selectFrom("User")
    .select(["id", "role"])
    .where((eb) => {
      const ors = [];
      if (sessionUserId) ors.push(eb("id", "=", sessionUserId));
      if (sessionEmail) ors.push(eb("email", "=", sessionEmail));
      return ors.length > 0 ? eb.or(ors) : eb.lit(false);
    })
    .executeTakeFirst();

  if (!caller || caller.role !== "ADMIN") {
    return { success: false, error: "Forbidden: Root clearance required" };
  }

  // Prevent self-deletion
  if (caller.id === userId || session.user.id === userId) {
    return { success: false, error: "Cannot delete active administrator session" };
  }

  try {
    await db
      .deleteFrom("User")
      .where("id", "=", userId)
      .execute();

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Database execution failed" };
  }
}
