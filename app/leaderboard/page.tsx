import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react";

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

  const [first, second, third, ...rest] = topUsers;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-16 sm:py-24 flex justify-center">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12">
        
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col gap-2 text-center items-center w-full max-w-xl">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-(--accent)">
              Community Elite
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">
            Creator Podium
          </h1>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 font-mono">
            Top creators ranked by community followers
          </p>
        </div>

        {topUsers.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-xs uppercase tracking-widest text-zinc-500 font-mono w-full max-w-xl">
            No creators found.
          </div>
        ) : (
          <div className="flex flex-col gap-10 w-full max-w-xl">
            
            {/* Podium Section (1st, 2nd, 3rd) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-8">
              
              {/* 2nd Place (Full Silver Theme) */}
              {second && (
                <Link
                  href={`/profile/${second.id}`}
                  className="group relative flex flex-col items-center p-6 rounded-3xl border-2 border-slate-300 bg-gradient-to-b from-slate-300/30 via-slate-900/90 to-black hover:border-slate-200 transition-all duration-300 shadow-[0_0_30px_rgba(203,213,225,0.2)] order-2 sm:order-1 text-center"
                >
                  <div className="absolute -top-4 w-8 h-8 rounded-full bg-slate-300 text-black flex items-center justify-center font-mono font-black text-xs shadow-lg">
                    2
                  </div>
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-300 bg-slate-900 mb-3 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Image 
                      src={second.image || "/default-avatar.png"} 
                      width={64}
                      height={64}
                      className="w-full h-full object-cover" 
                      alt={second.name || "User avatar"} 
                    />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white truncate w-full">
                    {second.name || "Anonymous"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-300 font-bold mt-1">
                    {second._count.followers.toLocaleString()} <span className="text-[8px] text-slate-400 uppercase">followers</span>
                  </p>
                  <div className="mt-4 w-full bg-slate-300 text-black py-2 rounded-xl text-[9px] font-mono uppercase tracking-[0.2em] font-extrabold shadow-sm">
                    Silver Medal
                  </div>
                </Link>
              )}

              {/* 1st Place (Full Gold Theme) */}
              {first && (
                <Link
                  href={`/profile/${first.id}`}
                  className="group relative flex flex-col items-center p-8 rounded-3xl border-2 border-yellow-400 bg-gradient-to-b from-yellow-500/40 via-zinc-900/95 to-black hover:border-yellow-300 transition-all duration-300 shadow-[0_0_60px_rgba(234,179,8,0.3)] order-1 sm:order-2 sm:-translate-y-6 text-center"
                >
                  <div className="absolute -top-5 w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-mono font-black text-sm shadow-xl">
                    <Crown size={18} className="fill-black" />
                  </div>
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 bg-zinc-900 mb-3 shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <Image 
                      src={first.image || "/default-avatar.png"} 
                      width={80}
                      height={80}
                      className="w-full h-full object-cover" 
                      alt={first.name || "User avatar"} 
                    />
                  </div>
                  <p className="text-sm font-black uppercase tracking-wider text-yellow-200 group-hover:text-white truncate w-full">
                    {first.name || "Anonymous"}
                  </p>
                  <p className="text-xs font-mono font-black text-yellow-400 mt-1">
                    {first._count.followers.toLocaleString()} <span className="text-[9px] text-yellow-500/80 uppercase">followers</span>
                  </p>
                  <div className="mt-4 w-full bg-yellow-400 text-black py-2.5 rounded-xl text-[9px] font-mono uppercase tracking-[0.2em] font-black shadow-md">
                    Gold Champion
                  </div>
                </Link>
              )}

              {/* 3rd Place (Full Bronze Theme) */}
              {third && (
                <Link
                  href={`/profile/${third.id}`}
                  className="group relative flex flex-col items-center p-6 rounded-3xl border-2 border-amber-600 bg-gradient-to-b from-amber-700/30 via-zinc-900/90 to-black hover:border-amber-500 transition-all duration-300 shadow-[0_0_30px_rgba(217,119,6,0.2)] order-3 text-center"
                >
                  <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-mono font-black text-xs shadow-lg">
                    3
                  </div>
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-600 bg-zinc-900 mb-3 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <Image 
                      src={third.image || "/default-avatar.png"} 
                      width={64}
                      height={64}
                      className="w-full h-full object-cover" 
                      alt={third.name || "User avatar"} 
                    />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-100 group-hover:text-white truncate w-full">
                    {third.name || "Anonymous"}
                  </p>
                  <p className="text-[10px] font-mono text-amber-300 font-bold mt-1">
                    {third._count.followers.toLocaleString()} <span className="text-[8px] text-amber-400 uppercase">followers</span>
                  </p>
                  <div className="mt-4 w-full bg-amber-600 text-white py-2 rounded-xl text-[9px] font-mono uppercase tracking-[0.2em] font-extrabold shadow-sm">
                    Bronze Medal
                  </div>
                </Link>
              )}

            </div>

            {/* Rest of the List (4th to 10th) */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-2 pt-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 pb-2">
                  Remaining Rankings
                </div>
                <div className="flex flex-col gap-2">
                  {rest.map((user, index) => {
                    const rank = index + 4;

                    return (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="group flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-zinc-950 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="w-6 text-center font-mono text-xs font-bold text-zinc-600">
                            #{rank}
                          </span>
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                            <Image 
                              src={user.image || "/default-avatar.png"} 
                              width={40}
                              height={40}
                              className="w-full h-full object-cover" 
                              alt={user.name || "User avatar"} 
                            />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white truncate">
                            {user.name || "Anonymous Creator"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-xs font-bold text-zinc-400">
                            {user._count.followers.toLocaleString()}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-zinc-600">
                            Followers
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}