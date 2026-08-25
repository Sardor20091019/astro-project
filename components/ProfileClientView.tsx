"use client";

import { useState, useEffect, useRef } from "react";
import ProfilePhotoStream from "@/components/ProfilePhotoStream";
import ProfileHeaderCard from "@/components/ProfileHeaderCard";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Photo {
  id: string;
  url: string;
  title: string | null;
  location: string | null;
}

interface FollowUser {
  id: string;
  name: string | null;
  image: string | null;
  isFollowing: boolean;
}

interface ProfileClientViewProps {
  user: UserProfile;
  photos: Photo[];
  followers: FollowUser[];
  following: FollowUser[];
  currentUserId?: string;
  isSelf: boolean;
  viewerIsAdmin: boolean;
  userId: string;
  isFollowing: boolean;
  canDelete: boolean;
}

export default function ProfileClientView({
  user,
  photos,
  followers,
  following,
  currentUserId,
  isSelf,
  viewerIsAdmin,
  userId,
  isFollowing,
  canDelete,
}: ProfileClientViewProps) {
  const timelineRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Timeline Scrubbing Logic
  const updateScrollFromClientY = (clientY: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const height = rect.height;
    const offsetY = clientY - rect.top;
    let percentage = (offsetY / height) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const targetY = (percentage / 100) * totalHeight;
      window.scrollTo({ top: targetY, behavior: "auto" });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsDraggingTimeline(true);
    updateScrollFromClientY(e.clientY);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updateScrollFromClientY(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDraggingTimeline(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center">
      
      {/* Hide default browser scrollbars for clean cinematic aesthetic */}
      <style jsx global>{`
        html {
          scrollbar-width: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* High-Density Cinematic Timeline Scrubber */}
      <aside
        ref={timelineRef}
        aria-label="Page scroll position scrubber"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`fixed right-4 sm:right-7 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end justify-between h-[50vh] py-2 px-2 cursor-ns-resize touch-none select-none transition-opacity ${
          isDraggingTimeline ? "opacity-100 scale-[1.02]" : "opacity-90 hover:opacity-100"
        }`}
      >
        {Array.from({ length: 150 }).map((_, i) => {
          const tickProgress = (i / 149) * 100;
          const distance = Math.abs(scrollProgress - tickProgress);
          const isActive = distance < 2.0;
          const isMajor = i % 15 === 0;
          const isSemiMajor = i % 5 === 0;

          return (
            <span
              key={i}
              className={`rounded-full transition-all duration-150 ease-out pointer-events-none ${
                isActive 
                  ? "w-7 h-[2.5px] bg-[var(--accent)] shadow-[0_0_12px_var(--accent)] scale-125" 
                  : isMajor
                  ? "w-4.5 h-[1.5px] bg-[var(--text)] opacity-50"
                  : isSemiMajor
                  ? "w-3 h-[1.2px] bg-[var(--text-muted)] opacity-35"
                  : "w-1.5 h-[1px] bg-[var(--text-dim)] opacity-20"
              }`}
            />
          );
        })}
      </aside>

      <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] pt-24 pb-20 selection:bg-[var(--accent)] selection:text-[var(--bg)] flex flex-col items-center w-full">
        <div className="max-w-4xl w-full mx-auto px-6 flex flex-col items-center gap-12">

          {/* Profile Card Header */}
          <ProfileHeaderCard
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            }}
            photosCount={photos.length}
            initialFollowers={followers}
            initialFollowing={following}
            currentUserId={currentUserId}
            isSelf={isSelf}
            viewerIsAdmin={viewerIsAdmin}
            userId={userId}
            isFollowingInitial={isFollowing}
          />

          {/* Images Stream Section */}
          <div className="w-full flex flex-col items-center gap-6">
            <div className="flex items-center justify-between w-full border-b border-[var(--border)] pb-4 px-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--text-muted)] font-bold">
                Images
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-widest bg-[var(--surface)] border border-[var(--border)] px-3.5 py-1 rounded-full text-[var(--text-dim)] shadow-sm">
                {photos.length} {photos.length === 1 ? "image posted" : "images"}
              </span>
            </div>

            <div className="w-full pt-2">
              <ProfilePhotoStream photos={photos} canDelete={canDelete} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}