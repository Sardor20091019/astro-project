/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserSearch from "@/components/UserSearchTrigger";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active: boolean;
}

const NavLink = ({ href, children, active }: NavLinkProps) => (
  <Link 
    href={href} 
    className={`relative flex items-center h-full text-[10px] md:text-xs uppercase tracking-[0.2em] transition-colors ${
      active ? "text-(--accent) font-semibold" : "text-(--text-dim) hover:text-(--text)"
    }`}
  >
    <span>{children}</span>
    {active && (
      <span className="absolute bottom-3 left-0 right-0 h-[2px] bg-(--accent) rounded-full animate-in fade-in duration-200" />
    )}
  </Link>
);

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { 
    setMobileMenuOpen(false); 
  }, [pathname]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-(--bg)/85 backdrop-blur-xl border-b border-(--border) shadow-lg shadow-black/5" 
          : "bg-gradient-to-b from-(--bg)/80 to-transparent backdrop-blur-xs"
      }`}>
        <div className="mx-auto flex items-center justify-between h-18 w-full max-w-[95vw] px-6">
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center h-full text-sm font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
            <span>Astro<span className="text-(--accent)">spectrum</span></span>
          </Link>

          {/* Right Group: Navigation Links + Actions */}
          <div className="flex items-center gap-8">
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center h-full gap-8">
              <NavLink href="/" active={pathname === "/"}>Gallery</NavLink> 
              <NavLink href="/photos" active={pathname === "/photos"}>Photos</NavLink>
              <NavLink href="/leaderboard" active={pathname === "/leaderboard"}>Leaderboard</NavLink>
            </div>

            {/* Actions (Search + Theme + Auth) */}
            <div className="flex items-center gap-3">
              {/* Animated Search Container */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <UserSearch />
              </motion.div>

              <ThemeToggle />

              {/* Desktop Auth/Profile */}
              <div className="hidden md:flex items-center h-full gap-4 border-l border-(--border) pl-4">
                {status === "loading" ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-(--surface-3)" />
                ) : user ? (
                  <div className="flex items-center h-full gap-4">
                    <UserMenu user={user} />
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    style={{ borderRadius: "var(--radius-sm)" }}
                    className="inline-flex items-center justify-center bg-(--text) px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-(--bg) hover:opacity-90 transition-opacity"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="md:hidden flex items-center justify-center p-2 text-(--text) hover:bg-(--surface-2) rounded transition-colors ml-1 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 top-18 z-40 flex flex-col bg-(--bg)/95 backdrop-blur-2xl p-6 md:hidden overflow-y-auto"
          >
            {/* Top Auth Section in Mobile Menu */}
            <div className="flex flex-col pb-6 border-b border-(--border) gap-4">
              {status === "loading" ? (
                <div className="h-8 w-16 animate-pulse rounded bg-(--surface-3)" />
              ) : user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-(--surface-2) border border-(--border) flex items-center justify-center overflow-hidden text-(--text-dim)">
                      {user.image ? (
                        <img src={user.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-(--text) truncate uppercase tracking-wider">{user.name || "User"}</p>
                      <p className="text-[10px] text-(--text-muted) truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Link 
                      href={`/profile/${user.id}`}
                      className="flex items-center justify-center py-3 px-4 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] uppercase tracking-wider font-bold text-(--text) hover:border-(--border-hover) transition-all"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="flex items-center justify-center py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-[10px] uppercase tracking-wider font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] uppercase tracking-widest text-(--text-muted)">Welcome to Astrospectrum</span>
                  <Link 
                    href="/login" 
                    style={{ borderRadius: "var(--radius-sm)" }}
                    className="inline-flex items-center justify-center bg-(--text) px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-(--bg)"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation Links in Mobile Menu */}
            <div className="flex flex-col gap-6 pt-6">
              <div className="text-[9px] uppercase tracking-[0.25em] text-(--text-muted) font-black">Menu</div>
              <div className="flex flex-col gap-4">
                <Link href="/" className="text-xs uppercase tracking-[0.2em] font-semibold text-(--text) py-1">Gallery</Link>
                <Link href="/photos" className="text-xs uppercase tracking-[0.2em] font-semibold text-(--text) py-1">Photos</Link>
                <Link href="/leaderboard" className="text-xs uppercase tracking-[0.2em] font-semibold text-(--text) py-1">Leaderboard</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Spacer to prevent fixed nav overlap */}
      <div className="h-18" />
    </>
  );
}