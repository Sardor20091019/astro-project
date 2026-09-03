/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, ShieldAlert, Users, UserPlus, UserCheck, X } from "lucide-react";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";

interface UserItem {
  id: string;
  name: string | null;
  image: string | null;
  isFollowing?: boolean;
}

interface ProfileHeaderCardProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  photosCount: number;
  initialFollowers: UserItem[];
  initialFollowing: UserItem[];
  currentUserId?: string;
  isSelf: boolean;
  viewerIsAdmin: boolean;
  userId: string;
  isFollowingInitial: boolean;
}

export default function ProfileHeaderCard({
  user,
  photosCount,
  initialFollowers,
  initialFollowing,
  currentUserId,
  isSelf,
  viewerIsAdmin,
  userId,
  isFollowingInitial,
}: ProfileHeaderCardProps) {
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
  
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const [followerCount, setFollowerCount] = useState(initialFollowers.length);
  const [followLoading, setFollowLoading] = useState(false);

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isConnectionsOpen) {
        setIsConnectionsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConnectionsOpen]);

  const currentList = activeTab === "followers" ? followers : following;

  const handleToggleFollow = async (targetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || loadingId === targetId) return;

    setLoadingId(targetId);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId }),
      });

      if (res.ok) {
        const updateListState = (list: UserItem[]) =>
          list.map((u) => (u.id === targetId ? { ...u, isFollowing: !u.isFollowing } : u));

        setFollowers((prev) => updateListState(prev));
        setFollowing((prev) => updateListState(prev));
      }
    } catch (err) {
      console.error("Failed to toggle follow status", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMainFollowToggle = async () => {
    if (!currentUserId || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      if (res.ok) {
        setIsFollowing((prev) => !prev);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (err) {
      console.error("Failed to follow user", err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <>
      {/* Profile Card Header */}
      <div className="w-full bg-[var(--surface)] border border-[var(--border)] p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center gap-8 relative overflow-hidden">
        
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[var(--accent)]/5 blur-3xl pointer-events-none rounded-full" />

        {/* Admin Badge */}
        {viewerIsAdmin && !isSelf && (
          <div className="absolute top-6 right-6">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1 rounded-full shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin View
            </span>
          </div>
        )}

        {/* Avatar with Ring */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-[var(--accent)] to-transparent opacity-30 blur group-hover:opacity-60 transition-opacity" />
          <div className="relative">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name ?? ""} 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[var(--border)] object-cover shadow-xl bg-[var(--surface-2)]" 
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[var(--surface-2)] border-2 border-[var(--border)] flex items-center justify-center text-4xl font-black text-[var(--text-muted)] shadow-xl">
                {(user.name ?? "?")[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="flex flex-col items-center gap-2 max-w-lg z-10">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[var(--text)]">
            {user.name ?? "NOT_AVAILABLE Artist"}
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
            {user.email}
          </p>
        </div>

        {/* Interactive Stats Box */}
        <div className="w-full max-w-md z-10">
          <div className="flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] p-2 rounded-2xl w-full shadow-inner divide-x divide-[var(--border)]">
            <div className="flex flex-col items-center flex-1 py-1">
              <p className="text-lg sm:text-xl font-black text-[var(--text)]">{photosCount}</p>
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold mt-0.5">Images</p>
            </div>

            <button
              onClick={() => {
                setActiveTab("followers");
                setIsConnectionsOpen(true);
              }}
              className="flex flex-col items-center flex-1 py-1 group cursor-pointer transition-colors hover:bg-[var(--surface)] rounded-xl"
            >
              <p className="text-lg sm:text-xl font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                {followerCount}
              </p>
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold mt-0.5 group-hover:text-[var(--text)] transition-colors">
                Followers
              </p>
            </button>

            <button
              onClick={() => {
                setActiveTab("following");
                setIsConnectionsOpen(true);
              }}
              className="flex flex-col items-center flex-1 py-1 group cursor-pointer transition-colors hover:bg-[var(--surface)] rounded-xl"
            >
              <p className="text-lg sm:text-xl font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                {following.length}
              </p>
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold mt-0.5 group-hover:text-[var(--text)] transition-colors">
                Following
              </p>
            </button>
          </div>
        </div>

        {/* Action Button (Automatically disappears when viewing followers or following modal) */}
        {!isConnectionsOpen && (
          <div className="pt-1 z-10">
            {isSelf ? (
              <button 
                onClick={() => setIsUploadOpen(true)} 
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[var(--text)] text-[var(--bg)] text-xs font-mono font-bold uppercase tracking-widest hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.02]"
              >
                <Camera size={15} /> Post New Image
              </button>
            ) : currentUserId ? (
              <button
                onClick={handleMainFollowToggle}
                disabled={followLoading}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl cursor-pointer ${
                  isFollowing
                    ? "bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] hover:border-red-500/50 hover:text-red-500"
                    : "bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--bg)]"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Follow
                  </>
                )}
              </button>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center px-7 py-3.5 rounded-2xl border border-[var(--border)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-all duration-300 bg-[var(--surface-2)] shadow-sm"
              >
                Sign in to follow
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Followers / Following Modal (Root Level) */}
      {isConnectionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            style={{ borderRadius: "1.5rem" }}
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]/50">
              <div className="flex items-center gap-6 font-mono text-xs font-bold uppercase tracking-widest">
                <button
                  onClick={() => setActiveTab("followers")}
                  className={`pb-1 transition-colors cursor-pointer relative ${
                    activeTab === "followers" 
                      ? "text-[var(--accent)]" 
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  Followers ({followerCount})
                  {activeTab === "followers" && (
                    <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[var(--accent)]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("following")}
                  className={`pb-1 transition-colors cursor-pointer relative ${
                    activeTab === "following" 
                      ? "text-[var(--accent)]" 
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  Following ({following.length})
                  {activeTab === "following" && (
                    <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[var(--accent)]" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setIsConnectionsOpen(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2.5">
              {currentList.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center gap-3 text-[var(--text-muted)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
                    <Users size={20} className="opacity-40" />
                  </div>
                  <p className="font-mono text-xs uppercase tracking-wider">
                    No {activeTab} found.
                  </p>
                </div>
              ) : (
                currentList.map((itemUser) => {
                  const isItemSelf = currentUserId === itemUser.id;

                  return (
                    <Link
                      key={itemUser.id}
                      href={`/profile/${itemUser.id}`}
                      onClick={() => setIsConnectionsOpen(false)}
                      style={{ borderRadius: "0.875rem" }}
                      className="flex items-center justify-between gap-3 p-3 bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={itemUser.image || "/default-avatar.png"}
                          alt={itemUser.name ?? "User"}
                          className="w-10 h-10 rounded-full object-cover border border-[var(--border)] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                            {itemUser.name || "NOT_AVAILABLE Creator"}
                          </p>
                        </div>
                      </div>

                      {currentUserId && !isItemSelf && (
                        <button
                          onClick={(e) => handleToggleFollow(itemUser.id, e)}
                          disabled={loadingId === itemUser.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                            itemUser.isFollowing
                              ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:border-red-500/50 hover:text-red-500"
                              : "bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--bg)]"
                          }`}
                        >
                          {itemUser.isFollowing ? (
                            <>
                              <UserCheck size={13} />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus size={13} />
                              Follow Back
                            </>
                          )}
                        </button>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Photo Modal (Root Level Overlay) */}
      <SubmitPhotoModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </>
  );
}