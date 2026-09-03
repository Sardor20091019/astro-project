/* eslint-disable @next/next/no-img-element */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import ProfileClientView from "@/components/ProfileClientView";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const session = await getServerSession(authOptions);

  const [user, rawPhotos, followersData, followingData, viewerFollows, directRel] = await Promise.all([
    db
      .selectFrom("User")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst(),
    db
      .selectFrom("Photo")
      .select(["id", "url", "title", "location"])
      .where("userId", "=", userId)
      .where("status", "=", "APPROVED")
      .orderBy("createdAt", "desc")
      .execute(),
    db
      .selectFrom("Follows")
      .innerJoin("User", "User.id", "Follows.followerId")
      .select(["User.id", "User.name", "User.image"])
      .where("Follows.followingId", "=", userId)
      .execute(),
    db
      .selectFrom("Follows")
      .innerJoin("User", "User.id", "Follows.followingId")
      .select(["User.id", "User.name", "User.image"])
      .where("Follows.followerId", "=", userId)
      .execute(),
    session?.user?.id
      ? db
          .selectFrom("Follows")
          .select("followingId")
          .where("followerId", "=", session.user.id)
          .execute()
      : Promise.resolve([]),
    session?.user?.id && session.user.id !== userId
      ? db
          .selectFrom("Follows")
          .select("followerId")
          .where("followerId", "=", session.user.id)
          .where("followingId", "=", userId)
          .executeTakeFirst()
      : Promise.resolve(undefined),
  ]);

  if (!user) notFound();

  const photos = rawPhotos.map((p) => ({
    ...p,
    id: String(p.id),
  }));

  const viewerFollowingIds = new Set(viewerFollows.map((f) => f.followingId));

  const followers = followersData.map((f) => ({
    id: f.id,
    name: f.name,
    image: f.image,
    isFollowing: viewerFollowingIds.has(f.id),
  }));

  const following = followingData.map((f) => ({
    id: f.id,
    name: f.name,
    image: f.image,
    isFollowing: viewerFollowingIds.has(f.id),
  }));

  const isFollowing = Boolean(directRel);

  const isSelf = session?.user?.id === userId;
  const viewerIsAdmin = isAdmin(session?.user?.email);
  const canDelete = isSelf || viewerIsAdmin;

  return (
   <ProfileClientView
  user={user}
  photos={photos}
  followers={followers}
  following={following}
  currentUserId={session?.user?.id}
  isSelf={isSelf}
  viewerIsAdmin={viewerIsAdmin}
  userId={userId}
  isFollowing={isFollowing}
  canDelete={canDelete}
    />
  );
}