"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import UserSearch from "@/components/UserSearch";
import { MessageSquare, Menu, X } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import ThemeToggle from "@/components/ThemeToggle";

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
        className={`fixed top-0 left-0 right-0 w-full transition-all duration-300 z-9999 ${
          scrolled || mobileMenuOpen
            ? "bg-(--bg)/90 backdrop-blur-md border-b border-(--border)" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-300 mx-auto px-6 h-18 flex items-center justify-between">
          
          <Link href="/" className="inline-flex min-h-11 min-w-11 items-center text-sm font-black uppercase tracking-[0.2em] text-(--text) transition-opacity hover:opacity-80">
            Astro<span className="text-(--accent)">spectrum</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-7">
              <ThemeToggle />
              <UserSearch />
              <Link href="/" className="inline-flex min-h-11 min-w-11 items-center text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text) transition-colors">
                Gallery
              </Link>
              <Link href="/leaderboard" className="inline-flex min-h-11 min-w-11 items-center text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text) transition-colors">
                Leaderboard
              </Link>
            <Link 
  href="/submit" 
  className="inline-flex min-h-11 min-w-11 items-center text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text) transition-colors"
>
  Submit
</Link>
              
              {status === "authenticated" && (
                <Link href="/messages" className="relative flex min-h-11 min-w-11 items-center gap-1.5 text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text)">
                  <MessageSquare size={14} /> 
                  <span>Messages</span>
                  {hasUnread && <span className="absolute -top-1 -right-2 h-2 w-2 bg-(--accent) rounded-full animate-pulse" />}
                </Link>
              )}

              {admin && (
                <Link href="/admin" className="inline-flex min-h-11 min-w-11 items-center text-xs font-bold uppercase tracking-widest text-(--accent)">
                  Admin
                </Link>
              )}

              <div className="pl-2 border-l border-(--border) flex items-center">
                {status === "loading" ? (
                  <span className="text-[10px] text-(--text-muted) uppercase tracking-widest animate-pulse">Loading...</span>
                ) : user ? (
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${user.id}`} className="group flex min-h-11 min-w-11 items-center gap-2.5">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden border border-(--border)">
                        <Image 
                          src={(!avatarError && user.image) ? user.image : "/fallback-avatar.png"} 
                          fill sizes="32px" className="object-cover" alt="Profile" 
                          onError={() => setAvatarError(true)}
                        />
                      </div>
                      <span className="text-xs text-(--text-dim) group-hover:text-(--text)">{user.name}</span>
                    </Link>
                    <button onClick={() => signOut()} className="text-[10px] uppercase tracking-widest text-(--text-muted) hover:text-(--accent)">
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="inline-flex items-center rounded-md bg-(--text) px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-(--bg)">
                    Sign in
                  </Link>
                )}
              </div>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-(--text)">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      {mobileMenuOpen && (
  <div className="md:hidden w-full bg-(--bg) border-b border-(--border) px-6 py-6 flex flex-col gap-5">
    <ThemeToggle />
    <UserSearch />
    <Link href="/" className="text-sm uppercase tracking-widest text-(--text)">Gallery</Link>
    <Link href="/leaderboard" className="text-sm uppercase tracking-widest text-(--text)">Leaderboard</Link>
    <Link href="/submit" className="text-sm uppercase tracking-widest text-(--text)">Submit</Link>
    
    {/* --- ADD THIS AUTH SECTION --- */}
    <div className="border-t border-(--border) pt-5 flex flex-col gap-4">
      {status === "loading" ? (
        <span className="text-xs text-(--text-muted) uppercase tracking-widest animate-pulse">Loading...</span>
      ) : user ? (
        <>
          <Link href={`/profile/${user.id}`} className="text-sm uppercase tracking-widest text-(--text)">
            Profile
          </Link>
          <button 
            onClick={() => signOut()} 
            className="text-left text-sm uppercase tracking-widest text-(--accent)"
          >
            Sign out
          </button>
        </>
      ) : (
        <Link href="/login" className="text-sm uppercase tracking-widest text-(--accent)">
          Sign in
        </Link>
      )}
    </div>
  </div>
)}
        
      </nav>
      <div className="h-18 w-full" />
    </>
  );
}