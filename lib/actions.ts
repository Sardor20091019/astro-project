"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanitizePlainText } from "@/lib/sanitize";

export async function updateUserProfile(userId: string, data: { name: string; image: string }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const isOwner = session.user.id === userId;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    throw new Error("Forbidden: You cannot modify another user's profile.");
  }

  const cleanName = sanitizePlainText(data.name, 80);
  const cleanImage = String(data.image ?? "").trim();

  if (cleanImage) {
    const isAllowedImage =
      cleanImage.startsWith("/") ||
      /^https:\/\/([a-zA-Z0-9-]+\.)*(ufs\.sh|utfs\.io|uploadthing\.com|googleusercontent\.com|telegram\.org)\//i.test(
        cleanImage,
      );
    if (!isAllowedImage) {
      throw new Error("Invalid image URL: Must originate from an approved storage provider");
    }
  }

  const targetUserId = isOwner ? session.user.id : userId;

  try {
    await db
      .updateTable("User")
      .set({
        name: cleanName || null,
        image: cleanImage || null,
      })
      .where("id", "=", targetUserId)
      .execute();

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Database Update Error:", error);
    throw new Error("Failed to update profile in database.");
  }
}
