"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      console.error("Unauthorized attempt to delete user:", { userId });
      return { success: false };
    }

    if (session.user.id === userId) {
      console.error("Admin attempted to delete self:", { userId });
      return { success: false };
    }

    await db
      .deleteFrom("User")
      .where("id", "=", userId)
      .execute();

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false };
  }
}