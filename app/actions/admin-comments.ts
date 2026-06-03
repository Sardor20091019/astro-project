"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: number) {
  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/admin"); // Or the path where comments are listed
}