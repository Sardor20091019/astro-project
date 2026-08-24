"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User as UserIcon, Edit3, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserSearchTrigger from "@/components/UserSearchTrigger";
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
      active ? "text-[var(--accent)] font-bold" : "text-[var(--text-dim)] hover:text-[var(--text)] font-medium"
    }`}
  >
    <span>{children}</span>
    {active && (
      <motion.span 
        layoutId="activeNav"
        className="absolute bottom-4 left-0 right-0 h-[2px] bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]" 
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
    const handleScroll = () => setScrolled(window.scrollY > 15);
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        scrolled 
          ? "bg-[var(--bg)]/85 backdrop-blur-2xl border-b border-[var(--border)] shadow-md" 
          : "bg-gradient-to-b from-[var(--bg)]/90 via-[var(--bg)]/40 to-transparent backdrop-blur-md"
      }`}>
        <div className="mx-auto flex items-center justify-between h-[76px] w-full max-w-[96vw] sm:max-w-[92vw] px-4 sm:px-6">
          
          {/* LEFT SIDE: Logo Only */}
          <Link href="/" className="flex items-center h-full text-xs sm:text-sm font-black uppercase tracking-[0.25em] hover:opacity-80 transition-opacity shrink-0">
            <span>Astro<span className="text-[var(--accent)]">spectrum</span></span>
          </Link>

          {/* RIGHT SIDE: Navigation Links, Search, Theme Toggle, and Profile/Auth */}
          <div className="flex items-center h-full gap-5 sm:gap-6">
            
            {/* Desktop Links & Search Trigger */}
            <div className="hidden lg:flex items-center h-full gap-6">
              <NavLink href="/" active={pathname === "/"}>Gallery</NavLink> 
              <NavLink href="/photos" active={pathname === "/photos"}>Photos</NavLink>
              <NavLink href="/leaderboard" active={pathname === "/leaderboard"}>Leaderboard</NavLink>
              {user && (
                <NavLink href="/creator/photos" active={pathname === "/creator/photos"}>Creator Photos</NavLink>
              )}
              <div className="flex items-center pl-4 border-l border-[var(--border)]">
                <UserSearchTrigger />
              </div>
            </div>

            {/* Mobile Search Trigger Icon */}
            <div className="lg:hidden flex items-center">
              <UserSearchTrigger />
            </div>

            <div className="flex items-center">
              <ThemeToggle />
            </div>

            {/* Desktop Auth / User Menu */}
            <div className="hidden md:flex items-center h-full gap-4 border-l border-[var(--border)] pl-4">
              {status === "loading" ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-[var(--surface-3)]" />
              ) : user ? (
                <div className="flex items-center h-full transition-transform hover:scale-105 duration-200">
                  <UserMenu user={user} />
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center bg-[var(--text)] px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setIsEditingProfile(false); }} 
              className="lg:hidden flex items-center justify-center p-2 text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer border border-[var(--border)]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-[76px] z-40 flex flex-col bg-[var(--bg)]/98 backdrop-blur-3xl p-6 lg:hidden overflow-y-auto border-b border-[var(--border)] shadow-2xl"
          >
            {/* Mobile User Profile Section */}
            <div className="flex flex-col pb-6 border-b border-[var(--border)] gap-4">
              {status === "loading" ? (
                <div className="h-12 w-32 animate-pulse rounded-xl bg-[var(--surface-3)]" />
              ) : user ? (
                isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-bold">Edit Profile</span>
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)}
                        className="text-[var(--text-muted)] hover:text-[var(--text)] font-mono text-[10px] uppercase tracking-wider bg-[var(--surface-2)] px-3 py-1.5 rounded-full cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative h-20 w-20 rounded-full border-2 border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center overflow-hidden shadow-inner">
                        <Image 
                          src={newImage || "/default-avatar.png"} 
                          alt="Avatar preview" 
                          fill
                          sizes="80px"
                          unoptimized
                          className="object-cover" 
                        />
                      </div>
                      <div className="w-full flex justify-center">
                        <UploadButton<OurFileRouter, "profileUploader">
                          endpoint="profileUploader"
                          appearance={{
                            button: "bg-[var(--accent)] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-md w-full",
                            allowedContent: "hidden",
                            container: "w-full flex justify-center"
                          }}
                          content={{ button: "Change Photo" }}
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

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Display Name</label>
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        required 
                        className="bg-[var(--surface-2)] border border-[var(--border)] px-4 py-2.5 rounded-xl font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full py-3 rounded-xl bg-[var(--text)] text-[var(--bg)] font-mono text-xs font-bold uppercase tracking-[0.15em] hover:bg-[var(--accent)] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-13 w-13 shrink-0 rounded-full bg-[var(--surface-2)] border-2 border-[var(--border)] flex items-center justify-center overflow-hidden text-[var(--text-dim)]">
                        {user.image ? (
                          <Image src={user.image} alt="" fill sizes="52px" unoptimized className="object-cover" />
                        ) : (
                          <UserIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text)] truncate uppercase tracking-widest">{user.name || "User"}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      <Link 
                        href={`/profile/${user.id}`}
                        className="flex items-center justify-center py-2.5 px-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px] uppercase tracking-wider font-bold text-[var(--text)] hover:border-[var(--text)] transition-all text-center"
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center justify-center py-2.5 px-2 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 font-mono text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all cursor-pointer gap-1.5 text-center"
                      >
                        <Edit3 size={12} />
                        Edit
                      </button>
                      <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center justify-center py-2.5 px-2 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-[10px] uppercase tracking-wider font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer text-center"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-3.5 w-full">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">Welcome to Astrospectrum</span>
                  <Link 
                    href="/login" 
                    className="flex items-center justify-center bg-[var(--text)] px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-white transition-all shadow-md"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-5 pt-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] font-black">Menu</span>
              <div className="flex flex-col gap-4">
                <Link href="/" className="text-sm uppercase tracking-[0.2em] font-semibold text-[var(--text)] flex items-center justify-between group py-1">
                  <span>Gallery</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">→</span>
                </Link>
                <Link href="/photos" className="text-sm uppercase tracking-[0.2em] font-semibold text-[var(--text)] flex items-center justify-between group py-1">
                  <span>Photos</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">→</span>
                </Link>
                <Link href="/leaderboard" className="text-sm uppercase tracking-[0.2em] font-semibold text-[var(--text)] flex items-center justify-between group py-1">
                  <span>Leaderboard</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">→</span>
                </Link>
                {user && (
                  <Link href="/creator/photos" className="text-sm uppercase tracking-[0.2em] font-semibold text-[var(--accent)] flex items-center justify-between group py-1">
                    <span>Creator Photos</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">→</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navbar Spacer */}
      <div className="h-[76px]" />
    </>
  );
}