/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo, useEffect, useRef, memo, useCallback, useDeferredValue } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Heart, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Aperture, 
  Clock, 
  Maximize2,
  Search,
  X,
  Play,
  Pause,
  ArrowUp,
  ShieldAlert,
  SlidersHorizontal,
  Check,
  LayoutGrid,
  Grid3X3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";
import { getApprovedPhotos } from "@/lib/api/photos";

interface PhotosClientViewProps {
  initialPhotos: any[];
  initialCursor?: string | null;
  initialSeed?: number;
  categories: { label: string; value: string }[];
}

interface PhotoCardProps {
  photo: any;
  index: number;
  isFavorited: boolean;
  onToggleFavorite: (photoId: string, e?: React.MouseEvent) => void;
  onOpenLightbox: (photoId: string) => void;
  ageVerified: boolean;
  onRequireAgeVerification: () => void;
  layoutMode: "large" | "compact";
}

const PhotoCard = memo(function PhotoCard({
  photo,
  index,
  isFavorited,
  onToggleFavorite,
  onOpenLightbox,
  ageVerified,
  onRequireAgeVerification,
  layoutMode,
}: PhotoCardProps) {
  const router = useRouter();
  const [nsfwRevealed, setNsfwRevealed] = useState(false);
  const cam = photo.camera?.trim();
  const foc = photo.focalLength?.trim();
  const apt = photo.aperture?.trim();
  const sht = photo.shutter?.trim();
  const isoVal = photo.iso;

  const isNsfw = photo.isNsfw;
  const showBlur = isNsfw && (!ageVerified || !nsfwRevealed);

  const isOptimizable =
    photo.url &&
    (photo.url.startsWith("/") ||
      photo.url.includes("utfs.io") ||
      photo.url.includes("ufs.sh") ||
      photo.url.includes("googleusercontent.com") ||
      photo.url.includes("uploadthing.com") ||
      photo.url.includes("placehold.co"));

  return (
    <article 
      className={`photo-card-optimized break-inside-avoid ${layoutMode === "compact" ? "mb-6 sm:mb-8" : "mb-16 sm:mb-24"} relative group rounded-3xl overflow-hidden bg-(--surface) border border-white/10 shadow-xl hover:shadow-2xl hover:border-white/25 transition-transform duration-300 text-left cursor-pointer`}
      onClick={() => {
        if (showBlur) return;
        router.push(`/photos/${photo.id}`);
      }}
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-(--surface-2)">
        {isOptimizable ? (
          <Image
            src={photo.url}
            alt={photo.title || "Gallery Item"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
            loading={index < 4 ? "eager" : "lazy"}
            priority={index < 2}
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              showBlur ? "blur-2xl scale-110 select-none" : ""
            }`}
          />
        ) : (
          <img
            src={photo.url}
            alt={photo.title || "Gallery Item"}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            className={`w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105 ${
              showBlur ? "blur-2xl scale-110 select-none" : ""
            }`}
          />
        )}

        {showBlur && (
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-20 gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <ShieldAlert className="w-9 h-9 text-rose-500 animate-pulse" />
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-widest text-white font-bold">Mature Content (18+)</span>
              <span className="font-mono text-[10px] text-zinc-400">This capture contains sensitive or artistic nudity.</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!ageVerified) {
                  onRequireAgeVerification();
                } else {
                  setNsfwRevealed(true);
                }
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-white text-black font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
            >
              Show Photo
            </button>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 sm:p-6 text-white pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto">
          
          <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-mono text-[10px] sm:text-[11px] text-white font-bold">
                {(photo.authorName || "A").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-white font-bold truncate max-w-[120px]">
                  {photo.authorName || "Artist"}
                </span>
                <span className="font-mono text-[7px] sm:text-[8px] text-white/70 uppercase tracking-[0.15em] truncate max-w-[120px]">
                  {photo.location || "Archive"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={(e) => onToggleFavorite(photo.id, e)}
                title={isFavorited ? "Remove from saved" : "Save to favorites"}
                aria-label="Save to favorites"
                className={`p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border transition-all cursor-pointer ${
                  isFavorited
                    ? "bg-rose-500 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                    : "bg-black/40 border-white/20 text-white hover:border-rose-500"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorited ? "fill-white" : ""}`} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(photo.id);
                }}
                title="Quick Preview"
                aria-label="Quick Preview"
                className="p-2 sm:p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:border-(--accent) transition-all cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 drop-shadow-md">
              {photo.title || "Untitled Capture"}
            </h3>

            {layoutMode === "large" && (cam || foc || apt || sht || isoVal) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {cam && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[9px] text-white/80">
                    <Camera className="w-3 h-3 text-(--accent)" />
                    <span className="truncate max-w-[110px]">{cam}</span>
                  </span>
                )}
                {foc && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg glass-pill font-mono text-[9px] text-white/90">
                    <span>{foc}</span>
                  </span>
                )}
                {apt && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg glass-pill font-mono text-[9px] text-white/90">
                    <Aperture className="w-3 h-3 text-(--accent)" />
                    <span>{apt}</span>
                  </span>
                )}
                {sht && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg glass-pill font-mono text-[9px] text-white/90">
                    <Clock className="w-3 h-3 text-(--accent)" />
                    <span>{sht}</span>
                  </span>
                )}
                {isoVal && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg glass-pill font-mono text-[9px] text-white/90">
                    <span className="text-(--accent) font-bold">ISO</span>
                    <span>{isoVal}</span>
                  </span>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </article>
  );
});

