/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import LeaderboardClientView from "@/components/LeaderboardClientView";

interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  _count: {
    followers: number;
  };
}

export default async function LeaderboardPage() {
  let topUsers: LeaderboardUser[];

  try {
    topUsers = await prisma.user.findMany({
      take: 10, 
      orderBy: { followers: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        image: true,
        _count: { select: { followers: true } },
      },
    });
  } catch {
    topUsers = [];
  }

  return <LeaderboardClientView topUsers={topUsers} />;
}