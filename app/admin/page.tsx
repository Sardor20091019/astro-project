import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPhotoList from "@/components/AdminPhotoList";
import { db } from "@/lib/db";
import { Users, Image as ImageIcon, MessageSquare } from "lucide-react";
import AdminDashboardModals from "@/components/AdminDashboardModals";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect("/");
  }

  const dbUser = await db
    .selectFrom("User")
    .select(["role", "id", "name"])
    .where("email", "=", session.user.email)
    .executeTakeFirst();

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/");
  }

  const [photos, users, commentsRaw] = await Promise.all([
    db.selectFrom("Photo").selectAll().orderBy("createdAt", "desc").execute(),
    db.selectFrom("User").selectAll().orderBy("name", "asc").execute(),
    db.selectFrom("Comment").selectAll().orderBy("createdAt", "desc").execute(),
  ]);

  // Batch fetch users for comments to match Prisma's include: { user: true }
  const userIds = [...new Set(commentsRaw.map((c) => c.userId))];
  const commentUsers = userIds.length > 0
    ? await db.selectFrom("User").selectAll().where("id", "in", userIds).execute()
    : [];
  const userMap = new Map(commentUsers.map((u) => [u.id, u]));

  const comments = commentsRaw.map((c) => ({
    ...c,
    user: userMap.get(c.userId) || null,
  }));

  return (
    <main className="min-h-screen bg-(--bg) text-(--text) selection:bg-(--accent)/30 pt-28 pb-32 relative overflow-hidden flex flex-col items-center">
      
      {/* Cinematic Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-(--accent)/10 via-(--accent)/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-32 right-[-10%] w-[600px] h-[600px] bg-(--accent)/5 blur-[160px] pointer-events-none rounded-full" />

      {/* Center Container Wrapper */}
      <div className="w-full max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Editorial Header Section */}
        <header className="w-full mb-16 flex flex-col items-center text-center">
          
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-(--surface-2) border border-(--border) backdrop-blur-xl shadow-lg mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--accent) opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-(--accent)"></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-(--text)">
              Root Clearance // {dbUser.name || "Admin"}
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-4 text-(--text)">
            Control Center
          </h1>
          <p className="text-(--text-dim) text-xs sm:text-sm max-w-md font-medium tracking-wide">
            Manage archival assets, curate community dialogue, and oversee database integrity across AstroSpectrum.
          </p>

          {/* Metric Ticker Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 py-3 px-6 rounded-2xl bg-(--surface) border border-(--border) backdrop-blur-2xl shadow-md">
            <div className="flex items-center gap-2 text-xs">
              <ImageIcon size={14} className="text-(--accent)" />
              <span className="text-(--text) font-mono">{photos.length}</span>
              <span className="text-(--text-muted) uppercase tracking-widest text-[10px] font-bold">Photos</span>
            </div>
            <div className="w-px h-3 bg-(--border)" />
            <div className="flex items-center gap-2 text-xs">
              <Users size={14} className="text-(--accent)" />
              <span className="text-(--text) font-mono">{users.length}</span>
              <span className="text-(--text-muted) uppercase tracking-widest text-[10px] font-bold">Users</span>
            </div>
            <div className="w-px h-3 bg-(--border)" />
            <div className="flex items-center gap-2 text-xs">
              <MessageSquare size={14} className="text-(--accent)" />
              <span className="text-(--text) font-mono">{comments.length}</span>
              <span className="text-(--text-muted) uppercase tracking-widest text-[10px] font-bold">Comments</span>
            </div>
          </div>
        </header>

        {/* Primary Bento Box: Manage Photos */}
        <section className="w-full mb-12">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-(--accent)/10 border border-(--accent)/30 text-(--accent)">
                <ImageIcon size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-(--text)">Visual Archives</h2>
                <p className="text-[11px] text-(--text-dim)">Upload, sequence, and moderate active gallery exhibits</p>
              </div>
            </div>
            <span className="text-xs font-mono text-(--text-dim) bg-(--surface-2) px-3 py-1 rounded-full border border-(--border)">
              {photos.length} Items Live
            </span>
          </div>

          <div className="w-full bg-(--surface) border border-(--border) rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-3xl shadow-xl relative group">
            <AdminPhotoList initialPhotos={photos} />
          </div>
        </section>

        {/* Client Component for Interactive Paginated Modals (Users & Comments) */}
        <AdminDashboardModals 
          users={users} 
          comments={comments} 
          currentUserId={dbUser.id} 
        />

      </div>
    </main>
  );
}