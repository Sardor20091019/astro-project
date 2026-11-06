"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(_userId: string, data: { name: string; image: string }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const cleanName = String(data.name ?? "").trim().slice(0, 100);
  const cleanImage = String(data.image ?? "").trim();

  // Validate image URL format if provided
  if (cleanImage && !cleanImage.startsWith("https://") && !cleanImage.startsWith("/")) {
    throw new Error("Invalid image URL provided");
  }

  try {
    await db
      .updateTable("User")
      .set({
        name: cleanName || null,
        image: cleanImage || null,
      })
      .where("id", "=", session.user.id) // Bind strictly to authenticated caller ID
      .execute();

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Database Update Error:", error);
    throw new Error("Failed to update profile in database.");
  }
}
