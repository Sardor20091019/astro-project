"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import UserSearch from "@/components/UserSearch";
import { MessageSquare, Menu, X, Trophy } from "lucide-react";
import { pusherClient } from "@/lib/pusher";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

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
    setMobileMenuOpen(false);
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
          scrolled || mobileMenuOpen
            ? "bg-[#050505]/95 backdrop-blur-lg border-b border-white/10 shadow-sm" 
            : "bg-transparent"
        }`}
        style={{ zIndex: 9999 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          
          <Link href="/" className="inline-flex min-h-[44px] min-w-[44px] items-center text-sm font-black uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80">
            Astro<span className="text-red-500">spectrum</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            
            {userCount !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 backdrop-blur-sm hidden sm:flex">
                <span className="text-[10px] tracking-wider uppercase">Users:</span>
                <span className="text-[11px] font-mono font-bold text-white">{userCount.toLocaleString()}</span>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-7">
              
              <UserSearch />

              <Link href="/" className="inline-flex min-h-[44px] min-w-[44px] items-center text-xs uppercase tracking-widest text-neutral-300 transition-colors duration-200 hover:text-white">
                Gallery
              </Link>

              {/* Added Leaderboard Link for Desktop */}
              <Link href="/leaderboard" className="inline-flex min-h-[44px] min-w-[44px] items-center text-xs uppercase tracking-widest text-neutral-300 transition-colors duration-200 hover:text-white">
                Leaderboard
              </Link>
              
              <Link href="/submit" className="inline-flex min-h-[44px] min-w-[44px] items-center text-xs uppercase tracking-widest text-neutral-300 transition-colors duration-200 hover:text-white">
                Submit
              </Link>
              
              {status === "authenticated" && (
                <Link 
                  href="/messages" 
                  className="relative flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-300 transition-colors duration-200 hover:text-white"
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

              <div className="pl-2 border-l border-white/10 flex items-center">
                {status === "loading" ? (
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest animate-pulse">Loading...</span>
                ) : user ? (
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${user.id}`} className="group flex min-h-[44px] min-w-[44px] items-center gap-2.5">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/20 group-hover:border-white/60 transition-colors">
                        <Image 
                          src={(!avatarError && user.image) ? user.image : "/fallback-avatar.png"} 
                          fill
                          sizes="32px"
                          className="object-cover" 
                          alt="Profile" 
                          onError={() => setAvatarError(true)}
                        />
                      </div>
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

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden min-h-[44px] min-w-[44px] items-center justify-center text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden w-full bg-[#050505] border-b border-white/10 px-6 py-6 flex flex-col gap-5">
            <div className="pb-2 border-b border-white/5">
              <UserSearch />
            </div>

            <Link href="/" className="flex min-h-[44px] items-center text-sm uppercase tracking-widest text-neutral-300 hover:text-white">
              Gallery
            </Link>

            {/* Added Leaderboard Link for Mobile Viewports */}
            <Link href="/leaderboard" className="flex min-h-[44px] items-center text-sm uppercase tracking-widest text-neutral-300 hover:text-white">
              Leaderboard
            </Link>
            
            <Link href="/submit" className="flex min-h-[44px] items-center text-sm uppercase tracking-widest text-neutral-300 hover:text-white">
              Submit
            </Link>
            
            {status === "authenticated" && (
              <Link 
                href="/messages" 
                className="relative flex min-h-[44px] items-center gap-2 text-sm uppercase tracking-widest text-neutral-300 hover:text-white"
              >
                <MessageSquare size={16} /> 
                <span>Messages</span>
                {hasUnread && (
                  <span className="ml-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>
            )}

            {admin && (
              <Link href="/admin" className="flex min-h-[44px] items-center text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-400">
                Admin
              </Link>
            )}

            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
              {status === "loading" ? (
                <span className="text-xs text-neutral-500 uppercase tracking-widest animate-pulse">Loading...</span>
              ) : user ? (
                <div className="flex flex-col gap-4">
                  <Link href={`/profile/${user.id}`} className="flex min-h-[44px] items-center gap-3">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/20">
                      <Image 
                        src={(!avatarError && user.image) ? user.image : "/fallback-avatar.png"} 
                        fill
                        sizes="32px"
                        className="object-cover" 
                        alt="Profile" 
                        onError={() => setAvatarError(true)}
                      />
                    </div>
                    <span className="text-sm text-neutral-300">
                      {user.name}
                    </span>
                  </Link>
                  <button 
                    onClick={() => signOut()} 
                    className="flex min-h-[44px] items-center text-sm uppercase tracking-widest text-neutral-500 hover:text-red-400"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-white py-3 text-xs font-bold uppercase tracking-widest text-black"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Structural Offset layout placeholder to prevent content clipping */}
      <div className="h-[72px] w-full" />
    </>
  );
}