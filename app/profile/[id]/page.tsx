import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";
import ProfilePhotoGrid from "@/components/ProfilePhotoGrid";
import { isAdmin } from "@/lib/admin";
import { Camera } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const session = await getServerSession(authOptions);

  const [user, photos, followerCount, followingCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.photo.findMany({
      where: { userId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, url: true, title: true, location: true },
    }),
    // Swapped .follow for .follows to match your updated schema models
    prisma.follows.count({ where: { followingId: userId } }),
    prisma.follows.count({ where: { followerId: userId } }),
  ]);

  if (!user) notFound();

  let isFollowing = false;
  if (session?.user?.id && session.user.id !== userId) {
    // Updated to match Prisma's composite ID layout map structure
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
    <div className="min-h-screen bg-[#080808] text-white pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12 pb-10 border-b border-white/8">
          {user.image ? (
            <img src={user.image} alt={user.name ?? ""} className="w-20 h-20 rounded-full border-2 border-white/10 object-cover ring-4 ring-white/5" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center text-2xl font-black text-white/30">
              {(user.name ?? "?")[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-3xl font-black uppercase tracking-tight">{user.name ?? "Anonymous"}</h1>
              {viewerIsAdmin && !isSelf && (
                <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                  Admin View
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs">{user.email}</p>
            <div className="flex items-center gap-6 mt-5">
              {[
                { label: "Frames", value: photos.length },
                { label: "Followers", value: followerCount },
                { label: "Following", value: followingCount },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-6">
                  <div>
                    <p className="text-xl font-black">{stat.value}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8 bg-white/8" />}
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          {isSelf ? (
            <Link href="/submit" className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg flex items-center gap-2">
              <Camera size={13} /> Add Frame
            </Link>
          ) : session?.user ? (
            <FollowButton targetUserId={userId} initialFollowing={isFollowing} initialFollowerCount={followerCount} />
          ) : (
            <Link href="/login" className="px-6 py-2.5 rounded-full border border-white/15 text-xs font-black uppercase tracking-widest text-white/60 hover:border-red-500/50 hover:text-white transition-all">
              Sign in to follow
            </Link>
          )}
        </div>

        {/* Photos */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">
            {photos.length === 0 ? "No frames yet" : `${photos.length} frame${photos.length !== 1 ? "s" : ""}`}
          </p>
          <ProfilePhotoGrid photos={photos} canDelete={canDelete} />
        </div>
      </div>
    </div>
  );
}