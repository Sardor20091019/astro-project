"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  try {
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