"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(userId: string, data: { name: string; image: string }) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        name: data.name, 
        image: data.image 
      },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Database Update Error:", error);
    throw new Error("Failed to update profile in database.");
  }
}