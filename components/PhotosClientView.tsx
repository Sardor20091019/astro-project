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
  LayoutGrid,
  Columns,
  Eye,
  Share2,
  Check,
  Command,
  Play,
  Pause,
  Download,
  ArrowUp,
  Compass,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";

interface PhotosClientViewProps {
  initialPhotos: any[];
  categories: { label: string; value: string }[];
  sortOptions: { label: string; value: string }[];
}

// Optimized Memoized Photo Card Component
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
  const cam = photo.camera?.trim();
  const foc = photo.focalLength?.trim();
  const apt = photo.aperture?.trim();
  const sht = photo.shutter?.trim();
  const isoVal = photo.iso;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-(--surface) hover:border-white/25 transition-all duration-500 flex flex-col text-left shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:-translate-y-1.5"
    >
      <div 
        className="relative aspect-4/3 w-full overflow-hidden bg-(--surface-2) cursor-pointer"
        onDoubleClick={(e) => onToggleFavorite(photo.id, e)}
        title="Double-click to save/favorite"
      >
        <Link
          href={`/photos/${photo.id}`}
          className="absolute inset-0 z-25 block focus-visible:outline-none"
          aria-label={`View details for ${photo.title}`}
        >
          <span className="sr-only">View {photo.title}</span>
        </Link>

        <Image
          src={photo.url}
          alt={photo.title || "Cinematic Photography Archive Item"}
          fill
          priority={index < 3}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

        {/* Category Tag Sticker */}
        <div className="absolute left-4 top-4 z-30 pointer-events-none flex items-center justify-center max-w-[60%]">
          <span className="inline-flex items-center justify-center bg-black/50 backdrop-blur-xl border border-white/20 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.2em] text-white/90 truncate shadow-lg">
            {photo.category ? photo.category.toLowerCase() : "other"}
          </span>
        </div>

        {/* Action Buttons Right Side */}
        <div className="absolute right-4 top-4 z-30 flex items-center justify-center gap-2">
          <button
            onClick={(e) => onDownload(photo, e)}
            title="Download Original"
            aria-label={`Download original file for ${photo.title}`}
            className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white/90 hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all duration-300 cursor-pointer shadow-xl inline-flex items-center justify-center"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={(e) => onShare(photo, e)}
            title={isCopied ? "Link copied!" : "Share photo"}
            aria-label={`Share ${photo.title}`}
            className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white/90 hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all duration-300 cursor-pointer shadow-xl inline-flex items-center justify-center"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={(e) => onToggleFavorite(photo.id, e)}
            title={isFavorited ? "Remove from saved" : "Save to favorites"}
            aria-label={isFavorited ? "Remove from saved favorites" : "Save to favorites"}
            className={`p-2.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 cursor-pointer shadow-xl inline-flex items-center justify-center ${
              isFavorited
                ? "bg-rose-500 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                : "bg-black/60 border-white/20 text-white/90 hover:bg-rose-500 hover:border-rose-500"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-white" : ""}`} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenLightbox(photo.id);
            }}
            title="Quick Preview"
            aria-label={`Quick preview lightbox for ${photo.title}`}
            className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white/90 hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer shadow-xl inline-flex items-center justify-center"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-grow justify-between bg-(--surface)">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-(--accent) truncate font-medium">
              {photo.location || "Location N/A"}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-(--text-dim) truncate font-medium">
              {photo.authorName || "Artist"}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold tracking-tight text-(--text) group-hover:text-(--accent) transition-colors line-clamp-1">
            {photo.title}
          </h3>

          {/* Structured EXIF Badges */}
          {(cam || foc || apt || sht || isoVal) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {cam && (
                <button
                  onClick={(e) => onCopyExif(cam, e)}
                  title="Click to copy camera model"
                  aria-label={`Copy camera model: ${cam}`}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-(--surface-2) border border-white/10 font-mono text-[9px] text-(--text) hover:border-(--accent) hover:bg-(--surface-3) transition-all cursor-pointer"
                >
                  <Camera className="w-3 h-3 text-(--accent) shrink-0" />
                  <span className="truncate max-w-[120px]">{cam}</span>
                  {copiedExifText === cam && <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />}
                </button>
              )}
              {foc && (
                <button
                  onClick={(e) => onCopyExif(foc, e)}
                  title="Click to copy focal length"
                  aria-label={`Copy focal length: ${foc}`}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-(--surface-2) border border-white/10 font-mono text-[9px] text-(--text) hover:border-(--accent) hover:bg-(--surface-3) transition-all cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3 text-(--accent) shrink-0" />
                  <span>{foc}</span>
                  {copiedExifText === foc && <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />}
                </button>
              )}
              {apt && (
                <button
                  onClick={(e) => onCopyExif(apt, e)}
                  title="Click to copy aperture"
                  aria-label={`Copy aperture: ${apt}`}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-(--surface-2) border border-white/10 font-mono text-[9px] text-(--text) hover:border-(--accent) hover:bg-(--surface-3) transition-all cursor-pointer"
                >
                  <Aperture className="w-3 h-3 text-(--accent) shrink-0" />
                  <span>{apt}</span>
                  {copiedExifText === apt && <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />}
                </button>
              )}
              {sht && (
                <button
                  onClick={(e) => onCopyExif(sht, e)}
                  title="Click to copy shutter speed"
                  aria-label={`Copy shutter speed: ${sht}`}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-(--surface-2) border border-white/10 font-mono text-[9px] text-(--text) hover:border-(--accent) hover:bg-(--surface-3) transition-all cursor-pointer"
                >
                  <Clock className="w-3 h-3 text-(--accent) shrink-0" />
                  <span>{sht}</span>
                  {copiedExifText === sht && <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />}
                </button>
              )}
              {isoVal && (
                <button
                  onClick={(e) => onCopyExif(String(isoVal), e)}
                  title="Click to copy ISO"
                  aria-label={`Copy ISO: ${isoVal}`}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-(--surface-2) border border-white/10 font-mono text-[9px] text-(--text) hover:border-(--accent) hover:bg-(--surface-3) transition-all cursor-pointer"
                >
                  <span className="text-(--accent) font-bold text-[8px]">ISO</span>
                  <span>{isoVal}</span>
                  {copiedExifText === String(isoVal) && <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 pt-4 border-t border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-(--text-dim)">
          <span className="inline-flex items-center justify-center gap-1.5 border-r border-white/10 pr-2">
            <Heart className="h-3 w-3 text-rose-500" />
            {photo.likeCount ?? 0}
          </span>
          <span className="inline-flex items-center justify-center gap-1.5 border-r border-white/10 px-2">
            <Star className="h-3 w-3 text-amber-400" />
            {photo.avgRating.toFixed(1)}
          </span>
          <span className="inline-flex items-center justify-center gap-1.5 pl-2">
            <MessageCircle className="h-3 w-3 text-sky-400" />
            {photo.commentCount ?? 0}
          </span>
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

  // Local state for interactive controls & layout preferences
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeSort, setActiveSort] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridColumns, setGridColumns] = useState<3 | 2>(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  
  // Favorites & Toast state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedExifText, setCopiedExifText] = useState<string | null>(null);
  
  // Lightbox & Slideshow state
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);

  const itemsPerPage = gridColumns === 3 ? 9 : 6;
  const currentSortLabel = sortOptions.find((opt) => opt.value === activeSort)?.label || "Sort";

  // Load preferences on mount & scroll listener[cite: 1]
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("astrospectrum_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedGrid = localStorage.getItem("astrospectrum_grid");
      if (storedGrid === "2" || storedGrid === "3") {
        setGridColumns(Number(storedGrid) as 3 | 2);
      }
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

  // Timeline Scrubbing Logic with instant ref tracking[cite: 1]
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

  const handleGridChange = (cols: 3 | 2) => {
    setGridColumns(cols);
    try {
      localStorage.setItem("astrospectrum_grid", cols.toString());
    } catch (e) {
      console.error("Failed to save grid preference", e);
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

  // Global Keyboard Shortcuts[cite: 1]
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

  // Filter & Sort computation[cite: 1]
  const filteredPhotos = useMemo(() => {
    let result = [...initialPhotos];

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
        return (b.avgRating || 0) - (a.avgRating || 0);
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
  }, [initialPhotos, activeCategory, activeSort, searchQuery, showFavoritesOnly, favorites]);

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

  // Slideshow interval timer[cite: 1]
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
      
      {/* Hide default browser scrollbars[cite: 1] */}
      <style jsx global>{`
        html {
          scrollbar-width: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header Bar[cite: 1] */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-(--bg)/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.25em] text-(--text-dim) hover:text-(--text) transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--text-dim) hidden sm:inline">
            AstroSpectrum // Archive
          </span>
        </div>
      </header>

      {/* High-Density Cinematic Timeline Scrubber (150 Ticks, 50vh, Hold & Drag to Scroll)[cite: 1] */}
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
                  ? "w-5 h-[1.5px] bg-white/60"
                  : isSemiMajor
                  ? "w-3.5 h-[1.2px] bg-white/35"
                  : "w-2 h-[1px] bg-white/15"
              }`}
            />
          );
        })}
      </aside>

      {/* Bottom-Left Keyboard Shortcuts Helper[cite: 1] */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:flex flex-col gap-2.5 bg-(--surface)/90 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] font-mono text-[10px]">
        <div className="flex items-center justify-between gap-6 pb-2 border-b border-white/10 text-(--text-muted) uppercase tracking-[0.2em]">
          <span>Shortcuts</span>
          <Command className="h-3.5 w-3.5 text-(--accent)" />
        </div>
        <div className="flex flex-col gap-2 text-(--text-dim)">
          <div className="flex items-center justify-between gap-6">
            <span>Search</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-(--surface-2) border border-white/10 text-(--text)">/</kbd>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span>Close / Reset</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-(--surface-2) border border-white/10 text-(--text)">Esc</kbd>
          </div>
        </div>
      </div>

      {/* Main Content Container[cite: 1] */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col items-center text-center gap-10">
        
        {/* Title Section[cite: 1] */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-(--text)">
            Gallery Archive
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-(--text-muted)">
            Cinematic photography collection & catalog
          </p>
        </div>

        {/* Unified Search, Filters & Controls Deck[cite: 1] */}
        <div className="w-full flex flex-col gap-5 bg-(--surface)/90 border border-white/10 p-5 sm:p-6 rounded-3xl backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-30">
          
          {/* Top Row[cite: 1] */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            
            {/* Search Input[cite: 1] */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-dim)" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search images, locations, or cameras..."
                aria-label="Search photography collection"
                className="w-full bg-(--surface-2) border border-white/10 rounded-2xl pl-11 pr-11 py-3 font-mono text-[11px] text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent) transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-(--text-dim) hover:text-(--text) transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Right Side Controls[cite: 1] */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
              
              {/* Grid Density Toggle[cite: 1] */}
              <div className="hidden sm:flex items-center justify-center bg-(--surface-2) border border-white/10 p-1 rounded-2xl">
                <button
                  onClick={() => handleGridChange(3)}
                  title="3-Column Grid"
                  aria-label="Switch to 3 column grid layout"
                  className={`p-2 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center ${
                    gridColumns === 3 ? "bg-(--accent) text-(--bg) shadow-md" : "text-(--text-dim) hover:text-(--text)"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleGridChange(2)}
                  title="2-Column Large View"
                  aria-label="Switch to 2 column large view layout"
                  className={`p-2 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center ${
                    gridColumns === 2 ? "bg-(--accent) text-(--bg) shadow-md" : "text-(--text-dim) hover:text-(--text)"
                  }`}
                >
                  <Columns className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Dropdown[cite: 1] */}
              <div className="relative flex-1 sm:flex-initial">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  aria-expanded={isSortOpen}
                  aria-label="Sort options menu"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-(--surface-2) border border-white/10 px-4 py-3 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] text-(--text) font-bold hover:bg-(--surface-3) transition-all cursor-pointer shadow-sm"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-(--accent)" />
                  <span className="truncate max-w-[130px]">{currentSortLabel}</span>
                  <ChevronDown className={`h-3 w-3 text-(--text-dim) transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-2.5 w-52 rounded-2xl bg-(--surface) border border-white/15 p-2 shadow-2xl z-50 backdrop-blur-2xl"
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
                              aria-selected={isSelected}
                              className={`w-full text-left px-3.5 py-3 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer inline-flex items-center ${
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

              {/* Submit Image Button[cite: 1] */}
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-(--text) text-(--bg) font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-(--accent) hover:text-(--bg) transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Submit Image</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Categories & Saved Filter[cite: 1] */}
          <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-start flex-wrap gap-2.5 w-full overflow-x-auto scrollbar-none pb-1">
                
                <button
                  onClick={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    setCurrentPage(1);
                  }}
                  aria-pressed={showFavoritesOnly}
                  className={`px-4 py-2.5 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap border cursor-pointer inline-flex items-center justify-center gap-2 ${
                    showFavoritesOnly
                      ? "bg-rose-500 text-white border-rose-500 font-bold shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                      : "bg-(--surface-2) text-(--text-dim) border-white/10 hover:bg-(--surface-3) hover:text-(--text)"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${showFavoritesOnly ? "fill-white text-white" : ""}`} />
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
                      aria-pressed={isActive}
                      className={`px-4 py-2.5 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap border cursor-pointer inline-flex items-center justify-center ${
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

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted) whitespace-nowrap shrink-0 hidden lg:block">
                Showing {filteredPhotos.length} {filteredPhotos.length === 1 ? "image" : "images"}
              </span>
            </div>
          </div>

        </div>

        {/* Photo Display Area[cite: 1] */}
        {filteredPhotos.length === 0 ? (
          <div className="w-full max-w-lg border border-dashed border-white/20 rounded-3xl py-20 px-8 text-center flex flex-col items-center justify-center gap-5 bg-(--surface)/80 backdrop-blur-xl mt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
              No images found matching your criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 rounded-2xl bg-(--surface-2) hover:bg-(--surface-3) text-(--text) font-mono text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer border border-white/10 inline-flex items-center justify-center shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 sm:gap-8 w-full max-w-7xl mt-4 ${
              gridColumns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
            }`}>
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

            {/* Pagination Controls[cite: 1] */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12 mb-6">
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
          </>
        )}

      </main>

      {/* Scroll to Top Floating Button[cite: 1] */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top of page"
            className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-(--surface)/90 border border-white/15 text-(--text) shadow-2xl hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all cursor-pointer backdrop-blur-2xl"
            title="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Lightbox / Immersive Quick Preview Modal[cite: 1] */}
      <AnimatePresence>
        {lightboxPhotoId && activeLightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Immersive Photo Lightbox Preview"
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
              {/* Lightbox Header Bar[cite: 1] */}
              <div className="w-full flex items-center justify-between px-6 py-4.5 border-b border-white/10 bg-(--surface-2)">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--accent)">
                    {activeLightboxPhoto.category || "Photo"} // {lightboxIndex + 1} of {filteredPhotos.length}
                  </span>
                  <span className="text-(--text-dim)">•</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted) truncate max-w-[200px] sm:max-w-md">
                    {activeLightboxPhoto.title}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                    title={isSlideshowPlaying ? "Pause Slideshow" : "Play Slideshow"}
                    aria-label={isSlideshowPlaying ? "Pause slideshow" : "Play slideshow"}
                    className={`px-3.5 py-2 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] border transition-all cursor-pointer inline-flex items-center gap-2 ${
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
                    aria-label="Close lightbox modal"
                    className="p-2.5 rounded-xl bg-(--surface) border border-white/10 text-(--text) hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lightbox Image Viewport[cite: 1] */}
              <div className="relative w-full h-[55vh] sm:h-[68vh] bg-black flex items-center justify-center overflow-hidden">
                <Image
                  src={activeLightboxPhoto.url}
                  alt={activeLightboxPhoto.title || "Lightbox preview item"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />

                {/* Left/Right Navigation Arrows[cite: 1] */}
                {lightboxIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxPhotoId(filteredPhotos[lightboxIndex - 1].id);
                    }}
                    aria-label="Previous photo"
                    className="absolute left-5 p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white hover:bg-(--accent) hover:text-(--bg) transition-all cursor-pointer shadow-2xl"
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
                    className="absolute right-5 p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white hover:bg-(--accent) hover:text-(--bg) transition-all cursor-pointer shadow-2xl"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Lightbox Footer Details[cite: 1] */}
              <div className="w-full p-6 sm:p-7 bg-(--surface) flex flex-col sm:flex-row items-center justify-between gap-5 border-t border-white/10">
                <div className="flex flex-col items-start gap-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-(--text)">
                    {activeLightboxPhoto.title}
                  </h3>
                  <p className="font-mono text-[11px] text-(--text-dim) uppercase tracking-[0.15em]">
                    {activeLightboxPhoto.location || "Location N/A"} • By {activeLightboxPhoto.authorName || "Artist"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleDownload(activeLightboxPhoto, e)}
                    className="px-4.5 py-2.5 rounded-2xl bg-(--surface-2) border border-white/10 hover:border-(--accent) font-mono text-[10px] uppercase tracking-[0.2em] text-(--text) transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-(--accent)" />
                    <span>Download Original</span>
                  </button>

                  <button
                    onClick={(e) => toggleFavorite(activeLightboxPhoto.id, e)}
                    className={`px-4.5 py-2.5 rounded-2xl border font-mono text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm ${
                      favorites.includes(activeLightboxPhoto.id)
                        ? "bg-rose-500 border-rose-500 text-white font-bold shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                        : "bg-(--surface-2) border-white/10 text-(--text) hover:border-rose-500"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${favorites.includes(activeLightboxPhoto.id) ? "fill-white" : ""}`} />
                    <span>{favorites.includes(activeLightboxPhoto.id) ? "Saved" : "Save"}</span>
                  </button>

                  <Link
                    href={`/photos/${activeLightboxPhoto.id}`}
                    className="px-5 py-2.5 rounded-2xl bg-(--text) text-(--bg) font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-(--accent) transition-all cursor-pointer inline-flex items-center gap-2 shadow-md"
                  >
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Photo Modal[cite: 1] */}
      <SubmitPhotoModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />

    </div>
  );
}