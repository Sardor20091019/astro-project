import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminPhotoList from "@/components/AdminPhotoList";
import { prisma } from "@/lib/prisma";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !isAdmin(session.user.email)) {
    redirect("/");
  }

  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <header className="mb-10 flex items-end justify-between border-b border-white/8 pb-8">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.36em] text-red-500/70">
              <Shield size={10} /> AstroSpectrum
            </p>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Admin Panel</h1>
            <p className="text-zinc-600 mt-1.5 text-xs">{photos.length} total photos · Full deletion rights</p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-right">
            <div className="text-xs text-zinc-500">
              <p className="text-white font-bold">{session.user?.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Admin</p>
            </div>
            {session.user?.image && (
              <img src={session.user.image} alt="" className="w-9 h-9 rounded-full border border-white/10 object-cover" />
            )}
          </div>
        </header>

        <div className="mb-6 bg-red-500/5 border border-red-500/15 rounded-2xl p-4 text-xs text-zinc-400 leading-relaxed">
          <span className="text-red-400 font-black uppercase tracking-widest">Admin powers — </span>
          You can delete any photo on the platform. All photos are published immediately without approval.
          Regular users can only delete their own photos from their profile page.
        </div>

        <div className="bg-zinc-900/30 border border-white/6 rounded-2xl p-6">
          <AdminPhotoList initialPhotos={photos} />
        </div>
      </div>
    </div>
  );
}
