/* eslint-disable @next/next/no-img-element */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import ProfileClientView from "@/components/ProfileClientView";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const session = await getServerSession(authOptions);

  const [user, rawPhotos, followersData, followingData] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.photo.findMany({
      where: { userId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, url: true, title: true, location: true },
    }),
    prisma.follows.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, image: true } } },
    }),
    prisma.follows.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, name: true, image: true } } },
    }),
  ]);

  if (!user) notFound();

  // Convert photo IDs from number to string to match ProfilePhotoStream expectations
  const photos = rawPhotos.map((p) => ({
    ...p,
    id: String(p.id),
  }));

  let viewerFollowingIds = new Set<string>();
  if (session?.user?.id) {
    const viewerFollows = await prisma.follows.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    viewerFollowingIds = new Set(viewerFollows.map((f) => f.followingId));
  }

  const followers = followersData.map((f) => ({
    ...f.follower,
    isFollowing: viewerFollowingIds.has(f.follower.id),
  }));

  const following = followingData.map((f) => ({
    ...f.following,
    isFollowing: viewerFollowingIds.has(f.following.id),
  }));

  let isFollowing = false;
  if (session?.user?.id && session.user.id !== userId) {
    const rel = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });
    isFollowing = Boolean(rel);
  }

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