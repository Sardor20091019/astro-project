"use client";
import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface Props {
  targetUserId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
}

export default function FollowButton({ targetUserId, initialFollowing, initialFollowerCount }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        setFollowerCount(data.followerCount);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-200 disabled:opacity-50 ${
          following
            ? "bg-white/8 border-white/15 text-white/70 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
            : "bg-white text-black border-white hover:bg-red-500 hover:border-red-500 hover:text-white shadow-lg"
        }`}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : following ? <UserCheck size={12} /> : <UserPlus size={12} />}
        {following ? "Following" : "Follow"}
      </button>
      <span className="text-[10px] text-zinc-500 font-bold">{followerCount} followers</span>
    </div>
  );
}
