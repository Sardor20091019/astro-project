// lib/auth.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    if (!userId) return null;

    return await prisma.user.findUnique({
      where: { id: userId },
    });
  } catch (error) {
    console.error("Auth helper error:", error);
    return null;
  }
}