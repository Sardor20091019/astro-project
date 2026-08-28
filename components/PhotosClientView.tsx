/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo, useEffect, useRef, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Heart, 
  Star, 
  MessageCircle, 
  Plus, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Aperture, 
  Clock, 
  Maximize2,
  Search,
  X,
  Eye,
  Share2,
  Check,
  Command,
  Play,
  Pause,
  Download,
  ArrowUp,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";

interface PhotosClientViewProps {
  initialPhotos: any[];
  categories: { label: string; value: string }[];
  sortOptions: { label: string; value: string }[];
}

interface PhotoCardProps {
  photo: any;
  index: number;
  isFavorited: boolean;
  isCopied: boolean;
  copiedExifText: string | null;
  onToggleFavorite: (photoId: string, e?: React.MouseEvent) => void;
  onShare: (photo: any, e?: React.MouseEvent) => void;
  onDownload: (photo: any, e: React.MouseEvent) => void;
  onCopyExif: (text: string, e: React.MouseEvent) => void;
  onOpenLightbox: (photoId: string) => void;
}

const PhotoCard = memo(function PhotoCard({
  photo,
  index,
  isFavorited,
  isCopied,
  copiedExifText,
  onToggleFavorite,
  onShare,
  onDownload,
  onCopyExif,
  onOpenLightbox,
}: PhotoCardProps) {
  const router = useRouter();
  const cam = photo.camera?.trim();
  const foc = photo.focalLength?.trim();
  const apt = photo.aperture?.trim();
  const sht = photo.shutter?.trim();
  const isoVal = photo.iso;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 10) * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="break-inside-avoid mb-4 relative group rounded-2xl overflow-hidden bg-(--surface) border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] text-left cursor-pointer"
      onClick={() => router.push(`/photos/${photo.id}`)}
    >
      {/* Dynamic Native Aspect Ratio Image Container */}
      <div className="relative w-full overflow-hidden bg-(--surface-2)">
        <img
          src={photo.url}
          alt={photo.title || "Cinematic Photography Archive Item"}
          className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-105"
          loading={index < 4 ? "eager" : "lazy"}
        />

        {/* Hover Overlay containing all metadata and quick actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 sm:p-5 text-white">
          
          {/* Top row in overlay: Author & Favorite button */}
          <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-mono text-[10px] text-white font-bold">
                {(photo.authorName || "A").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white font-bold truncate max-w-[120px]">
                  {photo.authorName || "Artist"}
                </span>
                <span className="font-mono text-[8px] text-white/70 uppercase tracking-[0.15em] truncate max-w-[120px]">
                  {photo.location || "Archive"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => onToggleFavorite(photo.id, e)}
                title={isFavorited ? "Remove from saved" : "Save to favorites"}
                aria-label="Save to favorites"
                className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                  isFavorited
                    ? "bg-rose-500 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                    : "bg-black/40 border-white/20 text-white hover:border-rose-500"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-white" : ""}`} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(photo.id);
                }}
                title="Quick Preview"
                aria-label="Quick Preview"
                className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:border-(--accent) transition-all cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom row in overlay: Title, category & EXIF data */}
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white line-clamp-1 drop-shadow-md">
                {photo.title || "Untitled Capture"}
              </h3>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white/90 whitespace-nowrap">
                {photo.category ? photo.category.toLowerCase() : "photo"}
              </span>
            </div>

            {(cam || foc || apt || sht || isoVal) && (
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                {cam && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[8px] text-white/80">
                    <Camera className="w-2.5 h-2.5 text-(--accent)" />
                    <span className="truncate max-w-[90px]">{cam}</span>
                  </span>
                )}
                {foc && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[8px] text-white/80">
                    <span>{foc}</span>
                  </span>
                )}
                {apt && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[8px] text-white/80">
                    <Aperture className="w-2.5 h-2.5 text-(--accent)" />
                    <span>{apt}</span>
                  </span>
                )}
                {sht && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[8px] text-white/80">
                    <Clock className="w-2.5 h-2.5 text-(--accent)" />
                    <span>{sht}</span>
                  </span>
                )}
                {isoVal && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[8px] text-white/80">
                    <span className="text-(--accent) font-bold">ISO</span>
                    <span>{isoVal}</span>
                  </span>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.article>
  );
});

export default function PhotosClientView({
  initialPhotos,
  categories,
  sortOptions,
}: PhotosClientViewProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeSort, setActiveSort] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedExifText, setCopiedExifText] = useState<string | null>(null);
  
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);

  const itemsPerPage = 16; // Increased to showcase multiple items neatly in grid/masonry
  const currentSortLabel = sortOptions.find((opt) => opt.value === activeSort)?.label || "Sort";

  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("astrospectrum_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    } catch (e) {
      console.error("Failed to load local storage preferences", e);
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
      setShowScrollTop(window.scrollY > 400);
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

  const toggleFavorite = (photoId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setFavorites((prev) => {
      const updated = prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId];
      
      try {
        localStorage.setItem("astrospectrum_favorites", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save favorites", err);
      }
      return updated;
    });
  };

  const handleCopyExif = (text: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedExifText(text);
    setTimeout(() => setCopiedExifText(null), 2000);
  };

  const handleDownload = async (photo: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${photo.title ? photo.title.toLowerCase().replace(/\s+/g, '-') : 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(photo.url, "_blank");
    }
  };

  const handleShare = async (photo: any, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const url = `${window.location.origin}/photos/${photo.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: `Check out "${photo.title}" on AstroSpectrum Photography Archive`,
          url: url,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed", err);
        } else {
          return;
        }
      }
    }

    navigator.clipboard.writeText(url);
    setCopiedId(photo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
  }, [lightboxPhotoId]);

  const filteredPhotos = (() => {
    let result = Array.isArray(initialPhotos) ? initialPhotos.map(p => ({
      ...p,
      url: p.url ? p.url.replace(/([a-z0-9]+)\.ufs\.sh/g, 'utfs.io') : p.url
    })) : [];

    if (showFavoritesOnly) {
      result = result.filter((p) => favorites.includes(p.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.authorName?.toLowerCase().includes(q) ||
          p.camera?.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "ALL") {
      result = result.filter((p) => p.category?.toUpperCase() === activeCategory.toUpperCase());
    }

    result.sort((a, b) => {
      if (activeSort === "latest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (activeSort === "earliest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (activeSort === "popular" || activeSort === "likes") {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      if (activeSort === "rating") {
        return (b.avgRating || b.ratingAverage || 0) - (a.avgRating || a.ratingAverage || 0);
      }
      if (activeSort === "views") {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (activeSort === "comments") {
        return (b.commentCount || 0) - (a.commentCount || 0);
      }
      return 0;
    });

    return result;
  })();

  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage) || 1;
  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPhotos.slice(start, start + itemsPerPage);
  }, [filteredPhotos, currentPage, itemsPerPage]);

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

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setActiveCategory("ALL");
    setActiveSort("latest");
    setSearchQuery("");
    setShowFavoritesOnly(false);
    setCurrentPage(1);
  };

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

      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-(--bg)/80 backdrop-blur-2xl">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.25em] text-(--text-dim) hover:text-(--text) transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--text-dim)">
            AstroSpectrum // Multi-Column Cinematic Stream
          </span>
        </div>
      </header>

      <aside
        ref={timelineRef}
        aria-label="Page scroll position scrubber"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end justify-between h-[50vh] py-2 px-3 cursor-ns-resize touch-none select-none transition-opacity ${
          isDraggingTimeline ? "opacity-100 scale-105" : "opacity-75 hover:opacity-100"
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

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center text-center gap-8">
        
        <div className="flex flex-col gap-2 w-full max-w-4xl">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-(--text)">
            Photography Stream
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--text-muted)">
            Cinematic Multi-Column Gallery • Hover for Details & EXIF
          </p>
        </div>

        {/* Controls and Search Bar */}
        <div className="w-full max-w-4xl flex flex-col gap-4 bg-(--surface)/90 border border-white/10 p-5 rounded-3xl backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-30">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-dim)" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search stream..."
              aria-label="Search photography stream"
              className="w-full bg-(--surface-2) border border-white/10 rounded-2xl pl-11 pr-11 py-3 font-mono text-[11px] text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent) transition-all shadow-inner"
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

          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-expanded={isSortOpen}
                aria-label="Sort options"
                className="w-full flex items-center justify-center gap-2 bg-(--surface-2) border border-white/10 px-4 py-3 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] text-(--text) font-bold hover:bg-(--surface-3) transition-all cursor-pointer shadow-sm"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-(--accent)" />
                <span className="truncate">{currentSortLabel}</span>
                <ChevronDown className={`h-3 w-3 text-(--text-dim) transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-2 w-full rounded-2xl bg-(--surface) border border-white/15 p-1.5 shadow-2xl z-50 backdrop-blur-2xl"
                  >
                    <div className="flex flex-col gap-1">
                      {sortOptions.map((opt) => {
                        const isSelected = activeSort === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setActiveSort(opt.value);
                              setCurrentPage(1);
                              setIsSortOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer ${
                              isSelected
                                ? "bg-(--accent) text-(--bg) font-bold shadow-md"
                                : "text-(--text-dim) hover:bg-(--surface-2) hover:text-(--text)"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-(--text) text-(--bg) font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-(--accent) transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Photo</span>
            </button>
          </div>

          <div className="flex items-center justify-start flex-wrap gap-2 pt-2 border-t border-white/10 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap border cursor-pointer inline-flex items-center gap-1.5 ${
                showFavoritesOnly
                  ? "bg-rose-500 text-white border-rose-500 font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  : "bg-(--surface-2) text-(--text-dim) border-white/10 hover:bg-(--surface-3) hover:text-(--text)"
              }`}
            >
              <Heart className={`h-3 w-3 ${showFavoritesOnly ? "fill-white text-white" : ""}`} />
              <span>Saved ({favorites.length})</span>
            </button>

            {categories.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setActiveCategory(cat.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap border cursor-pointer inline-flex items-center ${
                    isActive
                      ? "bg-(--accent) text-(--bg) border-(--accent) font-bold shadow-md"
                      : "bg-(--surface-2) text-(--text-dim) border-white/10 hover:bg-(--surface-3) hover:text-(--text)"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="w-full max-w-4xl border border-dashed border-white/20 rounded-3xl py-16 px-6 text-center flex flex-col items-center justify-center gap-4 bg-(--surface)/80 backdrop-blur-xl mt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
              No photos found.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-(--surface-2) hover:bg-(--surface-3) text-(--text) font-mono text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer border border-white/10 shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="w-full mt-4">
            {/* Multi-column masonry layout (4 to 5 photos per line on wide screens) */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {paginatedPhotos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  isFavorited={favorites.includes(photo.id)}
                  isCopied={copiedId === photo.id}
                  copiedExifText={copiedExifText}
                  onToggleFavorite={toggleFavorite}
                  onShare={handleShare}
                  onDownload={handleDownload}
                  onCopyExif={handleCopyExif}
                  onOpenLightbox={(id) => setLightboxPhotoId(id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 my-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="p-3 rounded-2xl bg-(--surface) border border-white/10 text-(--text) disabled:opacity-30 disabled:cursor-not-allowed hover:bg-(--surface-2) transition-all cursor-pointer shadow-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-2 px-4 py-3 bg-(--surface) border border-white/10 rounded-2xl font-mono text-xs shadow-md">
                  <span className="text-(--accent) font-bold">{currentPage}</span>
                  <span className="text-(--text-dim)">/</span>
                  <span className="text-(--text-muted)">{totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="p-3 rounded-2xl bg-(--surface) border border-white/10 text-(--text) disabled:opacity-30 disabled:cursor-not-allowed hover:bg-(--surface-2) transition-all cursor-pointer shadow-md"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-(--surface)/90 border border-white/15 text-(--text) shadow-2xl hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all cursor-pointer backdrop-blur-2xl"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
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