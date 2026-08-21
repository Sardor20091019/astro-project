import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPhotoList from "@/components/AdminPhotoList";
import DeleteUserButton from "@/components/DeleteUserButton";
import { AdminCommentDelete } from "@/components/AdminCommentDelete"; 
import { prisma } from "@/lib/prisma";
import { Shield, Users, Image as ImageIcon, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, id: true, name: true }
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/");
  }

  const [photos, users, comments] = await Promise.all([
    prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.comment.findMany({ 
      include: { user: true }, 
      orderBy: { createdAt: "desc" } 
    })
  ]);

  return (
    <main className="min-h-screen bg-[#030303] text-zinc-100 selection:bg-red-500/30 pt-28 pb-32 relative overflow-hidden flex flex-col items-center">
      
      {/* Cinematic Background Gradients & Noise */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-red-600/[0.07] via-rose-600/[0.02] to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-32 right-[-10%] w-[600px] h-[600px] bg-red-950/[0.1] blur-[160px] pointer-events-none rounded-full" />

      {/* Center Container Wrapper */}
      <div className="w-full max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Editorial Header Section */}
        <header className="w-full mb-16 flex flex-col items-center text-center">
          
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-300">
              Root Clearance // {dbUser.name || "Admin"}
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Control Center
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-md font-medium tracking-wide">
            Manage archival assets, curate community dialogue, and oversee database integrity across AstroSpectrum.
          </p>

          {/* Metric Ticker Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 py-3 px-6 rounded-2xl bg-zinc-950/60 border border-white/[0.06] backdrop-blur-2xl">
            <div className="flex items-center gap-2 text-xs">
              <ImageIcon size={14} className="text-red-500" />
              <span className="text-zinc-400 font-mono">{photos.length}</span>
              <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-bold">Photos</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-2 text-xs">
              <Users size={14} className="text-red-500" />
              <span className="text-zinc-400 font-mono">{users.length}</span>
              <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-bold">Users</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-2 text-xs">
              <MessageSquare size={14} className="text-red-500" />
              <span className="text-zinc-400 font-mono">{comments.length}</span>
              <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-bold">Comments</span>
            </div>
          </div>
        </header>

        {/* Primary Bento Box: Manage Photos */}
        <section className="w-full mb-12">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                <ImageIcon size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">Visual Archives</h2>
                <p className="text-[11px] text-zinc-500">Upload, sequence, and moderate active gallery exhibits</p>
              </div>
            </div>
            <span className="text-xs font-mono text-zinc-600 bg-zinc-900/60 px-3 py-1 rounded-full border border-white/5">
              {photos.length} Items Live
            </span>
          </div>

          <div className="w-full bg-zinc-950/70 border border-white/[0.07] rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[2.5rem] pointer-events-none" />
            <AdminPhotoList initialPhotos={photos} />
          </div>
        </section>

        {/* Secondary Bento Grid: Users & Comments */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Users Management */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                  <Users size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white">User Directory</h2>
                  <p className="text-[11px] text-zinc-500">Registered platform accounts</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-600 bg-zinc-900/60 px-3 py-1 rounded-full border border-white/5">
                {users.length} Total
              </span>
            </div>

            <div className="w-full bg-zinc-950/70 border border-white/[0.07] rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex-1 flex flex-col relative">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users size={32} className="text-zinc-700 mb-3 stroke-[1.5]" />
                  <p className="text-xs text-zinc-500 font-medium">No registered users found in database.</p>
                </div>
              ) : (
                <div className="max-h-[460px] overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
                  {users.map((u) => (
                    <div 
                      key={u.id} 
                      className="group flex items-center justify-between py-4 px-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs text-zinc-300 shrink-0 uppercase">
                          {u.name ? u.name[0] : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-200 text-xs truncate group-hover:text-white transition-colors">
                            {u.name || "Unnamed User"}
                          </p>
                          <p className="text-zinc-500 text-[11px] font-mono truncate mt-0.5">{u.email}</p>
                        </div>
                      </div>
                      {u.id !== dbUser.id && (
                        <div className="shrink-0">
                          <DeleteUserButton userId={u.id} userName={u.name || "User"} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Comments Management */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white">Community Log</h2>
                  <p className="text-[11px] text-zinc-500">Live feed of visitor commentary</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-600 bg-zinc-900/60 px-3 py-1 rounded-full border border-white/5">
                {comments.length} Entries
              </span>
            </div>

            <div className="w-full bg-zinc-950/70 border border-white/[0.07] rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex-1 flex flex-col relative">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare size={32} className="text-zinc-700 mb-3 stroke-[1.5]" />
                  <p className="text-xs text-zinc-500 font-medium">No comments posted yet.</p>
                </div>
              ) : (
                <div className="max-h-[460px] overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
                  {comments.map((c) => (
                    <div 
                      key={c.id} 
                      className="group flex items-start justify-between py-4 px-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/[0.08] gap-4 transition-all duration-300"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="font-semibold text-zinc-200 text-xs truncate">
                            {c.user?.name || "Unknown User"}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                            {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs break-words leading-relaxed">
                          {c.body}
                        </p>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <AdminCommentDelete commentId={c.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}