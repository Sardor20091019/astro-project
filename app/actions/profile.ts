"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

  const updateValues: { name?: string; image?: string } = {};
  if (name) updateValues.name = name;
  if (image) updateValues.image = image;

  // If no fields were provided, just return the existing user
  if (Object.keys(updateValues).length === 0) {
    const currentUser = await db
      .selectFrom("User")
      .selectAll()
      .where("id", "=", session.user.id)
      .executeTakeFirst();
    return currentUser;
  }

  // Update the user and return the updated record
  const updatedUser = await db
    .updateTable("User")
    .set(updateValues)
    .where("id", "=", session.user.id)
    .returningAll()
    .executeTakeFirst();

  return updatedUser;
}