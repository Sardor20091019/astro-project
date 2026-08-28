"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CinematicLandingPage() {
  const [isLightMode, setIsLightMode] = useState(false);

  // Robust Theme Detection (HTML classes, data attributes, localStorage, & system preference)
  useEffect(() => {
    const root = document.documentElement;

    const checkTheme = () => {
      const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
      
      const isLight = 
        storedTheme === "light" ||
        root.classList.contains("light") || 
        root.classList.contains("theme-light") ||
        root.getAttribute("data-theme") === "light" || 
        ((!storedTheme && !root.classList.contains("dark")) && window.matchMedia("(prefers-color-scheme: light)").matches);

      setIsLightMode(isLight);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });

    window.addEventListener("storage", checkTheme);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    mediaQuery.addEventListener("change", checkTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", checkTheme);
      mediaQuery.removeEventListener("change", checkTheme);
    };
  }, []);

  // Dynamic content based on theme mode
  const heroPhoto = isLightMode
    ? {
        title: "Blooming Sakura",
        location: "Kyoto, Japan",
        url: "/photos/p1.jpg",
        description: "Soft pink petals unfurling under the morning sun. A delicate moment of spring awakening in quiet elegance.",
      }
    : {
        title: "A quiet Forest",
        location: "Finland Lapland",
        url: "/hero.jpg",
        description: "A quiet, freezing forest under the northern lights. A look at starry skies, cold trees, and deep peace.",
      };

  // Timeline Scrubber Refs & States
  const timelineRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);

  // High-performance Scroll Progress Listener with rAF batching
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const progress = (window.scrollY / totalHeight) * 100;
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
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
    <div className="relative min-h-screen bg-(--bg) text-(--text) flex flex-col justify-between overflow-hidden selection:bg-(--accent) selection:text-(--bg)">
      
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
              className={`rounded-full transition-transform duration-150 ease-out pointer-events-none ${
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

      {/* Cinematic Full-Screen Hero Section */}
      <section className="relative w-full h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        
        {/* Background Image with optimized sizes and native fetchPriority */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            key={heroPhoto.url}
            src={heroPhoto.url}
            alt={heroPhoto.title}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1920px) 100vw, 1920px"
            unoptimized
            className="object-cover scale-105 filter brightness-90 contrast-110 transition-transform duration-1000 ease-out hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />
        </div>

        {/* Top Minimal Branding */}
        <div className="relative z-20 w-full flex justify-between items-center pt-2 font-mono text-[11px] tracking-[0.25em] uppercase text-white/60">
          <span>Sardor Sunatullayev</span>
          <span>{heroPhoto.location}</span>
        </div>

        {/* Hero Content & Action Bar */}
        <div className="relative z-20 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-6">
          
          {/* Left Side: Clean Title & Minimal Description */}
          <div className="flex flex-col gap-4 max-w-xl w-full">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light uppercase tracking-tight text-white font-serif">
              {heroPhoto.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 font-mono tracking-wider max-w-md leading-relaxed">
              {heroPhoto.description}
            </p>
          </div>

          {/* Right Side: Clean Action Button */}
          <div className="flex flex-col items-center sm:items-end shrink-0 w-full sm:w-auto">
            <Link
              href="/photos"
              className="group inline-flex items-center justify-center gap-4 px-8 py-4 rounded-xl bg-(--accent) text-(--bg) font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-transform duration-300 w-full sm:w-auto"
            >
              <span>Enter Gallery</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
}