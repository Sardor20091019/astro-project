/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import UserSearch from "@/components/UserSearch";
import { MessageSquare } from "lucide-react";
import { pusherClient } from "@/lib/pusher";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  
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
          scrolled 
            ? "bg-[#050505]/80 backdrop-blur-lg border-b border-white/10 shadow-sm" 
            : "bg-transparent"
        }`}
        style={{ zIndex: 9999 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="inline-flex min-h-[44px] min-w-[44px] items-center text-sm font-black uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80">
            Astro<span className="text-red-500">spectrum</span>
          </Link>

          <div className="flex items-center gap-8">
            
            {/* User Count Sticker */}
            {userCount !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 backdrop-blur-sm hidden sm:flex">
                <span className="text-[10px] tracking-wider uppercase">Users:</span>
                <span className="text-[11px] font-mono font-bold text-white">{userCount.toLocaleString()}</span>
              </div>
            )}

            {/* Main Navigation */}
            <div className="hidden md:flex items-center gap-7">
              
              <UserSearch />

              <Link href="/" className="inline-flex min-h-[44px] min-w-[44px] items-center text-xs uppercase tracking-widest text-neutral-400 transition-colors duration-200 hover:text-white">
                Gallery
              </Link>
              
              <Link href="/submit" className="inline-flex min-h-[44px] min-w-[44px] items-center text-xs uppercase tracking-widest text-neutral-400 transition-colors duration-200 hover:text-white">
                Submit
              </Link>
              
              {status === "authenticated" && (
                <Link 
                  href="/messages" 
                  className="relative flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-400 transition-colors duration-200 hover:text-white"
                >
                  <MessageSquare size={14} className="opacity-80" /> 
                  <span>Messages</span>
                  {hasUnread && (
                    <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  )}
                </Link>
              )}

              {admin && (
                <Link href="/admin" className="inline-flex min-h-[44px] min-w-[44px] items-center text-xs font-bold uppercase tracking-widest text-red-500 transition-colors duration-200 hover:text-red-400">
                  Admin
                </Link>
              )}

              {/* Auth Section */}
              <div className="pl-2 border-l border-white/10 flex items-center">
                {status === "loading" ? (
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest animate-pulse">Loading...</span>
                ) : user ? (
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${user.id}`} className="group flex min-h-[44px] min-w-[44px] items-center gap-2.5">
                      {user.image && (
                        <img 
                          src={user.image} 
                          className="h-8 w-8 rounded-full object-cover border border-white/20 group-hover:border-white/60 transition-colors" 
                          alt="Profile" 
                        />
                      )}
                      <span className="text-xs text-neutral-300 group-hover:text-white transition-colors duration-200">
                        {user.name}
                      </span>
                    </Link>
                    <button 
                      onClick={() => signOut()} 
                      className="min-h-[44px] min-w-[44px] text-[10px] uppercase tracking-widest text-neutral-500 transition-colors duration-200 hover:text-red-400"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition-all duration-200 hover:bg-neutral-200 hover:shadow-lg active:scale-95"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from jumping under the fixed navbar */}
      <div className="h-[72px] w-full" />
    </>
  );
}
