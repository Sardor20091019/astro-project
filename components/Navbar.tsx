/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { MessageSquare } from "lucide-react";
import { pusherClient } from "@/lib/pusher";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);


  useEffect(() => {
    fetch('/api/user-count')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === 'number') setUserCount(data.count);
      })
      .catch((err) => console.error("Failed to fetch user count:", err));
  }, []);

  useEffect(() => {
    if (pathname === "/messages") setHasUnread(false);
  }, [pathname]);


  useEffect(() => {
    if (!user?.id) return;
    const channelName = `chat_${user.id}`;
    pusherClient?.subscribe(channelName);
    const handleIncomingAlert = () => {
      if (pathname !== "/messages") setHasUnread(true);
    };
    pusherClient?.bind("new-message", handleIncomingAlert);
    return () => {
      pusherClient?.unsubscribe(channelName);
      pusherClient?.unbind("new-message", handleIncomingAlert);
    };
  }, [user?.id, pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const admin = user?.role === "ADMIN";

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 w-full transition-all duration-300 ${
          scrolled ? "bg-[#080808]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"
        }`}
        style={{ zIndex: 9999 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-[0.15em] uppercase">
            Astro<span className="text-red-500">spectrum</span>
          </Link>

          <div className="flex items-center gap-8">
            {/* User Count Sticker - Visible on all screen sizes now */}
            {userCount !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#666]">
                <span className="text-[10px]">registered users:</span>
                <span className="text-[10px] font-mono font-bold text-white">{userCount.toLocaleString()}</span>
              </div>
            )}

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-xs uppercase tracking-widest text-[#666] hover:text-white">Gallery</Link>
              <Link href="/submit" className="text-xs uppercase tracking-widest text-[#666] hover:text-white">Submit</Link>
              
              {status === "authenticated" && (
                <Link href="/messages" className="text-xs uppercase tracking-widest text-[#666] hover:text-white flex items-center gap-1.5 relative">
                  <MessageSquare size={11} /> Messages
                  {hasUnread && <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />}
                </Link>
              )}

              {admin && (
                <Link href="/admin" className="text-red-500 text-xs uppercase tracking-widest font-bold">Admin</Link>
              )}

              {status === "loading" ? (
                <span className="text-[10px] text-[#666] uppercase">Loading...</span>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${user.id}`} className="flex items-center gap-2">
                    {user.image && <img src={user.image} className="h-7 w-7 rounded-full object-cover" alt="Profile" />}
                    <span className="text-xs text-[#888]">{user.name}</span>
                  </Link>
                  <button onClick={() => signOut()} className="text-[10px] text-[#666] hover:text-white uppercase">Sign out</button>
                </div>
              ) : (
                <Link href="/login" className="bg-white text-black px-4 py-1.5 text-[10px] uppercase font-bold rounded hover:bg-gray-200">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16 w-full" />
    </>
  );
}