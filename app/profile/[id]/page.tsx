/* eslint-disable @next/next/no-img-element */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfilePhotoStream from "@/components/ProfilePhotoStream";
import ProfileHeaderCard from "@/components/ProfileHeaderCard";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const session = await getServerSession(authOptions);

  const [user, photos, followersData, followingData] = await Promise.all([
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
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] pt-24 pb-20 selection:bg-[var(--accent)] selection:text-[var(--bg)] flex flex-col items-center">
      <div className="max-w-4xl w-full mx-auto px-6 flex flex-col items-center gap-12">

        {/* Profile Card Header */}
        <ProfileHeaderCard
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }}
          photosCount={photos.length}
          initialFollowers={followers}
          initialFollowing={following}
          currentUserId={session?.user?.id}
          isSelf={isSelf}
          viewerIsAdmin={viewerIsAdmin}
          userId={userId}
          isFollowingInitial={isFollowing}
        />

        {/* Images Stream Section */}
        <div className="w-full flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full border-b border-[var(--border)] pb-4 px-2">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--text-muted)] font-bold">
              Images
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest bg-[var(--surface)] border border-[var(--border)] px-3.5 py-1 rounded-full text-[var(--text-dim)] shadow-sm">
              {photos.length} {photos.length === 1 ? "image posted" : "images"}
            </span>
          </div>

          <div className="w-full pt-2">
            <ProfilePhotoStream photos={photos} canDelete={canDelete} />
          </div>
        </div>

      </div>
    </main>
  );
}