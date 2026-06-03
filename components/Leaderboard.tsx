import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Leaderboard() {
  const topUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { followers: { _count: "desc" } },
    select: { 
      id: true, name: true, image: true, 
      _count: { select: { followers: true } } 
    }
  });

  return (
    <div className="bg-zinc-900/30 border border-white/6 rounded-2xl p-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Top Creators</h3>
      <div className="flex flex-col gap-4">
        {topUsers.map((user, i) => (
          <div key={user.id} className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-600 w-4">{i + 1}</span>
            <img src={user.image || "/default-avatar.png"} className="w-8 h-8 rounded-full object-cover" alt="" />
            <div>
              <p className="text-xs font-bold text-zinc-300">{user.name}</p>
              <p className="text-[9px] text-zinc-500">{user._count.followers} followers</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}