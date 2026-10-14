/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function deleteComment(commentId: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      console.error("Unauthorized attempt to delete comment:", { commentId });
      return { success: false };
    }

    await db
      .deleteFrom("Comment")
      .where("id", "=", commentId)
      .execute();

    revalidatePath("/admin"); 
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}