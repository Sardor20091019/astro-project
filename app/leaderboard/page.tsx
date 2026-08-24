/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Crown, Trophy, Award, Medal } from "lucide-react";

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
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] px-6 py-16 sm:py-24 flex justify-center selection:bg-[var(--accent)] selection:text-[var(--bg)]">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12">
        
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-8 flex flex-col gap-3 text-center items-center w-full max-w-xl">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[var(--accent)]">
              Community Elite
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Creator Rankings
          </h1>
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] font-mono">
            Recognizing the most followed creators across the network
          </p>
        </div>

        {topUsers.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] rounded-2xl p-16 text-center text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono w-full max-w-xl bg-[var(--surface)]">
            No creators found.
          </div>
        ) : (
          <div className="flex flex-col gap-12 w-full max-w-xl">
            
            {/* Podium Section (2nd, 1st, 3rd) */}
            {topUsers.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
                
                {/* 2nd Place */}
                {second && (
                  <Link
                    href={`/profile/${second.id}`}
                    style={{ borderRadius: "var(--radius-md)" }}
                    className="group relative flex flex-col items-center p-6 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] transition-all duration-300 order-2 sm:order-1 text-center shadow-lg hover:-translate-y-1"
                  >
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-dim)] flex items-center justify-center font-mono text-[10px] font-bold">
                      02
                    </div>
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] mb-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Image 
                        src={second.image || "/default-avatar.png"} 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover" 
                        alt={second.name || "User avatar"} 
                      />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)] truncate w-full mb-1">
                      {second.name || "Anonymous"}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                      <span className="text-[var(--text)] font-bold">{second._count.followers.toLocaleString()}</span> followers
                    </p>
                  </Link>
                )}

                {/* 1st Place */}
                {first && (
                  <Link
                    href={`/profile/${first.id}`}
                    style={{ borderRadius: "var(--radius-md)" }}
                    className="group relative flex flex-col items-center p-8 bg-[var(--surface)] border-2 border-[var(--accent)] hover:shadow-2xl transition-all duration-300 order-1 sm:order-2 sm:-translate-y-4 text-center shadow-xl hover:-translate-y-5"
                  >
                    <div className="absolute top-4 right-4 text-[var(--accent)]">
                      <Crown size={20} />
                    </div>
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-mono text-[10px] font-black">
                      01
                    </div>
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--accent)] bg-[var(--surface-2)] mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Image 
                        src={first.image || "/default-avatar.png"} 
                        width={80}
                        height={80}
                        className="w-full h-full object-cover" 
                        alt={first.name || "User avatar"} 
                      />
                    </div>
                    <p className="text-sm font-black uppercase tracking-wider text-[var(--text)] truncate w-full mb-1">
                      {first.name || "Anonymous"}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                      <span className="text-[var(--accent)] font-bold">{first._count.followers.toLocaleString()}</span> followers
                    </p>
                  </Link>
                )}

                {/* 3rd Place */}
                {third && (
                  <Link
                    href={`/profile/${third.id}`}
                    style={{ borderRadius: "var(--radius-md)" }}
                    className="group relative flex flex-col items-center p-6 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--text-muted)] transition-all duration-300 order-3 text-center shadow-lg hover:-translate-y-1"
                  >
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-dim)] flex items-center justify-center font-mono text-[10px] font-bold">
                      03
                    </div>
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] mb-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Image 
                        src={third.image || "/default-avatar.png"} 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover" 
                        alt={third.name || "User avatar"} 
                      />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)] truncate w-full mb-1">
                      {third.name || "Anonymous"}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                      <span className="text-[var(--text)] font-bold">{third._count.followers.toLocaleString()}</span> followers
                    </p>
                  </Link>
                )}

              </div>
            )}

            {/* Rest of the List (4th to 10th or full list if < 3) */}
            {(rest.length > 0 || topUsers.length < 3) && (
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">
                  {topUsers.length < 3 ? "Rankings" : "Following Ranks"}
                </div>
                <div className="flex flex-col gap-2">
                  {(topUsers.length < 3 ? topUsers : rest).map((user, index) => {
                    const rank = topUsers.length < 3 ? index + 1 : index + 4;

                    return (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        style={{ borderRadius: "var(--radius-sm)" }}
                        className="group flex items-center justify-between p-4 border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="w-6 text-center font-mono text-xs font-bold text-[var(--text-muted)]">
                            {rank < 10 ? `0${rank}` : rank}
                          </span>
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] shrink-0">
                            <Image 
                              src={user.image || "/default-avatar.png"} 
                              width={40}
                              height={40}
                              className="w-full h-full object-cover" 
                              alt={user.name || "User avatar"} 
                            />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)] truncate">
                            {user.name || "DELETED USER"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-xs font-bold text-[var(--text)]">
                            {user._count.followers.toLocaleString()}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
                            followers
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