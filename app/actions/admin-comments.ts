"use server";

import { db } from "@/lib/db"; 
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: number) {
  await db
    .deleteFrom("Comment")
    .where("id", "=", commentId)
    .execute();

  revalidatePath("/admin");
}