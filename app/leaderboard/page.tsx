/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
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
    const rawUsers = await db
      .selectFrom("User")
      .leftJoin("Follows", "Follows.followingId", "User.id")
      .select([
        "User.id",
        "User.name",
        "User.image",
        (eb) => eb.fn.count("Follows.followerId").as("followerCount"),
      ])
      .groupBy(["User.id", "User.name", "User.image"])
      .orderBy("followerCount", "desc")
      .limit(10)
      .execute();

    topUsers = rawUsers.map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
      _count: {
        followers: Number(u.followerCount ?? 0),
      },
    }));
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    topUsers = [];
  }

  return <LeaderboardClientView topUsers={topUsers} />;
}