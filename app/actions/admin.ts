/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: number) {
  try {
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