/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: number) {
  try {
    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath("/admin"); 
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}