/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User as UserIcon, Edit3, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserSearch from "@/components/UserSearchTrigger";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { updateUserProfile } from "@/lib/actions";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active: boolean;
}

const NavLink = ({ href, children, active }: NavLinkProps) => (
  <Link 
    href={href} 
    className={`relative flex items-center h-full text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
      active ? "text-(--accent) font-bold" : "text-(--text-dim) hover:text-(--text) font-medium"
    }`}
  >
    <span>{children}</span>
    {active && (
      <motion.span 
        layoutId="activeNav"
        className="absolute bottom-4 left-0 right-0 h-[2px] bg-(--accent) rounded-full" 
      />
    )}
  </Link>
);

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Profile editing state for mobile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newImage, setNewImage] = useState(user?.image || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNewName(user.name || "");
      setNewImage(user.image || "");
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { 
    setMobileMenuOpen(false); 
    setIsEditingProfile(false);
  }, [pathname]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.id, { name: newName, image: newImage });
      setIsEditingProfile(false);
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-in-out ${
        scrolled 
          ? "bg-(--bg)/75 backdrop-blur-2xl border-b border-(--border) shadow-sm" 
          : "bg-gradient-to-b from-(--bg)/90 to-transparent backdrop-blur-sm"
      }`}>
        <div className="mx-auto flex items-center justify-between h-[72px] w-full max-w-[98vw] sm:max-w-[95vw] px-4 sm:px-8">
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center h-full text-[11px] sm:text-[13px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:opacity-70 transition-opacity truncate mr-2">
            <span>Astro<span className="text-(--accent)">spectrum</span></span>
          </Link>

          {/* Right Group: Navigation Links + Actions */}
          <div className="flex items-center gap-4 sm:gap-10 shrink-0 h-full">
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center h-full gap-8">
              <NavLink href="/" active={pathname === "/"}>Gallery</NavLink> 
              <NavLink href="/photos" active={pathname === "/photos"}>Photos</NavLink>
              <NavLink href="/leaderboard" active={pathname === "/leaderboard"}>Leaderboard</NavLink>
            </div>

            {/* Actions (Search + Theme + Auth) */}
            <div className="flex items-center gap-2.5 sm:gap-4 h-full">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center scale-90 sm:scale-100"
              >
                <UserSearch />
              </motion.div>

              <div className="flex items-center scale-90 sm:scale-100">
                <ThemeToggle />
              </div>

              {/* Desktop Auth/Profile */}
              <div className="hidden md:flex items-center h-full gap-5 border-l border-(--border) pl-5 ml-1">
                {status === "loading" ? (
                  <div className="h-8 w-16 animate-pulse rounded-md bg-(--surface-3)" />
                ) : user ? (
                  <div className="flex items-center h-full transition-transform hover:scale-105 duration-200">
                    <UserMenu user={user} />
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    style={{ borderRadius: "var(--radius-sm)" }}
                    className="inline-flex items-center justify-center bg-(--text) px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-(--bg) hover:bg-(--accent) hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button 
                onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setIsEditingProfile(false); }} 
                className="md:hidden flex items-center justify-center p-2 text-(--text) hover:bg-(--surface-2) rounded-lg transition-colors cursor-pointer"
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
            initial={{ opacity: 0, y: -15, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-[72px] z-40 flex flex-col bg-(--bg)/98 backdrop-blur-3xl p-6 md:hidden overflow-y-auto"
          >
            {/* Top Auth Section in Mobile Menu */}
            <div className="flex flex-col pb-8 border-b border-(--border)/60 gap-4">
              {status === "loading" ? (
                <div className="h-10 w-24 animate-pulse rounded-lg bg-(--surface-3)" />
              ) : user ? (
                isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-[0.15em] text-(--accent) font-bold">Edit Profile</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)}
                        className="text-(--text-muted) hover:text-(--text) font-mono text-[10px] uppercase tracking-wider cursor-pointer bg-(--surface-2) px-3 py-1.5 rounded-full"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Avatar Preview & Uploadthing Component */}
                    <div className="flex flex-col items-center justify-center gap-3 py-1">
                      <div className="relative h-20 w-20 rounded-full border-2 border-(--border) bg-(--surface-2) flex items-center justify-center overflow-hidden shadow-inner">
                        <img 
                          src={newImage || "/default-avatar.png"} 
                          alt="Avatar preview" 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="w-full flex justify-center pt-1">
                        <UploadButton<OurFileRouter, "profileUploader">
                          endpoint="profileUploader"
                          appearance={{
                            button: "bg-[var(--accent)] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-md w-full",
                            allowedContent: "hidden",
                            container: "w-full flex justify-center"
                          }}
                          content={{
                            button: "Change Photo"
                          }}
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              const finalUrl = res[0].serverData?.url || res[0].ufsUrl || res[0].url;
                              setNewImage(finalUrl);
                            }
                          }}
                          onUploadError={(err) => alert("Upload failed: " + err.message)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">Display Name</label>
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        required 
                        className="bg-(--surface-2) border border-(--border) px-4 py-3 rounded-xl font-mono text-xs text-(--text) outline-none focus:border-(--accent) transition-colors"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="mt-1 w-full py-3.5 rounded-xl bg-(--text) text-(--bg) font-mono text-xs font-bold uppercase tracking-[0.15em] hover:bg-(--accent) transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-full bg-(--surface-2) border-2 border-(--border) flex items-center justify-center overflow-hidden text-(--text-dim)">
                        {user.image ? (
                          <img src={user.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-(--text) truncate uppercase tracking-widest">{user.name || "User"}</p>
                        <p className="text-[11px] text-(--text-muted) truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <Link 
                        href={`/profile/${user.id}`}
                        className="flex items-center justify-center py-3 px-2 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] uppercase tracking-wider font-bold text-(--text) hover:border-(--text) transition-all text-center"
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center justify-center py-3 px-2 rounded-xl bg-(--accent)/10 border border-(--accent)/30 font-mono text-[10px] uppercase tracking-wider font-bold text-(--accent) hover:bg-(--accent) hover:text-white transition-all cursor-pointer gap-1.5 text-center"
                      >
                        <Edit3 size={12} />
                        Edit
                      </button>
                      <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center justify-center py-3 px-2 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-[10px] uppercase tracking-wider font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer text-center"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  <span className="text-[10px] uppercase tracking-widest text-(--text-muted)">Welcome to Astrospectrum</span>
                  <Link 
                    href="/login" 
                    className="flex items-center justify-center bg-(--text) px-5 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] text-(--bg) hover:bg-(--accent) hover:text-white transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation Links in Mobile Menu */}
            <div className="flex flex-col gap-6 pt-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-(--text-muted) font-black">Navigation</div>
              <div className="flex flex-col gap-5">
                <Link href="/" className="text-sm uppercase tracking-[0.2em] font-semibold text-(--text) flex items-center justify-between group">
                  <span>Gallery</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-(--accent)">→</span>
                </Link>
                <Link href="/photos" className="text-sm uppercase tracking-[0.2em] font-semibold text-(--text) flex items-center justify-between group">
                  <span>Photos</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-(--accent)">→</span>
                </Link>
                <Link href="/leaderboard" className="text-sm uppercase tracking-[0.2em] font-semibold text-(--text) flex items-center justify-between group">
                  <span>Leaderboard</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-(--accent)">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Spacer to prevent fixed nav overlap */}
      <div className="h-[72px]" />
    </>
  );
}