"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UserSearch from "@/components/UserSearch";
import { MessageSquare, Menu, X } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  
  const [scrolled, setScrolled] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetch('/api/user-count')
      .then((res) => res.json())
      .then((data) => { if (typeof data.count === 'number') setUserCount(data.count); })
      .catch((err) => console.error("Failed to fetch user count:", err));

    if (!pusherClient) return;
    const channel = pusherClient.subscribe("global-channel");
    channel.bind("user-count-updated", (data: { count: number }) => setUserCount(data.count));
    return () => { pusherClient?.unsubscribe("global-channel"); };
  }, []);

  useEffect(() => {
    if (pathname === "/messages") setHasUnread(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user?.id || !pusherClient) return;
    const channelName = `chat_${user.id}`;
    pusherClient.subscribe(channelName);
    const handleIncomingAlert = () => { if (pathname !== "/messages") setHasUnread(true); };
    pusherClient.bind("new-message", handleIncomingAlert);
    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.unbind("new-message", handleIncomingAlert);
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
      <nav className={`fixed top-0 left-0 right-0 w-full transition-all duration-300 z-50 ${scrolled || mobileMenuOpen ? "bg-(--bg)/90 backdrop-blur-md border-b border-(--border)" : "bg-transparent"}`}>
        <div className="w-full max-w-[95vw] mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="inline-flex min-h-11 min-w-11 items-center text-sm font-black uppercase tracking-[0.2em] text-(--text) transition-opacity hover:opacity-80">
            Astro<span className="text-(--accent)">spectrum</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-7">
              {userCount !== null && (
                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-(--text-muted)">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   {userCount} registered users
                </div>
              )}
              <ThemeToggle />
              <UserSearch />
              <Link href="/" className="text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text) transition-colors">Gallery</Link>
              <Link href="/leaderboard" className="text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text) transition-colors">Leaderboard</Link>
              <Link href="/submit" className="text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text) transition-colors">Submit</Link>
              
              {/* Authenticated User Section */}
              <div className="pl-2 border-l border-(--border) flex items-center gap-4">
                {status === "loading" ? (
                  <span className="text-[10px] text-(--text-muted) animate-pulse">Loading...</span>
                ) : user ? (
                  <>
                    <Link href="/messages" className="relative flex items-center gap-1.5 text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text)">
                      <MessageSquare size={14} />
                      {hasUnread && <span className="absolute -top-1 -right-2 h-2 w-2 bg-(--accent) rounded-full animate-pulse" />}
                    </Link>
                    {admin && <Link href="/admin" className="text-xs font-bold uppercase text-(--accent)">Admin</Link>}
                    <Link href={`/profile/${user.id}`} className="text-xs uppercase tracking-widest text-(--text-dim) hover:text-(--text)">
                      {user.name}
                    </Link>
                    <UserMenu user={user} />
                  </>
                ) : (
                  <Link href="/login" className="rounded-md bg-(--text) px-5 py-2 text-[10px] font-bold uppercase text-(--bg)">Sign in</Link>
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
            <Link href="/" className="text-sm uppercase text-(--text)">Gallery</Link>
            <div className="border-t border-(--border) pt-5 flex flex-col gap-4">
              {user ? (
                <Link href={`/profile/${user.id}`} className="text-sm uppercase text-(--text)">Profile</Link>
              ) : (
                <Link href="/login" className="text-sm uppercase text-(--accent)">Sign in</Link>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-18 w-full" />
    </>
  );
}