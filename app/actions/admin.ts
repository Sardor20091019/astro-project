"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const parsedId = Number(commentId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return { success: false, error: "Invalid comment ID" };
  }

  const caller = await db
    .selectFrom("User")
    .select("role")
    .where("email", "=", session.user.email)
    .executeTakeFirst();

  if (!caller || caller.role !== "ADMIN") {
    return { success: false, error: "Forbidden: Admin clearance required" };
  }

  try {
    await db
      .deleteFrom("Comment")
      .where("id", "=", parsedId)
      .execute();

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { success: false, error: "Database execution failed" };
  }
}
