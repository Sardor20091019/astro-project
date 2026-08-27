"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(userId: string, data: { name: string; image: string }) {
  try {
    await db
      .updateTable("User")
      .set({ 
        name: data.name, 
        image: data.image 
      })
      .where("id", "=", userId)
      .execute();

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Database Update Error:", error);
    throw new Error("Failed to update profile in database.");
  }
}