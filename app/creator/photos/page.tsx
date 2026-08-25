"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import PhotoGrid from "@/components/PhotoGrid";
import { photos } from "@/data/photos";

export default function PhotosPage() {
  // Timeline Scrubber Refs & States
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
    <div className="relative min-h-screen bg-(--bg) text-(--text) flex flex-col items-center">
      
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
                  ? "w-7 h-[2.5px] bg-(--accent) shadow-[0_0_12px_var(--accent)] scale-125" 
                  : isMajor
                  ? "w-4.5 h-[1.5px] bg-(--text) opacity-50"
                  : isSemiMajor
                  ? "w-3 h-[1.2px] bg-(--text-muted) opacity-35"
                  : "w-1.5 h-[1px] bg-(--text-dim) opacity-20"
              }`}
            />
          );
        })}
      </aside>

      <main className="main-wrapper py-6 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-(--text)">
            Gallery Archive
          </h1>
          <p className="text-xs sm:text-sm text-(--text-dim) font-mono uppercase tracking-[0.15em]">
            Selected moments and captured atmospheres
          </p>
        </div>
        
        <Suspense fallback={<PhotosLoadingSkeleton />}>
          <PhotoGrid initialPhotos={photos} />
        </Suspense>
      </main>
    </div>
  );
}

function PhotosLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div 
          key={n} 
          style={{ height: "320px" }}
          className="bg-(--surface-2) rounded-2xl border border-(--border) animate-pulse" 
        />
      ))}
    </div>
  );
}