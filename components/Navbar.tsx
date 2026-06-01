"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, Shield } from "lucide-react";
import { isAdmin } from "@/lib/admin";

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const admin = isAdmin(session?.user?.email);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? "bg-[#080808]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-sm font-bold tracking-[0.15em] uppercase">
          Astro<span className="text-red-500">spectrum</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-xs uppercase tracking-widest text-[#666] hover:text-white transition-colors font-medium">Gallery</Link>
          <Link href="/submit" className="text-xs uppercase tracking-widest text-[#666] hover:text-white transition-colors font-medium">Submit</Link>
          {admin && (
            <Link href="/admin" className="flex items-center gap-1 text-xs uppercase tracking-widest text-red-500 font-bold">
              <Shield size={11} /> Admin
            </Link>
          )}
          <div className="w-px h-4 bg-white/10" />
          {session ? (
            <div className="flex items-center gap-3">
              <Link href={`/profile/${session.user.id}`} className="flex items-center gap-2 group">
                {session.user?.image && (
                  <img src={session.user.image} alt="" className="h-7 w-7 rounded-full border border-white/10 object-cover group-hover:border-red-500/50 transition-all" />
                )}
                <span className="max-w-28 truncate text-xs text-[#888] group-hover:text-white transition-colors">{session.user?.name}</span>
              </Link>
              <button onClick={() => signOut()} className="btn-ghost py-1.5 px-3 text-[10px]">Sign out</button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary py-1.5 px-4 text-[10px]">Sign in</Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-[#666] hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#111] border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setOpen(false)} className="text-xs uppercase tracking-widest text-[#666] hover:text-white">Gallery</Link>
          <Link href="/submit" onClick={() => setOpen(false)} className="text-xs uppercase tracking-widest text-[#666] hover:text-white">Submit</Link>
          {admin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="text-xs uppercase tracking-widest text-red-500">Admin</Link>
          )}
          {session ? (
            <div className="flex flex-col gap-3 pt-1 border-t border-white/5">
              <Link href={`/profile/${session.user.id}`} onClick={() => setOpen(false)} className="text-xs uppercase tracking-widest text-[#666] hover:text-white">My Profile</Link>
              <button onClick={() => signOut()} className="text-xs uppercase tracking-widest text-[#666] text-left">Sign out</button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="text-xs uppercase tracking-widest text-red-500">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  );
}
