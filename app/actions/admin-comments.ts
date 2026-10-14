"use server";

import { db } from "@/lib/db"; 
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function deleteComment(commentId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db
    .deleteFrom("Comment")
    .where("id", "=", commentId)
    .execute();

  revalidatePath("/admin");
}