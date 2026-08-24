"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Users, UserPlus, UserCheck } from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  image: string | null;
  isFollowing?: boolean;
}

interface ProfileConnectionsModalProps {
  photosCount: number;
  followers: UserItem[];
  following: UserItem[];
  followerCount: number;
  followingCount: number;
  currentUserId?: string;
}

export default function ProfileConnectionsModal({
  photosCount,
  followers: initialFollowers,
  following: initialFollowing,
  followerCount,
  followingCount,
  currentUserId,
}: ProfileConnectionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
  
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  return (
    <>
      {/* Sleek Stats Pill - High Contrast in Light & Dark Mode */}
      <div className="flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] p-2 rounded-2xl w-full shadow-inner divide-x divide-[var(--border)]">
        
        {/* Images Stat */}
        <div className="flex flex-col items-center flex-1 py-1">
          <p className="text-lg sm:text-xl font-black text-[var(--text)]">{photosCount}</p>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold mt-0.5">Images</p>
        </div>

        {/* Followers Button */}
        <button
          onClick={() => {
            setActiveTab("followers");
            setIsOpen(true);
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

        {/* Following Button */}
        <button
          onClick={() => {
            setActiveTab("following");
            setIsOpen(true);
          }}
          className="flex flex-col items-center flex-1 py-1 group cursor-pointer transition-colors hover:bg-[var(--surface)] rounded-xl"
        >
          <p className="text-lg sm:text-xl font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
            {followingCount}
          </p>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold mt-0.5 group-hover:text-[var(--text)] transition-colors">
            Following
          </p>
        </button>

      </div>

      {/* Modern Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            style={{ borderRadius: "1.5rem" }}
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
          >
            {/* Modal Header / Tabs */}
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
                  Following ({followingCount})
                  {activeTab === "following" && (
                    <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[var(--accent)]" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / User List */}
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
                currentList.map((user) => {
                  const isSelf = currentUserId === user.id;

                  return (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      onClick={() => setIsOpen(false)}
                      style={{ borderRadius: "0.875rem" }}
                      className="flex items-center justify-between gap-3 p-3 bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.image || "/default-avatar.png"}
                          alt={user.name ?? "User"}
                          className="w-10 h-10 rounded-full object-cover border border-[var(--border)] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                            {user.name || "NOT_AVAILABLE Creator"}
                          </p>
                        </div>
                      </div>

                      {/* Direct Follow / Follow Back Action Button */}
                      {currentUserId && !isSelf && (
                        <button
                          onClick={(e) => handleToggleFollow(user.id, e)}
                          disabled={loadingId === user.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                            user.isFollowing
                              ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:border-red-500/50 hover:text-red-500"
                              : "bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--bg)]"
                          }`}
                        >
                          {user.isFollowing ? (
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
    </>
  );
}