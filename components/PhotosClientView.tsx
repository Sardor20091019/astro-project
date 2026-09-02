/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo, useEffect, useRef, memo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
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

interface PhotosClientViewProps {
  initialPhotos: any[];
  categories: { label: string; value: string }[];
}

interface PhotoCardProps {
  photo: any;
  index: number;
  isFavorited: boolean;
  onToggleFavorite: (photoId: string, e?: React.MouseEvent) => void;
  onOpenLightbox: (photoId: string) => void;
  onOpenComments: (photo: any, e: React.MouseEvent) => void;
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
  onOpenComments,
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

  return (
    <motion.article 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className={`break-inside-avoid ${layoutMode === "compact" ? "mb-6 sm:mb-8" : "mb-16 sm:mb-24"} relative group rounded-3xl overflow-hidden bg-(--surface) border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.65)] hover:shadow-[0_35px_80px_rgba(0,0,0,0.85)] hover:border-white/25 transition-all duration-500 text-left cursor-pointer`}
      onClick={() => {
        if (showBlur) return;
        router.push(`/photos/${photo.id}`);
      }}
    >
      <div className="relative w-full overflow-hidden bg-(--surface-2)">
        <img
          src={photo.url}
          alt={photo.title || "Gallery Item"}
          className={`w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-105 ${
            showBlur ? "blur-2xl scale-110 select-none" : ""
          }`}
          loading={index < 4 ? "eager" : "lazy"}
        />

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
                onClick={(e) => onOpenComments(photo, e)}
                title="Open Comments"
                aria-label="Open Comments"
                className="p-2 sm:p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:border-sky-400 transition-all cursor-pointer inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px]"
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400" />
                <span>{photo.commentCount ?? 0}</span>
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
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[9px] text-white/80">
                    <span>{foc}</span>
                  </span>
                )}
                {apt && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[9px] text-white/80">
                    <Aperture className="w-3 h-3 text-(--accent)" />
                    <span>{apt}</span>
                  </span>
                )}
                {sht && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[9px] text-white/80">
                    <Clock className="w-3 h-3 text-(--accent)" />
                    <span>{sht}</span>
                  </span>
                )}
                {isoVal && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/15 font-mono text-[9px] text-white/80">
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

function CommentsList({
  photoId,
  setEngagement,
  isLoggedIn,
  isAuthLoading,
  isDark,
  onOpenAuthModal,
}: {
  photoId: number | string;
  setEngagement: React.Dispatch<React.SetStateAction<any>>;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isDark: boolean;
  onOpenAuthModal: () => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/photos/${photoId}/comments`)
      .then(res => res.json())
      .then(data => setComments(Array.isArray(data) ? data : (data.comments || [])))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [photoId]);

  const submit = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/photos/${photoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: comment.trim(),
        }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComment("");
        setComments(c => [newComment, ...c]);
        setEngagement((prev: any) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      {isAuthLoading ? (
        <div className={`h-10 w-full rounded-xl animate-pulse ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`} />
      ) : isLoggedIn ? (
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={`flex-1 h-11 px-4 text-xs border transition-colors rounded-2xl focus:outline-none ${
              isDark 
                ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700" 
                : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300"
            }`}
            placeholder="Write a comment..."
          />
          <button
            onClick={submit}
            disabled={submitting || !comment.trim()}
            className={`h-11 px-5 text-xs font-medium transition disabled:opacity-40 rounded-2xl flex items-center justify-center min-w-[72px] cursor-pointer ${
              isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {submitting ? "..." : "Post"}
          </button>
        </div>
      ) : (
        <button
          onClick={onOpenAuthModal}
          className={`w-full border px-4 py-3 text-xs font-medium transition rounded-2xl cursor-pointer ${
            isDark ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800" : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          Sign in to comment
        </button>
      )}

      <div className="space-y-3 pt-2">
        {loading ? (
          <div className="flex justify-center py-6 text-xs text-zinc-400 animate-pulse">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <p className={`text-xs text-center py-6 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>No comments yet.</p>
        ) : (
          comments.map((item, idx) => (
            <div key={item.id || idx} className="flex gap-3 group">
              <img
                src={item.user?.customImage || item.user?.image || "/default-pfp.png"}
                alt=""
                className={`h-8 w-8 rounded-full object-cover border shrink-0 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}
              />
              <div className={`flex-1 min-w-0 border p-3.5 rounded-2xl ${
                isDark ? "bg-zinc-950 border-zinc-900" : "bg-zinc-50 border-zinc-200"
              }`}>
                <p className={`text-xs font-semibold mb-1 ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>{item.user?.name || item.authorName || "User"}</p>
                <p className={`text-xs break-words leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{item.body ?? item.text ?? item.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface CommentModalProps {
  photo: any | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: (photoId: string | number, newCount: number) => void;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isDark: boolean;
  onOpenAuthModal: () => void;
}

function CommentModal({ photo, isOpen, onClose, onCommentAdded, isLoggedIn, isAuthLoading, isDark, onOpenAuthModal }: CommentModalProps) {
  const [engagement, setEngagement] = useState({ commentCount: photo?.commentCount || 0 });

  useEffect(() => {
    if (photo) {
      setEngagement({ commentCount: photo.commentCount || 0 });
    }
  }, [photo]);

  if (!isOpen || !photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-lg w-full max-h-[85vh] bg-(--surface) border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left bg-zinc-950 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <img
                src={photo.url}
                alt={photo.title || "Photo"}
                className="w-10 h-10 rounded-xl object-cover border border-zinc-800"
              />
              <div className="flex flex-col">
                <h3 className="font-bold text-sm text-white truncate max-w-[240px]">
                  {photo.title || "Untitled Capture"}
                </h3>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400">
                  Comments ({engagement.commentCount})
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onCommentAdded(photo.id, engagement.commentCount);
                onClose();
              }}
              aria-label="Close comments"
              className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white hover:bg-rose-500 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 max-h-[50vh]">
            <CommentsList
              photoId={photo.id}
              setEngagement={(updater) => {
                setEngagement(updater);
                if (typeof updater === 'function') {
                  const updatedCount = updater(engagement).commentCount;
                  onCommentAdded(photo.id, updatedCount);
                }
              }}
              isLoggedIn={isLoggedIn}
              isAuthLoading={isAuthLoading}
              isDark={true}
              onOpenAuthModal={onOpenAuthModal}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PhotosClientView({
  initialPhotos,
  categories = [],
}: PhotosClientViewProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"large" | "compact">("large");
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  
  const [commentModalPhoto, setCommentModalPhoto] = useState<any | null>(null);
  
  const [photosState, setPhotosState] = useState(() => {
    const shuffled = Array.isArray(initialPhotos) ? [...initialPhotos] : [];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [isLoggedIn] = useState(true);
  const [isAuthLoading] = useState(false);

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

    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleLayout = () => {
    const nextMode = layoutMode === "large" ? "compact" : "large";
    setLayoutMode(nextMode);
    try {
      localStorage.setItem("astrospectrum_layout_mode", nextMode);
    } catch (e) {}
  };

  const handleVerifyAge = () => {
    setAgeVerified(true);
    setShowAgeModal(false);
    try {
      localStorage.setItem("astrospectrum_age_verified", "true");
    } catch (e) {}
  };

  const filteredPhotos = useMemo(() => {
    let result = Array.isArray(photosState) ? photosState.map(p => ({
      ...p,
      url: p.url ? p.url.replace(/([a-z0-9]+)\.ufs\.sh/g, 'utfs.io') : p.url
    })) : [];

    if (showFavoritesOnly) {
      result = result.filter((p) => favorites.includes(p.id));
    }

    if (selectedCategory) {
      result = result.filter(
        (p) => p.category === selectedCategory || p.categoryId === selectedCategory
      );
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

    return result;
  }, [photosState, showFavoritesOnly, selectedCategory, favorites, searchQuery]);

  useEffect(() => {
    const currentSentinel = loadMoreRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, filteredPhotos.length));
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [filteredPhotos.length]);

  const displayedPhotos = useMemo(() => {
    return filteredPhotos.slice(0, visibleCount);
  }, [filteredPhotos, visibleCount]);

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

  const handleOpenCommentsModal = (photo: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentModalPhoto(photo);
  };

  const handleCommentCountUpdate = (photoId: string | number, newCount: number) => {
    setPhotosState((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, commentCount: newCount } : p))
    );
    if (commentModalPhoto && commentModalPhoto.id === photoId) {
      setCommentModalPhoto((prev: any) => (prev ? { ...prev, commentCount: newCount } : null));
    }
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
        setCommentModalPhoto(null);
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setShowFavoritesOnly(false);
    setVisibleCount(12);
  };

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

      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-(--bg)/85 backdrop-blur-2xl">
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

      <aside
        ref={timelineRef}
        aria-label="Page scroll position scrubber"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end justify-between h-[50vh] py-2 px-3 cursor-ns-resize touch-none select-none transition-opacity ${
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

      <main className="flex-1 w-full max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 flex flex-col items-center text-center gap-12">
        
        <div className="flex flex-col items-center gap-3.5 w-full max-w-4xl">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-(--text)">
            Gallery Archive
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-(--text-dim)">
            cinematic captures and visual stories
          </p>
        </div>

        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center gap-4 bg-(--surface)/90 border border-white/10 p-4 rounded-3xl backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative z-30">
          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-dim)" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(12);
              }}
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
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setVisibleCount(12);
              }}
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
                    className="absolute right-0 mt-2.5 w-64 bg-zinc-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-50 p-2 flex flex-col text-left backdrop-blur-2xl"
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setIsCategoryDropdownOpen(false);
                        setVisibleCount(12);
                      }}
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
                            onClick={() => {
                              setSelectedCategory(cat.value);
                              setIsCategoryDropdownOpen(false);
                              setVisibleCount(12);
                            }}
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
              {displayedPhotos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  isFavorited={favorites.includes(photo.id)}
                  onToggleFavorite={toggleFavorite}
                  onOpenLightbox={(id) => setLightboxPhotoId(id)}
                  onOpenComments={handleOpenCommentsModal}
                  ageVerified={ageVerified}
                  onRequireAgeVerification={() => setShowAgeModal(true)}
                  layoutMode={layoutMode}
                />
              ))}
            </div>

            <div ref={loadMoreRef} className="w-full py-24 flex items-center justify-center">
              {visibleCount < filteredPhotos.length ? (
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--text-muted) animate-pulse">
                  Loading more captures... ({visibleCount} of {filteredPhotos.length})
                </div>
              ) : (
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--text-dim)/60">
                  End of gallery archive
                </div>
              )}
            </div>
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

      <CommentModal
        photo={commentModalPhoto}
        isOpen={!!commentModalPhoto}
        onClose={() => setCommentModalPhoto(null)}
        onCommentAdded={handleCommentCountUpdate}
        isLoggedIn={isLoggedIn}
        isAuthLoading={isAuthLoading}
        isDark={true}
        onOpenAuthModal={() => {}}
      />

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