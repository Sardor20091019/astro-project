// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Shield, MessageSquare } from "lucide-react";
import { isAdmin } from "@/lib/admin";
import { pusherClient } from "@/lib/pusher";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const admin = isAdmin(session?.user?.email);
  const currentUserId = session?.user?.id;

  // Clear unread notification when the user actively opens the messages view
  useEffect(() => {
    if (pathname === "/messages") {
      setHasUnread(false);
    }
  }, [pathname]);

  // Listen to incoming messages in the background via Pusher channels
  useEffect(() => {
    if (!currentUserId) return;

    const channelName = `chat_${currentUserId}`;
    pusherClient.subscribe(channelName);

    const handleIncomingAlert = () => {
      // Trigger notification dot only if user isn't currently sitting in the messages screen
      if (pathname !== "/messages") {
        setHasUnread(true);
      }
    };

    pusherClient.bind("new-message", handleIncomingAlert);

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind("new-message", handleIncomingAlert);
    };
  }, [currentUserId, pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* Real Fixed Header Nav Pane Layer */}
      <nav 
        className={`fixed top-0 left-0 right-0 w-full transition-all duration-300 transform-gpu will-change-transform ${
          scrolled ? "bg-[#080808]/95 backdrop-blur-md border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]" : "bg-transparent"
        }`}
        style={{ zIndex: 9999 }} // Explicit high stack rule to guarantee it stays on top of WebGL/Skews
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-[0.15em] uppercase">
            Astro<span className="text-red-500">spectrum</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-xs uppercase tracking-widest text-[#666] hover:text-white transition-colors font-medium">Gallery</Link>
            <Link href="/submit" className="text-xs uppercase tracking-widest text-[#666] hover:text-white transition-colors font-medium">Submit</Link>
            
            {/* Unified Chat Link - Pointed safely to /messages dashboard layout */}
            {session && (
              <Link href="/messages" className="text-xs uppercase tracking-widest text-[#666] hover:text-white transition-colors font-medium flex items-center gap-1.5 relative group">
                <MessageSquare size={11} className="text-zinc-500 group-hover:text-white transition-colors" /> 
                <span>Messages</span>
                
                {/* Premium Red Ping Dot for Desktop */}
                {hasUnread && (
                  <span className="absolute -top-1 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  </span>
                )}
              </Link>
            )}

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

          {/* Mobile toggle button (Includes ambient dot wrapper alert) */}
          <button className="md:hidden text-[#666] hover:text-white relative p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
            {!open && hasUnread && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-[#080808]/98 backdrop-blur-lg border-t border-white/5 px-6 py-4 flex flex-col gap-4">
            <Link href="/" onClick={() => setOpen(false)} className="text-xs uppercase tracking-widest text-[#666] hover:text-white">Gallery</Link>
            <Link href="/submit" onClick={() => setOpen(false)} className="text-xs uppercase tracking-widest text-[#666] hover:text-white">Submit</Link>
            
            {/* Unified Mobile Chat Link with inline badge alert alignment */}
            {session && (
              <Link href="/messages" onClick={() => setOpen(false)} className="text-xs uppercase tracking-widest text-[#666] hover:text-white flex items-center justify-between">
                <span>Messages</span>
                {hasUnread && (
                  <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-900/60 text-[8px] font-black tracking-widest text-red-400 uppercase">
                    New Alert
                  </span>
                )}
              </Link>
            )}

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

      {/* The Phantom Layout Block element - Perfectly anchors contents 64px (h-16) below header */}
      <div className="h-16 w-full bg-[#080808]" aria-hidden="true" />
    </>
  );
}