const TimelineScrubber = memo(function TimelineScrubber() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);

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
    setIsDragging(true);
    updateScrollFromClientY(e.clientY);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updateScrollFromClientY(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <aside
      ref={timelineRef}
      aria-label="Page scroll position scrubber"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end justify-between h-[50vh] py-2 px-3 cursor-ns-resize touch-none select-none transition-opacity ${
        isDragging ? "opacity-100 scale-105" : "opacity-75 hover:opacity-100"
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
                ? "w-8 h-[2.5px] bg-(--accent) shadow-[0_0_15px_var(--accent)] scale-125" 
                : isMajor
                ? "w-5 h-[1.5px] bg-[var(--text)]/60"
                : isSemiMajor
                ? "w-3.5 h-[1.2px] bg-[var(--text)]/35"
                : "w-2 h-[1px] bg-[var(--text)]/15"
            }`}
          />
        );
      })}
    </aside>
  );
});

const ScrollToTopButton = memo(function ScrollToTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const visible = window.scrollY > 400;
          setShowScrollTop(prev => (prev !== visible ? visible : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl glass-panel text-(--text) hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

const normalizePhotoUrl = (p: any) => ({
  ...p,
  url: p?.url ? p.url.replace(/([a-z0-9]+)\.ufs\.sh/g, "utfs.io") : p?.url,
});

export default function PhotosClientView({
  initialPhotos = [],
  initialCursor = null,
  initialSeed,
  categories = [],
}: PhotosClientViewProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const [photos, setPhotos] = useState<any[]>(() =>
    Array.isArray(initialPhotos) ? initialPhotos.map(normalizePhotoUrl) : []
  );
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor ?? null);
  const [seed] = useState<number>(() =>
    typeof initialSeed === "number" && !Number.isNaN(initialSeed)
      ? initialSeed
      : Math.floor(Math.random() * 1000000)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"large" | "compact">("large");
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);

  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("astrospectrum_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
      
      const isVerified = localStorage.getItem("astrospectrum_age_verified");
      if (isVerified === "true") setAgeVerified(true);

      const storedLayout = localStorage.getItem("astrospectrum_layout_mode");
      if (storedLayout === "compact" || storedLayout === "large") {
        setLayoutMode(storedLayout);
      }
    } catch (e) {
      console.error(e);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleLayout = useCallback(() => {
    setLayoutMode((prev) => {
      const nextMode = prev === "large" ? "compact" : "large";
      try {
        localStorage.setItem("astrospectrum_layout_mode", nextMode);
      } catch (e) {}
      return nextMode;
    });
  }, []);

  const handleVerifyAge = useCallback(() => {
    setAgeVerified(true);
    setShowAgeModal(false);
    try {
      localStorage.setItem("astrospectrum_age_verified", "true");
    } catch (e) {}
  }, []);

  const handleOpenLightbox = useCallback((id: string) => {
    setLightboxPhotoId(id);
  }, []);

  const handleRequireAgeVerification = useCallback(() => {
    setShowAgeModal(true);
  }, []);

  const toggleFavorite = useCallback((photoId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setFavorites((prev) => {
      const updated = prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId];
      
      try {
        localStorage.setItem("astrospectrum_favorites", JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    if (photos.length === 0 && !isLoadingMore) {
      setIsLoadingMore(true);
      getApprovedPhotos({
        seed,
        limit: 16,
      })
        .then((res) => {
          if (res && Array.isArray(res.photos) && res.photos.length > 0) {
            setPhotos(res.photos.map(normalizePhotoUrl));
            setNextCursor(res.nextCursor ?? null);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingMore(false));
    }
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const res = await getApprovedPhotos({
        cursor: nextCursor,
        seed,
        limit: 16,
        category: selectedCategory || undefined,
      });

      if (res && Array.isArray(res.photos) && res.photos.length > 0) {
        const normalized = res.photos.map(normalizePhotoUrl);
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = normalized.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
        setNextCursor(res.nextCursor ?? null);
      } else {
        setNextCursor(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, seed, selectedCategory]);

  const handleSelectCategory = useCallback(async (catValue: string) => {
    setSelectedCategory(catValue);
    setIsCategoryDropdownOpen(false);
    setIsLoadingMore(true);

    try {
      const res = await getApprovedPhotos({
        cursor: null,
        seed,
        limit: 16,
        category: catValue || undefined,
      });

      if (res && Array.isArray(res.photos)) {
        setPhotos(res.photos.map(normalizePhotoUrl));
        setNextCursor(res.nextCursor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [seed]);

  const handleResetFilters = useCallback(async () => {
    setSearchQuery("");
    setSelectedCategory("");
    setShowFavoritesOnly(false);
    setIsLoadingMore(true);

    try {
      const res = await getApprovedPhotos({
        cursor: null,
        seed,
        limit: 16,
      });

      if (res && Array.isArray(res.photos)) {
        setPhotos(res.photos.map(normalizePhotoUrl));
        setNextCursor(res.nextCursor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [seed]);

  const filteredPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    let result = photos;

    if (showFavoritesOnly) {
      result = result.filter((p) => favoriteSet.has(p.id));
    }

    if (selectedCategory) {
      result = result.filter(
        (p) => p.category === selectedCategory || p.categoryId === selectedCategory
      );
    }

    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.authorName?.toLowerCase().includes(q) ||
          p.camera?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [photos, showFavoritesOnly, selectedCategory, favoriteSet, deferredSearchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === "Escape") {
          (e.target as HTMLInputElement).blur();
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setLightboxPhotoId(null);
        setShowFavoritesOnly(false);
        setIsSlideshowPlaying(false);
        setShowAgeModal(false);
        setIsCategoryDropdownOpen(false);
      }
      if (lightboxPhotoId) {
        if (e.key === "ArrowRight") {
          const idx = filteredPhotos.findIndex((p) => p.id === lightboxPhotoId);
          if (idx < filteredPhotos.length - 1) {
            setLightboxPhotoId(filteredPhotos[idx + 1].id);
          }
        }
        if (e.key === "ArrowLeft") {
          const idx = filteredPhotos.findIndex((p) => p.id === lightboxPhotoId);
          if (idx > 0) {
            setLightboxPhotoId(filteredPhotos[idx - 1].id);
          }
        }
        if (e.key === " ") {
          e.preventDefault();
          setIsSlideshowPlaying((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxPhotoId, filteredPhotos]);

  const lightboxIndex = useMemo(() => {
    if (!lightboxPhotoId) return -1;
    return filteredPhotos.findIndex((p) => p.id === lightboxPhotoId);
  }, [filteredPhotos, lightboxPhotoId]);

  const activeLightboxPhoto = lightboxIndex !== -1 ? filteredPhotos[lightboxIndex] : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSlideshowPlaying && lightboxPhotoId && filteredPhotos.length > 0) {
      interval = setInterval(() => {
        const idx = filteredPhotos.findIndex((p) => p.id === lightboxPhotoId);
        if (idx < filteredPhotos.length - 1) {
          setLightboxPhotoId(filteredPhotos[idx + 1].id);
        } else {
          setLightboxPhotoId(filteredPhotos[0].id);
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSlideshowPlaying, lightboxPhotoId, filteredPhotos]);

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return "All Categories";
    const found = categories.find((c) => c.value === selectedCategory);
    return found ? found.label : "Category";
  }, [selectedCategory, categories]);

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col items-center selection:bg-(--accent) selection:text-(--bg)">
      
      <style jsx global>{`
        html {
          scrollbar-width: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <header className="sticky top-0 z-40 w-full border-b border-(--glass-border) bg-(--glass-nav-bg) backdrop-blur-2xl backdrop-saturate-180">
        <div className="w-full px-6 sm:px-12 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.25em] text-(--text-dim) hover:text-(--text) transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--text-dim) hidden sm:inline">
              Cinematic Archive
            </span>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-(--text) text-(--bg) font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-(--accent) transition-all shadow-xl hover:shadow-[0_0_25px_var(--accent)] cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Photo</span>
            </button>
          </div>
        </div>
      </header>

      <TimelineScrubber />

      <main className="flex-1 w-full max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 flex flex-col items-center text-center gap-12">
        
        <div className="flex flex-col items-center gap-3.5 w-full max-w-4xl">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-(--text)">
            Gallery Archive
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-(--text-dim)">
            cinematic captures and visual stories
          </p>
        </div>

        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center gap-4 glass-panel p-4 rounded-3xl relative z-30">
          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-dim)" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gallery captures, locations, cameras..."
              aria-label="Search gallery"
              className="w-full bg-(--surface-2) border border-white/10 rounded-2xl pl-11 pr-11 py-3.5 font-mono text-[11px] text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent) transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-(--text-dim) hover:text-(--text) transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4.5 py-3.5 rounded-2xl font-mono text-[10px] uppercase tracking-[0.15em] transition-all whitespace-nowrap border cursor-pointer inline-flex items-center justify-center gap-2 flex-1 sm:flex-initial ${
                showFavoritesOnly
                  ? "bg-rose-500 text-white border-rose-500 font-bold shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                  : "bg-(--surface-2) text-(--text-dim) border-white/10 hover:bg-(--surface-3) hover:text-(--text)"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${showFavoritesOnly ? "fill-white text-white" : ""}`} />
              <span>Saved ({favorites.length})</span>
            </button>

            <button
              onClick={handleToggleLayout}
              title={layoutMode === "large" ? "Switch to compact layout (Smaller grid)" : "Switch to large layout (Bigger grid)"}
              aria-label="Toggle grid layout view"
              className="px-4.5 py-3.5 rounded-2xl bg-(--surface-2) border border-white/10 text-(--text-dim) hover:text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer inline-flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]"
            >
              {layoutMode === "large" ? (
                <>
                  <Grid3X3 className="h-4 w-4 text-(--accent)" />
                  <span className="hidden sm:inline">Compact</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4 text-(--accent)" />
                  <span className="hidden sm:inline">Large</span>
                </>
              )}
            </button>

            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                aria-label="Select category"
                className={`px-5 py-3.5 rounded-2xl font-mono text-[10px] uppercase tracking-[0.15em] transition-all whitespace-nowrap border cursor-pointer inline-flex items-center gap-2.5 ${
                  selectedCategory
                    ? "bg-(--text) text-(--bg) border-(--text) font-bold shadow-lg"
                    : "bg-(--surface-2) text-(--text-dim) border-white/10 hover:bg-(--surface-3) hover:text-(--text)"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="max-w-[130px] truncate">{selectedCategoryLabel}</span>
              </button>

              <AnimatePresence>
                {isCategoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-64 glass-dropdown rounded-3xl overflow-hidden z-50 p-2 flex flex-col text-left"
                  >
                    <button
                      onClick={() => handleSelectCategory("")}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                        !selectedCategory
                          ? "bg-white text-black font-bold shadow-md"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <span>All Categories</span>
                      {!selectedCategory && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="h-[1px] bg-zinc-800 my-1.5 mx-2" />

                    <div className="overflow-y-auto space-y-1 pr-1">
                      {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.value;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => handleSelectCategory(cat.value)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white text-black font-bold shadow-md"
                                : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                            }`}
                          >
                            <span className="truncate">{cat.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="w-full max-w-4xl border border-dashed border-white/20 rounded-3xl py-24 px-6 text-center flex flex-col items-center justify-center gap-5 bg-(--surface)/80 backdrop-blur-xl mt-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-(--text-muted)">
              No photos match your filter criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6.5 py-3 rounded-2xl bg-(--surface-2) hover:bg-(--surface-3) text-(--text) font-mono text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer border border-white/10 shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="w-full mt-6 px-2 sm:px-6">
            <div className={`columns-1 ${
              layoutMode === "compact"
                ? "sm:columns-3 lg:columns-4 xl:columns-6 gap-6 sm:gap-8 space-y-10 sm:space-y-14"
                : "sm:columns-2 lg:columns-3 xl:columns-4 gap-8 sm:gap-12 space-y-16 sm:space-y-24"
            }`}>
              {filteredPhotos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  isFavorited={favoriteSet.has(photo.id)}
                  onToggleFavorite={toggleFavorite}
                  onOpenLightbox={handleOpenLightbox}
                  ageVerified={ageVerified}
                  onRequireAgeVerification={handleRequireAgeVerification}
                  layoutMode={layoutMode}
                />
              ))}
            </div>

            <div className="w-full py-16 sm:py-24 flex flex-col items-center justify-center gap-4">
              {nextCursor ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="group relative inline-flex items-center justify-center gap-3.5 px-8 sm:px-10 py-4 rounded-2xl bg-(--surface) border border-white/15 text-(--text) font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold hover:border-(--accent) hover:bg-(--surface-2) hover:shadow-[0_0_35px_rgba(232,66,26,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xl active:scale-[0.98]"
                >
                  {isLoadingMore ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-(--accent) rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-(--accent) group-hover:scale-125 transition-transform shadow-[0_0_8px_var(--accent)]" />
                      <span>Load More Captures</span>
                    </>
                  )}
                </button>
              ) : filteredPhotos.length > 0 ? (
                <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-(--surface-2)/70 border border-white/10 font-mono text-[10px] uppercase tracking-[0.25em] text-(--text-dim)">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  <span>End of Gallery Archive</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

      </main>

      <ScrollToTopButton />

      <AnimatePresence>
        {showAgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative max-w-md w-full bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center text-white shadow-2xl gap-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Age Verification Required</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You must be 18 years or older to view mature and sensitive content in this gallery. Please confirm your age to proceed.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                <button
                  onClick={() => setShowAgeModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono uppercase tracking-widest text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAge}
                  className="flex-1 py-3 px-4 rounded-xl bg-white text-black text-xs font-mono uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                >
                  I am 18 or older
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxPhotoId && activeLightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => {
              setLightboxPhotoId(null);
              setIsSlideshowPlaying(false);
            }}
          >
            <div
              className="relative max-w-6xl w-full max-h-[92vh] flex flex-col items-center bg-(--surface) border border-white/15 rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 bg-(--surface-2)">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--accent)">
                    {lightboxIndex + 1} of {filteredPhotos.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                    aria-label="Slideshow toggle"
                    className={`px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      isSlideshowPlaying
                        ? "bg-(--accent) text-(--bg) border-(--accent) font-bold shadow-md"
                        : "bg-(--surface) text-(--text) border-white/10 hover:bg-(--surface-3)"
                    }`}
                  >
                    {isSlideshowPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    <span>{isSlideshowPlaying ? "Playing" : "Slideshow"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setLightboxPhotoId(null);
                      setIsSlideshowPlaying(false);
                    }}
                    aria-label="Close"
                    className="p-2 rounded-xl bg-(--surface) border border-white/10 text-(--text) hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative w-full h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={activeLightboxPhoto.url}
                  alt={activeLightboxPhoto.title || "Preview"}
                  className="w-full h-full object-contain"
                />

                {lightboxIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxPhotoId(filteredPhotos[lightboxIndex - 1].id);
                    }}
                    aria-label="Previous photo"
                    className="absolute left-4 p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white hover:bg-(--accent) hover:text-(--bg) transition-all cursor-pointer shadow-2xl"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {lightboxIndex < filteredPhotos.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxPhotoId(filteredPhotos[lightboxIndex + 1].id);
                    }}
                    aria-label="Next photo"
                    className="absolute right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white hover:bg-(--accent) hover:text-(--bg) transition-all cursor-pointer shadow-2xl"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="w-full p-6 bg-(--surface) flex items-center justify-between gap-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-(--text) truncate">
                  {activeLightboxPhoto.title}
                </h3>
                <Link
                  href={`/photos/${activeLightboxPhoto.id}`}
                  className="px-5 py-2.5 rounded-xl bg-(--text) text-(--bg) font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-(--accent) transition-all cursor-pointer whitespace-nowrap"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubmitPhotoModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />

    </div>
  );
}