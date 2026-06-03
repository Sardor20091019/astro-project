"use server";

import { prisma } from "@/lib/prisma";

export async function searchUsers(query: string) {
  if (!query) return [];

  return await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { telegramUsername: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, image: true, telegramUsername: true },
    take: 5, // Limit results for better performance
  });
}