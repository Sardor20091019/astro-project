
import { prisma } from "@/lib/prisma";
import Image from "next/image";

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
      take: 50, 
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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white">
            Creator Leaderboard
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Top profiles ranked by total community followers.
          </p>
        </div>

        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex flex-col gap-4">
            {topUsers.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No creators found.</p>
            ) : (
              topUsers.map((user, i) => (
                <div key={user.id} className="flex items-center justify-between py-1">
                  
                  {/* Left Side: Rank, Avatar, Name */}
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-mono w-4 ${
                      i === 0 ? 'text-amber-400 font-bold' : i === 1 ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      {i + 1}
                    </span>
                    
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/5 bg-zinc-800">
                      <Image 
                        src={user.image || "/default-avatar.png"} 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover" 
                        alt={user.name || "User avatar"} 
                      />
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-zinc-300">
                        {user.name || "Anonymous Creator"}
                      </p>
                      <p className="text-[9px] text-zinc-500 sm:hidden">
                        {user._count.followers} followers
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Follower Counter (Hidden on tiny viewports to save space) */}
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-mono font-bold text-zinc-400">
                      {user._count.followers.toLocaleString()}
                    </p>
                    <p className="text-[8px] uppercase tracking-wider text-zinc-600 font-bold">
                      Followers
                    </p>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}