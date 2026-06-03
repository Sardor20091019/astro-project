/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminPhotoList from "@/components/AdminPhotoList";
import DeleteUserButton from "@/components/DeleteUserButton";
import { prisma } from "@/lib/prisma";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;

  if (!session || !user || !isAdmin(user.email)) {
    redirect("/");
  }

  const [photos, users] = await Promise.all([
    prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <header className="mb-10 flex items-end justify-between border-b border-white/8 pb-8">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.36em] text-red-500/70">
              <Shield size={10} /> AstroSpectrum
            </p>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Admin Panel</h1>
            <p className="text-zinc-600 mt-1.5 text-xs">{photos.length} photos · {users.length} users</p>
          </div>
        </header>

        {/* Photos Section */}
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Manage Photos</h2>
          <div className="bg-zinc-900/30 border border-white/6 rounded-2xl p-6">
            <AdminPhotoList initialPhotos={photos} />
          </div>
        </div>

        {/* Users Section */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Manage Users</h2>
          <div className="bg-zinc-900/30 border border-white/6 rounded-2xl p-6">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="text-xs">
                  <p className="font-bold">{u.name}</p>
                  <p className="text-zinc-500">{u.email}</p>
                </div>
                {u.id !== user.id && <DeleteUserButton userId={u.id} userName={u.name || "User"} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}