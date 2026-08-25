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
  ArrowUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";

interface PhotosClientViewProps {
  initialPhotos: any[];
  categories: { label: string; value: string }[];
  sortOptions: { label: string; value: string }[];
}

// Optimized Memoized Photo Card Component with Mobile-First Action Visibility
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
      className="group relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface) hover:border-white/20 transition-all duration-300 flex flex-col text-left shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1"
    >
      <div 
        className="relative aspect-4/3 w-full overflow-hidden bg-(--surface-2) cursor-pointer"
        onDoubleClick={(e) => onToggleFavorite(photo.id, e)}
        title="Double-click to save/favorite"
      >
        <Link
          href={`/photos/${photo.id}`}
          className="absolute inset-0 z-20 block focus-visible:outline-none"
        >
          <span className="sr-only">View {photo.title}</span>
        </Link>

        <Image
          src={photo.url}
          alt={photo.title}
          fill
          priority={index < 3}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/25 opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none" />

        {/* Category Tag Sticker */}
        <div className="absolute left-3.5 top-3.5 z-30 pointer-events-none flex items-center justify-center max-w-[55%]">
          <span className="inline-flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/15 px-2.5 sm:px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.18em] text-white/90 truncate">
            {photo.category ? photo.category.toLowerCase() : "other"}
          </span>
        </div>

        {/* Action Buttons Right Side */}
        <div className="absolute right-3.5 top-3.5 z-30 flex items-center justify-center gap-1.5 sm:gap-2">
          <button
            onClick={(e) => onDownload(photo, e)}
            title="Download Original"
            className="p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white/90 hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all cursor-pointer shadow-md inline-flex items-center justify-center"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={(e) => onShare(photo, e)}
            title={isCopied ? "Link copied!" : "Share photo"}
            className="p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white/90 hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all cursor-pointer shadow-md inline-flex items-center justify-center"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={(e) => onToggleFavorite(photo.id, e)}
            title={isFavorited ? "Remove from saved" : "Save to favorites"}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-md inline-flex items-center justify-center ${
              isFavorited
                ? "bg-rose-500 border-rose-500 text-white"
                : "bg-black/70 border-white/15 text-white/90 hover:bg-rose-500 hover:border-rose-500"
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
            className="p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white/90 hover:bg-(--accent) hover:text-(--bg) hover:border-(--accent) transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer shadow-md inline-flex items-center justify-center"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-4 flex-grow justify-between bg-(--surface)">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-(--accent) truncate">
              {photo.location || "Location N/A"}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-(--text-dim) truncate font-medium">
              {photo.authorName || "Artist"}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold tracking-tight text-(--text) group-hover:text-(--accent) transition-colors line-clamp-1">
            {photo.title}
          </h3>

          {/* Structured EXIF Badges */}
          {(cam || foc || apt || sht || isoVal) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {cam && (
                <button
                  onClick={(e) => onCopyExif(cam, e)}
                  title="Click to copy camera model"
                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-(--surface-2) border border-(--border) font-mono text-[9px] text-(--text) hover:border-(--accent) transition-colors cursor-pointer"
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
                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-(--surface-2) border border-(--border) font-mono text-[9px] text-(--text) hover:border-(--accent) transition-colors cursor-pointer"
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
                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-(--surface-2) border border-(--border) font-mono text-[9px] text-(--text) hover:border-(--accent) transition-colors cursor-pointer"
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
                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-(--surface-2) border border-(--border) font-mono text-[9px] text-(--text) hover:border-(--accent) transition-colors cursor-pointer"
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
                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-(--surface-2) border border-(--border) font-mono text-[9px] text-(--text) hover:border-(--accent) transition-colors cursor-pointer"
                >
                  <span className="text-(--accent) font-bold text-[8px]">ISO</span>
                  <span>{isoVal}</span>
                  {copiedExifText === String(isoVal) && <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 pt-4 border-t border-(--border) text-[10px] font-mono uppercase tracking-[0.15em] text-(--text-dim)">
          <span className="inline-flex items-center justify-center gap-1.5 border-r border-(--border) pr-2">
            <Heart className="h-3 w-3 text-rose-500" />
            {photo.likeCount ?? 0}
          </span>
          <span className="inline-flex items-center justify-center gap-1.5 border-r border-(--border) px-2">
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
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Local state for interactive controls & layout preferences
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeSort, setActiveSort] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridColumns, setGridColumns] = useState<3 | 2>(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Favorites & Toast state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedExifText, setCopiedExifText] = useState<string | null>(null);
  
  // Lightbox & Slideshow state
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);

  const itemsPerPage = gridColumns === 3 ? 9 : 6;
  const currentSortLabel = sortOptions.find((opt) => opt.value === activeSort)?.label || "Sort";

  // Load preferences on mount & scroll listener
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
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Robust blob-based download handler to bypass cross-origin restrictions
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
      // Fallback if CORS blocks fetch
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

  // Global Keyboard Shortcuts
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
      if (e.key === "?") {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setLightboxPhotoId(null);
        setShowFavoritesOnly(false);
        setIsHelpOpen(false);
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

  // Filter & Sort computation
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

  // Slideshow interval timer
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
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-(--border) bg-(--bg)/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-(--text-dim) hover:text-(--text) transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>

          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-dim)">
            AstroSpectrum Gallery
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col items-center text-center gap-8">
        
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-(--text)">
            Gallery Archive
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
            Cinematic photography collection
          </p>
        </div>

        {/* Unified Search, Filters & Controls Deck */}
        <div className="w-full flex flex-col gap-4 bg-(--surface) border border-(--border) p-4 sm:p-5 rounded-2xl backdrop-blur-md shadow-lg relative z-30">
          
          {/* Top Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-dim)" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search images or location..."
                className="w-full bg-(--surface-2) border border-(--border) rounded-xl pl-10 pr-10 py-2.5 font-mono text-[11px] text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent) transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-dim) hover:text-(--text) transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
              
              {/* Grid Density Toggle */}
              <div className="hidden sm:flex items-center justify-center bg-(--surface-2) border border-(--border) p-1 rounded-xl">
                <button
                  onClick={() => handleGridChange(3)}
                  title="3-Column Grid"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center ${
                    gridColumns === 3 ? "bg-(--accent) text-(--bg)" : "text-(--text-dim) hover:text-(--text)"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleGridChange(2)}
                  title="2-Column Large View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center ${
                    gridColumns === 2 ? "bg-(--accent) text-(--bg)" : "text-(--text-dim) hover:text-(--text)"
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-1 sm:flex-initial">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-(--surface-2) border border-(--border) px-3.5 sm:px-4 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.15em] text-(--text) font-bold hover:bg-(--surface-3) transition-all cursor-pointer shadow-xs"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-(--accent)" />
                  <span className="truncate max-w-[120px]">{currentSortLabel}</span>
                  <ChevronDown className={`h-3 w-3 text-(--text-dim) transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-(--surface) border border-(--border) p-1.5 shadow-2xl z-50 backdrop-blur-2xl"
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
                              className={`w-full text-left px-3 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-[0.15em] transition-all cursor-pointer inline-flex items-center ${
                                isSelected
                                  ? "bg-(--accent) text-(--bg) font-bold shadow-xs"
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

              {/* Submit Image Button */}
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-(--text) text-(--bg) font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-(--accent) hover:text-(--bg) transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Submit Image</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Categories & Saved Filter */}
          <div className="flex flex-col gap-3 pt-3 border-t border-(--border)">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-start flex-wrap gap-2 w-full overflow-x-auto scrollbar-none pb-1">
                
                <button
                  onClick={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-xl font-mono text-[10px] uppercase tracking-[0.18em] transition-all whitespace-nowrap border cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    showFavoritesOnly
                      ? "bg-rose-500 text-white border-rose-500 font-bold shadow-xs"
                      : "bg-(--surface-2) text-(--text-dim) border-(--border) hover:bg-(--surface-3) hover:text-(--text)"
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
                      className={`px-3 py-2 rounded-xl font-mono text-[10px] uppercase tracking-[0.18em] transition-all whitespace-nowrap border cursor-pointer inline-flex items-center justify-center ${
                        isActive
                          ? "bg-(--accent) text-(--bg) border-(--accent) font-bold shadow-xs"
                          : "bg-(--surface-2) text-(--text-dim) border-(--border) hover:bg-(--surface-3) hover:text-(--text)"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-muted) whitespace-nowrap shrink-0 hidden lg:block">
                Showing {filteredPhotos.length} {filteredPhotos.length === 1 ? "image" : "images"}
              </span>
            </div>
          </div>

        </div>

        {/* Photo Display Area */}
        {filteredPhotos.length === 0 ? (
          <div className="w-full max-w-lg border border-dashed border-(--border) rounded-2xl py-16 px-6 text-center flex flex-col items-center justify-center gap-4 bg-(--surface) backdrop-blur-md mt-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--text-muted)">
              No images found matching your criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-(--surface-2) hover:bg-(--surface-3) text-(--text) font-mono text-[10px] uppercase tracking-[0.18em] transition-all cursor-pointer border border-(--border) inline-flex items-center justify-center"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-5 sm:gap-6 w-full max-w-7xl mt-2 ${
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10 bg-(--surface) border border-(--border) px-4 py-3.5 rounded-2xl shadow-md backdrop-blur-md">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] font-bold text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="px-3 font-mono text-xs font-bold inline-flex items-center justify-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] font-bold text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Buttons */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="p-3.5 rounded-2xl bg-(--surface) hover:bg-(--accent) hover:text-(--bg) text-(--text) border border-(--border) shadow-2xl backdrop-blur-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider font-bold"
          title="Keyboard Shortcuts (?)"
        >
          <Command className="h-4 w-4 text-(--accent)" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-5 right-5 z-40"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-3.5 rounded-2xl bg-(--surface) hover:bg-(--accent) hover:text-(--bg) text-(--text) border border-(--border) shadow-2xl backdrop-blur-xl transition-all cursor-pointer inline-flex items-center justify-center"
              title="Scroll to top"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-3 sm:p-8 overflow-y-auto"
          >
            <div className="w-full max-w-7xl flex items-center justify-between text-white z-50 py-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                <span>{lightboxIndex + 1} / {filteredPhotos.length}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-(--accent)">{activeLightboxPhoto.category || "photo"}</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                  className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                    isSlideshowPlaying
                      ? "bg-(--accent) border-(--accent) text-(--bg) font-bold"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                  title={isSlideshowPlaying ? "Pause Slideshow" : "Play Slideshow"}
                >
                  {isSlideshowPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  <span className="hidden md:inline">{isSlideshowPlaying ? "Pause" : "Slideshow"}</span>
                </button>

                <button
                  onClick={(e) => handleDownload(activeLightboxPhoto, e)}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-mono text-[10px] uppercase tracking-wider text-white transition-all cursor-pointer"
                  title="Download Original"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Download</span>
                </button>

                <button
                  onClick={(e) => handleShare(activeLightboxPhoto, e)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-mono text-[10px] uppercase tracking-wider text-white transition-all cursor-pointer"
                >
                  {copiedId === activeLightboxPhoto.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden md:inline">Share</span>
                </button>

                <button
                  onClick={(e) => toggleFavorite(activeLightboxPhoto.id, e)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                    favorites.includes(activeLightboxPhoto.id)
                      ? "bg-rose-500 border-rose-500 text-white font-bold"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${favorites.includes(activeLightboxPhoto.id) ? "fill-white" : ""}`} />
                </button>

                <button
                  onClick={() => {
                    setLightboxPhotoId(null);
                    setIsSlideshowPlaying(false);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer inline-flex items-center justify-center"
                  title="Close Lightbox"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-2 overflow-hidden px-6 sm:px-10 min-h-[50vh]">
              {lightboxIndex > 0 && (
                <button
                  onClick={() => setLightboxPhotoId(filteredPhotos[lightboxIndex - 1].id)}
                  className="absolute left-2 sm:left-4 z-40 p-2.5 sm:p-3 rounded-2xl bg-black/70 hover:bg-(--accent) hover:text-(--bg) border border-white/20 text-white transition-all cursor-pointer shadow-2xl inline-flex items-center justify-center"
                  title="Previous Image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              <div className="relative w-full h-full max-h-[65vh] flex items-center justify-center">
                <Image
                  src={activeLightboxPhoto.url}
                  alt={activeLightboxPhoto.title}
                  fill
                  className="object-contain rounded-xl shadow-2xl"
                />
              </div>

              {lightboxIndex < filteredPhotos.length - 1 && (
                <button
                  onClick={() => setLightboxPhotoId(filteredPhotos[lightboxIndex + 1].id)}
                  className="absolute right-2 sm:right-4 z-40 p-2.5 sm:p-3 rounded-2xl bg-black/70 hover:bg-(--accent) hover:text-(--bg) border border-white/20 text-white transition-all cursor-pointer shadow-2xl inline-flex items-center justify-center"
                  title="Next Image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="w-full max-w-4xl bg-white/5 border border-white/15 backdrop-blur-xl p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left mb-2">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
                  {activeLightboxPhoto.title}
                </h2>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/70">
                  <span className="text-(--accent) truncate">{activeLightboxPhoto.location || "Location N/A"}</span>
                  <span>•</span>
                  <span className="truncate">{activeLightboxPhoto.authorName || "Artist"}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start sm:justify-center gap-1.5 w-full sm:w-auto">
                {activeLightboxPhoto.camera && (
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-white/10 border border-white/10 font-mono text-[9px] text-white/90 truncate max-w-[140px]">
                    {activeLightboxPhoto.camera}
                  </span>
                )}
                {activeLightboxPhoto.focalLength && (
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-white/10 border border-white/10 font-mono text-[9px] text-white/90">
                    {activeLightboxPhoto.focalLength}
                  </span>
                )}
                {activeLightboxPhoto.aperture && (
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-white/10 border border-white/10 font-mono text-[9px] text-white/90">
                    {activeLightboxPhoto.aperture}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsHelpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--surface) border border-(--border) rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-(--border) pb-4">
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4 text-(--accent)" />
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1 rounded-lg hover:bg-(--surface-2) text-(--text-dim) hover:text-(--text) transition-colors cursor-pointer inline-flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 font-mono text-[11px]">
                <div className="flex items-center justify-between py-1.5 border-b border-(--border)/50">
                  <span className="text-(--text-muted)">Focus Search Bar</span>
                  <kbd className="px-2 py-1 rounded bg-(--surface-2) border border-(--border) text-(--accent) font-bold inline-flex items-center justify-center">/</kbd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-(--border)/50">
                  <span className="text-(--text-muted)">Navigate Photos</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 rounded bg-(--surface-2) border border-(--border) text-(--accent) font-bold inline-flex items-center justify-center">←</kbd>
                    <kbd className="px-2 py-1 rounded bg-(--surface-2) border border-(--border) text-(--accent) font-bold inline-flex items-center justify-center">→</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-(--border)/50">
                  <span className="text-(--text-muted)">Play / Pause Slideshow</span>
                  <kbd className="px-2 py-1 rounded bg-(--surface-2) border border-(--border) text-(--accent) font-bold inline-flex items-center justify-center">Space</kbd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-(--border)/50">
                  <span className="text-(--text-muted)">Toggle Shortcuts Modal</span>
                  <kbd className="px-2 py-1 rounded bg-(--surface-2) border border-(--border) text-(--accent) font-bold inline-flex items-center justify-center">?</kbd>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-(--text-muted)">Close / Exit</span>
                  <kbd className="px-2 py-1 rounded bg-(--surface-2) border border-(--border) text-(--accent) font-bold inline-flex items-center justify-center">Esc</kbd>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full py-2.5 rounded-xl bg-(--accent) text-(--bg) font-mono text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center justify-center"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubmitPhotoModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </div>
  );
}