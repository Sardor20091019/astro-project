"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { MessageSquare, Menu, X } from "lucide-react";
import UserSearch from "@/components/UserSearch";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { pusherClient } from "@/lib/pusher";

// Small helper component to keep the code clean
const NavLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => (
  <Link href={href} className={`text-[10px] md:text-xs uppercase tracking-[0.2em] transition-colors hover:text-(--accent) ${className}`}>
    {children}
  </Link>
);

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  
  const [scrolled, setScrolled] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-(--bg)/80 backdrop-blur-xl border-b border-(--border)" : "bg-transparent"
      }`}>
        <div className="mx-auto flex h-18 w-full max-w-[95vw] items-center justify-between px-6">
          
          {/* Logo */}
          <Link href="/" className="text-sm font-black uppercase tracking-[0.2em] hover:opacity-80">
            ㅤㅤㅤㅤㅤㅤAstro<span className="text-(--accent)">spectrum</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <NavLink href="/">Gallery</NavLink>
              <NavLink href="/leaderboard">Leaderboard</NavLink>
              <NavLink href="/submit">Submit</NavLink>
            </div>

            <div className="flex items-center gap-4 border-l border-(--border) pl-6">
              <ThemeToggle />
              <UserSearch />
              {status === "loading" ? (
                <div className="h-4 w-12 animate-pulse rounded bg-(--surface-3)" />
              ) : user ? (
                <>
                  <Link href="/messages" className="relative">
                    <MessageSquare size={16} className="text-(--text-dim) hover:text-(--accent)" />
                    {hasUnread && <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-(--accent)" />}
                  </Link>
                  <UserMenu user={user} />
                </>
              ) : (
                <Link href="/login" className="rounded-sm bg-(--text) px-4 py-1.5 text-[10px] font-bold uppercase text-(--bg)">Sign In</Link>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-18 z-40 flex flex-col gap-6 bg-(--bg) p-6 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink href="/">Gallery</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
            <NavLink href="/submit">Submit</NavLink>
          </div>
          <div className="mt-auto flex flex-col gap-4 border-t border-(--border) pt-6">
            <ThemeToggle />
            {user ? (
              <button onClick={() => signOut()} className="text-[10px] uppercase tracking-widest text-red-500">Sign Out</button>
            ) : (
              <Link href="/login" className="text-[10px] uppercase tracking-widest">Sign In</Link>
            )}
          </div>
        </div>
      )}
      
      {/* Spacer to prevent fixed nav overlap */}
      <div className="h-18" />
    </>
  );
}