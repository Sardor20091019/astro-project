"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Only allow updating own profile unless ADMIN
    const isOwner = session.user.id === userId;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden: You cannot modify another user's profile.");
    }

    const cleanName = String(data.name ?? "").trim().slice(0, 80);
    const cleanImage = String(data.image ?? "").trim();

    const targetUserId = isOwner ? session.user.id : userId;

    await db
      .updateTable("User")
<<<<<<< HEAD
      .set({
        name: cleanName || null,
        image: cleanImage || null,
      })
      .where("id", "=", session.user.id) // Bind strictly to authenticated caller ID
=======
      .set({ 
        name: cleanName || null, 
        image: cleanImage || null,
      })
      .where("id", "=", targetUserId)
>>>>>>> 65a6b4c (fix: update)
      .execute();

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Database Update Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update profile in database.");
  }
}
