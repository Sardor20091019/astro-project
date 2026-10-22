"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { Heart, MessageCircle, ArrowLeft, Share2, CreditCard, ChevronLeft, ChevronRight, Camera, MapPin } from "lucide-react";
import StarRating from "./StarRating";
import { submitComment as submitCommentAction } from "@/app/actions/comments";

type GalleryPhoto = {
  id: number;
  url: string;
  title: string;
  location: string | null;
  camera: string | null;
  iso: number | null;
  aperture: string | null;
  shutter: string | null;
  focalLength: string | null;
  authorName?: string | null;
};

type Engagement = {
  ratingAverage: number;
  ratingCount: number;
  viewerRating: number | null;
  likeCount: number;
  viewerLiked: boolean;
  commentCount: number;
};

type CommentItem = {
  id: number;
  body?: string;
  comment?: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
    customImage?: string | null;
  };
};

export default function PhotoViewer({
  photos,
  initialId,
  initialEngagement,
  session,
}: {
  photos: GalleryPhoto[];
  initialId: number;
  initialEngagement: Engagement;
  session: Session | null;
  stats?: { avg?: number; total?: number; likes?: number; comments?: number };
}) {
  const router = useRouter();
  const currentIndex = photos.findIndex((p) => p.id === initialId);
  const [index, setIndex] = useState(currentIndex >= 0 ? currentIndex : 0);
  const photo = photos[index] || photos[0];

  const [engagement, setEngagement] = useState<Engagement>(initialEngagement);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // System Dark/Light Mode Detection
  const [isDarkMode, setIsDarkMode] = useState(true);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Touch swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

<<<<<<< HEAD
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
=======
  useEffect(() => {
    if (!shouldRunSlideshow) return;
    const interval = setInterval(() => {
      navigate(-1);
    }, slideshowIntervalMs);
    return () => clearInterval(interval);
  }, [shouldRunSlideshow, slideshowIntervalMs, index, photos.length]);

  const handleStageMouseMove = useCallback(() => {
    setIsMouseStationary((prev) => (prev ? false : prev));
    if (mouseIdleTimerRef.current) clearTimeout(mouseIdleTimerRef.current);
    mouseIdleTimerRef.current = setTimeout(() => {
      setIsMouseStationary(true);
    }, 1000);
  }, []);
>>>>>>> 65a6b4c (fix: update)

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

<<<<<<< HEAD
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      // Swipe left -> Next photo
      setIndex((i) => (i + 1) % photos.length);
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> Prev photo
      setIndex((i) => (i - 1 + photos.length) % photos.length);
=======
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsMouseStationary(false);
    if (mouseIdleTimerRef.current) clearTimeout(mouseIdleTimerRef.current);
  };


  useEffect(() => {
    setImageLoaded(false);
    scale.set(1);
    x.set(0);
    y.set(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, [index, scale, x, y]);

  useEffect(() => {
    if (!photos || photos.length <= 1) return;
    const nextIdx = (index + 1) % photos.length;
    const prevIdx = (index - 1 + photos.length) % photos.length;

    [photos[nextIdx]?.url, photos[prevIdx]?.url].forEach((url) => {
      if (url && typeof window !== "undefined") {
        const preloader = new window.Image();
        preloader.src = url;
      }
    });
  }, [index, photos]);

  useEffect(() => {
    const updateConstraints = () => {
      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        const s = currentScale;
        const maxW = Math.max(0, (rect.width * (s - 1)) / (2 * s));
        const maxH = Math.max(0, (rect.height * (s - 1)) / (2 * s));
        setConstraints({ left: -maxW, right: maxW, top: -maxH, bottom: maxH });
      }
    };
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [currentScale, imageLoaded]);

  useEffect(() => {
    const unsubscribeScale = scale.onChange((val) => {
      setCurrentScale(val);
      setIsZoomed(val > 1.05);
    });
    return () => unsubscribeScale();
  }, [scale]);

  useEffect(() => {
    if (showDrawer || showShortcuts || showAuthModal) {
      setHudVisible(true);
      return;
    }
    
    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setHudVisible((prev) => (!prev ? true : prev));
      clearTimeout(timeout);
      timeout = setTimeout(() => setHudVisible(false), 3000);
    };

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    handleActivity();
    
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearTimeout(timeout);
    };
  }, [showDrawer, showShortcuts, showAuthModal]);

  const navigate = useCallback(
    (nextDirection: number) => {
      if (photos.length === 0 || isZoomed) return;
      x.set(0);
      y.set(0);
      scale.set(1);
      setDirection(nextDirection);
      setIndex((current) => {
        const nextIndex = (current + nextDirection + photos.length) % photos.length;
        window.history.replaceState(null, "", `/photos/${photos[nextIndex].id}`);
        setHearts([]);
        return nextIndex;
      });
    },
    [photos, x, y, scale, isZoomed],
  );

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const currentVal = scale.get();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.8;
    const newScale = Math.min(Math.max(currentVal * zoomFactor, 1), 6);
    scale.set(newScale);
    if (newScale === 1) {
      x.set(0);
      y.set(0);
>>>>>>> 65a6b4c (fix: update)
    }
  };

  useEffect(() => {
    if (!photo) return;
    setLoadingComments(true);
    fetch(`/api/photos/${photo.id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.comments || data.data || [];
        setComments(arr);
      })
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));

    if (photo.id !== initialId) {
      fetch(`/api/photos/${photo.id}/engagement`)
        .then((res) => res.json())
        .then((data) => setEngagement(data))
        .catch(() => {});
    }
  }, [photo, initialId]);

  const handleBuy = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: photo.id,
          name: `High-Res Photo: ${photo.title}`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initialize checkout.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong with payment.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }
    const nextLiked = !engagement.viewerLiked;
    setEngagement((prev) => ({
      ...prev,
      viewerLiked: nextLiked,
      likeCount: Math.max(0, prev.likeCount + (nextLiked ? 1 : -1)),
    }));

    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: photo.id }),
    });
  };

  const handleRating = async (val: number) => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }
    setEngagement((prev) => ({ ...prev, viewerRating: val }));
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: photo.id, value: val }),
    });
    const data = await res.json();
    if (res.ok) {
      setEngagement((prev) => ({
        ...prev,
        ratingAverage: data.ratingAverage,
        ratingCount: data.ratingCount,
        viewerRating: data.viewerRating,
      }));
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || submittingComment || !session) return;
    setSubmittingComment(true);
    try {
<<<<<<< HEAD
      const result = await submitCommentAction(photo.id, commentText);
      if (result.ok) {
        setCommentText("");
        setComments((prev) => [
          {
            id: result.comment.id,
            body: result.comment.body,
            createdAt: result.comment.createdAt,
            user: {
              name: result.comment.name,
              image: result.comment.image,
              customImage: result.comment.customImage,
            },
          },
          ...prev,
        ]);
        setEngagement((prev) => ({ ...prev, commentCount: result.commentCount }));
=======
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${photo.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "photo"}-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(photo.url, "_blank");
    }
  };

  const lastTapRef = useRef<number>(0);
  const handleTouchOrClick = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (isLoggedIn && !engagement.viewerLiked) {
        toggleLike();
      } else if (!isLoggedIn) {
        setShowAuthModal(true);
        return;
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setHearts((prev) => [...prev, { id: Date.now(), x: clientX, y: clientY }]);
    }
    lastTapRef.current = now;
  };

  const handleSplitDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const xPos = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (xPos / rect.width) * 100));
    setSplitPos(percentage);
  };

  if (!photo) return <div className="p-8 text-white bg-black min-h-screen">Photo not found.</div>;

  const metadata = [
    photo.camera,
    photo.focalLength,
    photo.aperture,
    photo.shutter,
    photo.iso ? `ISO ${photo.iso}` : null,
  ].filter(Boolean);

  const activeFilterStyle = FILM_STOCKS.find((s) => s.id === activeFilmStock)?.filter || "none";
  const isDark = theme === "dark";


  const transformStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <div 
      onWheel={handleWheel}
      className={`relative flex h-[100dvh] w-full overflow-hidden select-none transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-zinc-100 text-zinc-900"
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 z-0 transition-colors duration-300 ${
        isDark ? "bg-gradient-to-b from-zinc-950 via-black to-zinc-950" : "bg-gradient-to-b from-zinc-200 via-zinc-100 to-zinc-200"
      }`} />

      {/* STAGE CONTAINER */}
      <div 
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden w-full h-full p-2 sm:p-6 md:p-12 pt-28 sm:pt-24 xl:pt-14 pb-28 sm:pb-24"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleStageMouseMove}
      >
        {shouldRunSlideshow && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 z-50 overflow-hidden">
            <div
              key={`${index}-${slideshowIntervalMs}`}
              className="h-full bg-amber-500 transition-all ease-linear"
              style={{
                width: "0%",
                transitionDuration: `${slideshowIntervalMs}ms`,
                transform: "translateX(0%)",
              }}
              ref={(node) => {
                if (node) {
                  requestAnimationFrame(() => {
                    node.style.transform = "translateX(0%)";
                    node.style.width = "100%";
                  });
                }
              }}
            />
          </div>
        )}

        {isSlideshowPlaying && isHovered && !isMouseStationary && (
          <div className="absolute top-28 xl:top-20 z-50 bg-zinc-900/90 border border-amber-500/40 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md shadow-xl animate-in fade-in">
            Slideshow Paused (Move mouse away or stop for 1s to resume)
          </div>
        )}

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={photo.id}
            custom={direction}
            onClick={handleTouchOrClick}
            onTouchStart={handleTouchOrClick}
            style={{ x, y, rotate: rotateTilt, scale }}
            drag={mounted && !isComparing ? true : false}
            dragConstraints={isZoomed ? constraints : { left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (isZoomed || isComparing) return;
              const offset = info.offset.x;
              const velocity = info.velocity.x;
              if (offset < -70 || velocity < -400) navigate(-1);
              if (offset > 70 || velocity > 400) navigate(1);
            }}
            initial={{ opacity: 0, scale: 0.94, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: scale.get(), filter: "blur(0px)", cursor: isZoomed ? "grab" : "zoom-in" }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative flex items-center justify-center touch-none"
          >
            {!imageLoaded && (
              <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-md z-20 rounded-xl overflow-hidden min-w-[250px] min-h-[250px] ${
                isDark ? "bg-zinc-900/50" : "bg-zinc-200/50"
              }`}>
                <div className="flex flex-col items-center gap-3">
                  <Spinner dark={!isDark} />
                  <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Loading image...</span>
                </div>
              </div>
            )}

            {isComparing && activeFilmStock !== "normal" && !isTransformed ? (
              <div 
                ref={imageContainerRef}
                onMouseMove={handleSplitDrag}
                onTouchMove={handleSplitDrag}
                className="relative max-h-[68vh] md:max-h-[82vh] max-w-[92vw] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl select-none border border-white/10 cursor-ew-resize"
              >
                <div style={transformStyle} className="relative flex items-center justify-center">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    draggable={false}
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    className="max-h-[68vh] md:max-h-[82vh] max-w-[92vw] object-contain block pointer-events-none"
                  />
                  <div 
                    className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                    style={{ clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      draggable={false}
                      decoding="async"
                      style={{ filter: activeFilterStyle }}
                      className="max-h-[68vh] md:max-h-[82vh] max-w-[92vw] object-contain block"
                    />
                  </div>
                </div>

                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none flex items-center justify-center z-10"
                  style={{ left: `${splitPos}%` }}
                >
                  <div className="w-7 h-7 rounded-full bg-white text-black shadow-lg flex items-center justify-center text-[10px] font-bold">
                    VS
                  </div>
                </div>
              </div>
            ) : (
              <div style={transformStyle} className="relative flex items-center justify-center">
                <img
                  ref={imgRef}
                  src={photo.url}
                  alt={photo.title}
                  draggable={false}
                  decoding="async"
                  onLoad={() => setImageLoaded(true)}
                  style={{ filter: activeFilterStyle }}
                  className={`max-h-[68vh] md:max-h-[82vh] max-w-[92vw] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`absolute top-28 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-2xl text-xs font-medium ${
                isDark ? "bg-zinc-900/90 border border-zinc-700 text-white" : "bg-white/90 border border-zinc-300 text-zinc-900"
              }`}
            >
              <Check size={14} className="text-emerald-500" /> Link copied to clipboard
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {warningMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`absolute top-28 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-2xl text-xs font-medium ${
                isDark ? "bg-amber-950/90 border border-amber-600/50 text-amber-200" : "bg-amber-100/90 border border-amber-300 text-amber-900"
              }`}
            >
              <Info size={14} className="text-amber-500 shrink-0" /> {warningMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1.3, y: -30 }}
              exit={{ opacity: 0, scale: 1.5, y: -70 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute pointer-events-none z-50 text-red-500"
              style={{ left: h.x - 24, top: h.y - 24 }}
            >
              <Heart size={48} className="fill-current drop-shadow-lg" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* TOP HEADER CONTROLS */}
      <AnimatePresence>
        {hudVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-0 inset-x-0 z-40 flex flex-col items-center p-3 sm:p-5 bg-gradient-to-b pointer-events-auto gap-2 sm:gap-3 ${
              isDark ? "from-black/95 via-black/80 to-transparent" : "from-zinc-100/95 via-zinc-100/80 to-transparent"
            }`}
          >
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <MagneticButton
                  onClick={() => router.back()}
                  className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-xl backdrop-saturate-150 border transition shrink-0 ${
                    isDark ? "bg-zinc-950/65 text-zinc-300 border-white/12 hover:bg-zinc-800/80 hover:text-white shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]" : "bg-white/75 text-zinc-700 border-black/10 hover:bg-white hover:text-black shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]"
                  }`}
                  title="Back to Gallery"
                >
                  <X size={18} strokeWidth={2} />
                </MagneticButton>
                <div className="flex flex-col min-w-0">
                  <h2 className={`text-xs sm:text-sm font-medium truncate max-w-[170px] sm:max-w-xs ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{photo.title}</h2>
                  <div className="hidden sm:flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {photo.camera && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? "bg-zinc-950/50 border-white/10 text-zinc-400" : "bg-white/70 border-black/10 text-zinc-600"}`}>
                        📷 {photo.camera}
                      </span>
                    )}
                    {photo.focalLength && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? "bg-zinc-950/50 border-white/10 text-zinc-400" : "bg-white/70 border-black/10 text-zinc-600"}`}>
                        🔍 {photo.focalLength}
                      </span>
                    )}
                    {photo.aperture && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? "bg-zinc-950/50 border-white/10 text-zinc-400" : "bg-white/70 border-black/10 text-zinc-600"}`}>
                        ☀️ {photo.aperture}
                      </span>
                    )}
                    {photo.iso && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? "bg-zinc-950/50 border-white/10 text-zinc-400" : "bg-white/70 border-black/10 text-zinc-600"}`}>
                        ISO {photo.iso}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1.5 rounded-full backdrop-blur-xl backdrop-saturate-150 border text-xs font-medium ${
                  isDark ? "bg-zinc-950/65 border-white/12 text-zinc-300 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]" : "bg-white/75 border-black/10 text-zinc-700 shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]"
                }`}>
                  {displayIndex} / {photos.length}
                </span>

                <div className="hidden xl:flex items-center gap-2.5">
                  <div className={`flex items-center gap-2 p-1.5 px-3 rounded-full backdrop-blur-xl backdrop-saturate-150 border ${
                    isDark ? "bg-zinc-950/65 border-white/12 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]" : "bg-white/75 border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]"
                  }`}>
                    <MagneticButton
                      onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        isSlideshowPlaying 
                          ? "bg-amber-500 text-black font-bold shadow-md" 
                          : isDark ? "text-zinc-300 hover:bg-zinc-800" : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                      title="Toggle Slideshow [P]"
                    >
                      {isSlideshowPlaying ? <Pause size={13} /> : <Play size={13} />}
                      <span>{isSlideshowPlaying ? "Pause" : "Slideshow"}</span>
                    </MagneticButton>

                    {isSlideshowPlaying && (
                      <div className="flex items-center gap-2 pl-2 border-l border-zinc-700/50">
                        <Clock size={12} className="text-zinc-400" />
                        <input
                          type="range"
                          min="1"
                          max="12"
                          step="0.5"
                          value={slideshowIntervalMs / 1000}
                          onChange={(e) => setSlideshowIntervalMs(parseFloat(e.target.value) * 1000)}
                          className="w-20 accent-amber-500 cursor-pointer h-1 bg-zinc-700 rounded-lg"
                          title={`Interval: ${(slideshowIntervalMs / 1000).toFixed(1)}s`}
                        />
                        <span className="text-[10px] font-mono text-amber-400 w-8 font-semibold">
                          {(slideshowIntervalMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                    )}
                  </div>

                  <MagneticButton
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-xl border text-xs font-medium transition ${
                      isDark ? "bg-zinc-900/80 border-zinc-800 text-amber-400 hover:bg-zinc-800" : "bg-white/90 border-zinc-200 text-amber-600 hover:bg-white shadow-sm"
                    }`}
                    title="Toggle Theme"
                  >
                    {isDark ? <Sun size={15} /> : <Moon size={15} />}
                    <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
                  </MagneticButton>

                  <MagneticButton
                    onClick={() => setShowShortcuts(true)}
                    className={`p-2.5 rounded-full backdrop-blur-xl border transition ${
                      isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white" : "bg-white/90 border-zinc-200 text-zinc-700 hover:text-black shadow-sm"
                    }`}
                    title="Keyboard Shortcuts [?]"
                  >
                    <HelpCircle size={16} strokeWidth={2} />
                  </MagneticButton>

                  <MagneticButton
                    onClick={() => setShowDrawer(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border text-xs font-medium transition ${
                      isDark ? "bg-zinc-900/85 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white" : "bg-white/90 border-zinc-200 text-zinc-800 hover:bg-white hover:text-black shadow-sm"
                    }`}
                    title="Details [I]"
                  >
                    <Info size={14} strokeWidth={2} />
                    <span className="hidden sm:inline">Details</span>
                  </MagneticButton>
                </div>
              </div>
            </div>

            {/* FILM STOCK SELECTOR & ROTATION TOOLBAR */}
            <div className={`flex items-center gap-1.5 overflow-x-auto w-full max-w-full py-1.5 px-2.5 backdrop-blur-2xl backdrop-saturate-150 border rounded-2xl scrollbar-none shadow-xl ${
              isDark ? "bg-zinc-950/65 border-white/12 text-zinc-300 shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)]" : "bg-white/75 border-black/10 text-zinc-700 shadow-[0_12px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.85)]"
            }`}>
              <Film size={14} className="text-amber-500 mx-1 shrink-0 hidden sm:block" />
              {FILM_STOCKS.map((stock) => (
                <button
                  key={stock.id}
                  onClick={() => setActiveFilmStock(stock.id)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                    activeFilmStock === stock.id
                      ? "bg-amber-500 text-black font-bold shadow-md"
                      : isDark
                      ? "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                      : "bg-transparent text-zinc-600 hover:text-black hover:bg-zinc-100"
                  }`}
                >
                  {stock.label.split(" ")[0]}
                </button>
              ))}

              <div className={`w-[1px] h-4 mx-1 shrink-0 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              {/* Counter-Clockwise Rotate Button */}
              <button
                onClick={() => setRotation((prev) => prev - 90)}
                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-600 hover:text-black"
                }`}
                title="Rotate 90° Counter-Clockwise"
              >
                <RotateCcw size={15} />
              </button>

              {/* Clockwise Rotate Button */}
              <button
                onClick={() => setRotation((prev) => prev + 90)}
                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-600 hover:text-black"
                }`}
                title="Rotate 90° Clockwise [R]"
              >
                <RotateCw size={15} />
              </button>

              {/* Flip Horizontal */}
              <button
                onClick={() => setFlipH((prev) => !prev)}
                className={`p-2 rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center ${
                  flipH ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-600 hover:text-black"
                }`}
                title="Mirror Horizontally"
              >
                <FlipHorizontal size={15} />
              </button>

              {/* Flip Vertical */}
              <button
                onClick={() => setFlipV((prev) => !prev)}
                className={`p-2 rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center ${
                  flipV ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-600 hover:text-black"
                }`}
                title="Mirror Vertically"
              >
                <FlipVertical size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM FLOATING DOCK */}
      <AnimatePresence>
        {hudVisible && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 sm:bottom-6 inset-x-0 z-40 flex items-center justify-center pointer-events-none px-3"
          >
            <div className={`pointer-events-auto flex items-center gap-1 sm:gap-1.5 px-3 py-2 backdrop-blur-2xl backdrop-saturate-150 border rounded-full shadow-2xl max-w-full overflow-x-auto scrollbar-none ${
              isDark ? "bg-zinc-950/65 border-white/12 text-zinc-300 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]" : "bg-white/75 border-black/10 text-zinc-700 shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.85)]"
            }`}>
              <MagneticButton
                onClick={() => navigate(1)}
                className={`p-2.5 rounded-full transition shrink-0 ${isDark ? "hover:bg-zinc-800/60 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                title="Newer Photo [←]"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </MagneticButton>

              <div className={`w-[1px] h-4 mx-0.5 shrink-0 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              <MagneticButton
                onClick={toggleLike}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition group shrink-0`}
                title={isLoggedIn ? "Like Photo" : "Sign in to like"}
              >
                <Heart size={16} strokeWidth={engagement.viewerLiked ? 0 : 2} className={`transition-all ${engagement.viewerLiked ? "text-red-500 fill-current scale-110" : isDark ? "text-zinc-400 group-hover:text-white" : "text-zinc-600 group-hover:text-black"}`} />
                <span className={`text-xs font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{engagement.likeCount}</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition group shrink-0`}
              >
                <Star size={16} strokeWidth={2} className="text-amber-500 transition-colors" />
                <span className={`text-xs font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{(engagement?.ratingAverage ?? 0).toFixed(1)}</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition group shrink-0`}
              >
                <MessageCircle size={16} strokeWidth={2} className={isDark ? "text-zinc-400 group-hover:text-white" : "text-zinc-600 group-hover:text-black"} />
                <span className={`text-xs font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{engagement.commentCount}</span>
              </MagneticButton>

              <div className={`w-[1px] h-4 mx-0.5 shrink-0 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              {activeFilmStock !== "normal" && (
                <MagneticButton
                  onClick={() => {
                    if (isTransformed) {
                      showWarning("Comparison isn't available while image is rotated or mirrored.");
                    } else {
                      setIsComparing(!isComparing);
                    }
                  }}
                  className={`p-2.5 rounded-full transition shrink-0 ${
                    isComparing 
                      ? "bg-amber-500 text-black font-bold shadow-md" 
                      : isDark ? "hover:bg-zinc-800/60 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-600 hover:text-black"
                  }`}
                  title="Toggle Before/After Split View [C]"
                >
                  <SlidersHorizontal size={16} strokeWidth={2} />
                </MagneticButton>
              )}

              <MagneticButton
                onClick={handleShare}
                className={`p-2.5 rounded-full transition shrink-0 ${isDark ? "hover:bg-zinc-800/60 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                title="Share Photo"
              >
                <Share2 size={16} strokeWidth={2} />
              </MagneticButton>

              <MagneticButton
                onClick={handleDownload}
                className={`p-2.5 rounded-full transition shrink-0 ${isDark ? "hover:bg-zinc-800/60 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                title="Download"
              >
                <Download size={16} strokeWidth={2} />
              </MagneticButton>

              <MagneticButton
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`p-2.5 rounded-full xl:hidden transition shrink-0 ${isDark ? "hover:bg-zinc-800/60 text-amber-400" : "hover:bg-zinc-100 text-amber-600"}`}
                title="Toggle Theme"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </MagneticButton>

              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className={`p-2.5 rounded-full xl:hidden transition shrink-0 ${isDark ? "hover:bg-zinc-800/60 text-zinc-200" : "hover:bg-zinc-100 text-zinc-800"}`}
                title="Details [I]"
              >
                <Info size={16} strokeWidth={2} />
              </MagneticButton>

              {!isMobile && (
                <MagneticButton
                  onClick={toggleZoom}
                  className={`p-2.5 rounded-full transition shrink-0 ${isDark ? "hover:bg-zinc-800/60 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                  title={isZoomed ? "Zoom Out" : "Zoom In [F]"}
                >
                  {isZoomed ? <Minimize2 size={16} strokeWidth={2} /> : <Maximize2 size={16} strokeWidth={2} />}
                </MagneticButton>
              )}

              <div className={`w-[1px] h-4 mx-0.5 shrink-0 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              <MagneticButton
                onClick={() => navigate(-1)}
                className={`p-2.5 rounded-full transition shrink-0 ${isDark ? "hover:bg-zinc-800/60 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                title="Older Photo [→]"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IN-APP SIGN-IN MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`absolute z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm p-6 rounded-3xl border shadow-2xl text-center ${
                isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="flex justify-end mb-1">
                <button 
                  onClick={() => setShowAuthModal(false)} 
                  className={`p-2 rounded-full transition ${isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-zinc-600 hover:text-black hover:bg-zinc-100"}`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <LogIn size={22} />
              </div>

              <h3 className="text-base font-semibold mb-1">Sign in required</h3>
              <p className={`text-xs mb-6 leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Please sign in with your Google account to like photos, leave ratings, and join the conversation.
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => signIn("google", { callbackUrl: window.location.pathname })}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition shadow-lg ${
                    isDark 
                      ? "bg-white text-black hover:bg-zinc-200" 
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-medium transition ${
                    isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-zinc-600 hover:text-black hover:bg-zinc-100"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SHORTCUTS GUIDE MODAL */}
      <AnimatePresence>
        {showShortcuts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcuts(false)}
              className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`absolute z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md p-6 rounded-2xl border shadow-2xl ${
                isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <HelpCircle size={16} className="text-amber-500" /> Keyboard Shortcuts
                </h3>
                <button onClick={() => setShowShortcuts(false)} className="text-zinc-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Newer / Older Photo</span>
                  <span className="font-mono bg-zinc-900 px-2 py-1 rounded text-amber-400 border border-zinc-800">← / →</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Rotate 90° Clockwise</span>
                  <span className="font-mono bg-zinc-900 px-2 py-1 rounded text-amber-400 border border-zinc-800">R</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Toggle Details Drawer</span>
                  <span className="font-mono bg-zinc-900 px-2 py-1 rounded text-amber-400 border border-zinc-800">I</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Toggle Zoom / Fullscreen</span>
                  <span className="font-mono bg-zinc-900 px-2 py-1 rounded text-amber-400 border border-zinc-800">F</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Play / Pause Slideshow</span>
                  <span className="font-mono bg-zinc-900 px-2 py-1 rounded text-amber-400 border border-zinc-800">P</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Toggle Before / After Split (When unrotated)</span>
                  <span className="font-mono bg-zinc-900 px-2 py-1 rounded text-amber-400 border border-zinc-800">C</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Close / Go Back</span>
                  <span className="font-mono bg-zinc-900 px-2 py-1 rounded text-amber-400 border border-zinc-800">Esc</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DETAILS DRAWER */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`absolute right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] shadow-2xl flex flex-col border-l ${
                isDark ? "bg-zinc-950 border-zinc-800/80 text-white" : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-zinc-800/80" : "border-zinc-200"}`}>
                <h3 className={`text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Photo Details</h3>
                <MagneticButton
                  onClick={() => setShowDrawer(false)}
                  className={`p-2 rounded-full transition ${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-black"}`}
                >
                  <X size={18} strokeWidth={2} />
                </MagneticButton>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h2 className={`text-2xl font-semibold tracking-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>{photo.title}</h2>
                  {photo.authorName && (
                    <p className={`text-xs mb-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Captured by {photo.authorName}</p>
                  )}
                  <p className={`text-xs flex items-center gap-1.5 mb-6 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                    <MapPin size={14} className={isDark ? "text-zinc-400" : "text-zinc-600"} /> {photo.location || "Location not specified"}
                  </p>
                  
                  <div className="flex gap-2">
                    <MagneticButton
                      onClick={handleShare}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 border text-xs font-medium rounded-xl transition ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200"
                      }`}
                    >
                      <Share2 size={15} strokeWidth={2} /> Share Link
                    </MagneticButton>
                    <MagneticButton
                      onClick={handleDownload}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium rounded-xl transition ${
                        isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
                      }`}
                    >
                      <Download size={15} strokeWidth={2} /> Download
                    </MagneticButton>
                  </div>
                </div>

                {metadata.length > 0 && (
                  <div className={`space-y-3 pt-4 border-t ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                    <span className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      <Camera size={14} /> Camera Settings & EXIF
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {metadata.map((meta, i) => (
                        <div key={i} className={`px-3 py-2 border rounded-lg text-xs font-mono ${
                          isDark ? "bg-zinc-900/60 border-zinc-800/60 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
                        }`}>
                          {meta}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`space-y-3 pt-4 border-t ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                  <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Rating</span>
                  <div className={`flex items-center justify-between p-3 border rounded-xl ${
                    isDark ? "bg-zinc-900/60 border-zinc-800/60" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <StarRating value={engagement.viewerRating ?? 0} onSelect={handleRating} />
                    <div className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{(engagement?.ratingAverage ?? 0).toFixed(1)}</span> / 5 
                      <span className={`ml-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>({engagement.ratingCount})</span>
                    </div>
                  </div>
                </div>

                <div className={`space-y-4 pt-4 border-t ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                  <h4 className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    <MessageCircle size={14} /> Comments ({engagement.commentCount})
                  </h4>
                  <CommentsList 
                    photoId={photo.id} 
                    setEngagement={setEngagement} 
                    isLoggedIn={isLoggedIn} 
                    isAuthLoading={isAuthLoading} 
                    isDark={isDark} 
                    onOpenAuthModal={() => setShowAuthModal(true)}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


function CommentsList({
  photoId,
  setEngagement,
  isLoggedIn,
  isAuthLoading,
  isDark,
  onOpenAuthModal,
}: {
  photoId: number;
  setEngagement: React.Dispatch<React.SetStateAction<Engagement>>;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isDark: boolean;
  onOpenAuthModal: () => void;
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/photos/${photoId}/comments`)
      .then(res => res.json())
      .then(data => {
        const commentsArray = Array.isArray(data) 
          ? data 
          : data.comments || data.data || [];
        setComments(commentsArray);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [photoId]);

  const submit = async () => {
    const textToSubmit = comment.trim();
    if (!textToSubmit || submitting) return;

    // Optimistically insert comment immediately (0ms instant user feedback)
    const tempId = -Date.now();
    const optimisticComment = {
      id: tempId,
      body: textToSubmit,
      createdAt: new Date().toISOString(),
      user: {
        name: session?.user?.name || "You",
        image: session?.user?.image || null,
        customImage: null,
      },
    };

    setComment("");
    setComments(prev => [optimisticComment, ...prev]);
    setEngagement(c => ({ ...c, commentCount: c.commentCount + 1 }));
    setSubmitting(true);

    try {
      const result = await submitCommentAction(photoId, textToSubmit);
      if (result.ok) {
        // Reconcile temporary optimistic comment with permanent server identity
        setComments(prev =>
          prev.map(c =>
            c.id === tempId
              ? {
                  id: result.comment.id,
                  body: result.comment.body,
                  createdAt: result.comment.createdAt,
                  user: {
                    name: result.comment.name,
                    image: result.comment.image,
                    customImage: result.comment.customImage,
                  },
                }
              : c
          )
        );
        setEngagement(c => ({ ...c, commentCount: result.commentCount }));
      } else {
        // Revert optimistic update on server rejection
        setComments(prev => prev.filter(c => c.id !== tempId));
        setEngagement(c => ({ ...c, commentCount: Math.max(0, c.commentCount - 1) }));
        setComment(textToSubmit);
>>>>>>> 65a6b4c (fix: update)
      }
    } catch {
      // Revert optimistic update on network failure
      setComments(prev => prev.filter(c => c.id !== tempId));
      setEngagement(c => ({ ...c, commentCount: Math.max(0, c.commentCount - 1) }));
      setComment(textToSubmit);
    } finally {
      setSubmittingComment(false);
    }
  };

  const recommendations = photos.filter((p) => p.id !== photo.id).slice(0, 3);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col items-center py-10 px-4 ${
        isDarkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"
      }`}
    >
      {/* Expanded Max Width for a Bigger, More Cinematic View */}
      <div className="w-full max-w-[640px] flex flex-col gap-6">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-black"
            }`}
          >
            <ArrowLeft size={16} /> Back to Gallery
          </button>
          <span className="text-xs font-mono tracking-wider opacity-60">
            {index + 1} / {photos.length}
          </span>
        </div>

        {/* Bigger Cinematic Image Container with Touch Support */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`relative w-full h-[500px] sm:h-[600px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
            isDarkMode ? "bg-neutral-900 border border-neutral-800/80" : "bg-neutral-200 border border-neutral-300/60"
          }`}
        >
          <Image
            src={photo.url}
            alt={photo.title}
            fill
            className="object-cover select-none"
            priority
          />

          {/* Navigation Controls Overlay */}
          {photos.length > 1 && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <button
                onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                className={`p-3 rounded-full backdrop-blur-xl pointer-events-auto transition-all transform hover:scale-105 shadow-lg ${
                  isDarkMode
                    ? "bg-black/50 text-white border border-white/10 hover:bg-black/80"
                    : "bg-white/70 text-black border border-black/10 hover:bg-white"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setIndex((i) => (i + 1) % photos.length)}
                className={`p-3 rounded-full backdrop-blur-xl pointer-events-auto transition-all transform hover:scale-105 shadow-lg ${
                  isDarkMode
                    ? "bg-black/50 text-white border border-white/10 hover:bg-black/80"
                    : "bg-white/70 text-black border border-black/10 hover:bg-white"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Photo Metadata & Purchase Card */}
        <div
          className={`flex flex-col gap-5 p-6 rounded-3xl backdrop-blur-2xl shadow-xl transition-colors duration-300 ${
            isDarkMode
              ? "bg-neutral-900/70 border border-neutral-800/80"
              : "bg-white/80 border border-neutral-200/80"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{photo.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs opacity-70 mt-1.5 font-medium">
                {photo.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {photo.location}
                  </span>
                )}
                {photo.camera && (
                  <span className="flex items-center gap-1">
                    <Camera size={13} /> {photo.camera}
                  </span>
                )}
                {photo.iso && <span>ISO {photo.iso}</span>}
                {photo.aperture && <span>{photo.aperture}</span>}
                {photo.shutter && <span>{photo.shutter}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-emerald-500 tracking-tight">$0.50</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-current/10">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all border ${
                engagement.viewerLiked
                  ? "bg-red-500/10 border-red-500/30 text-red-500"
                  : isDarkMode
                  ? "bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800"
                  : "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <Heart size={16} className={engagement.viewerLiked ? "fill-current" : ""} />
              <span>{engagement.likeCount}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all border ${
                isDarkMode
                  ? "bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800"
                  : "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <Share2 size={16} />
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>

            <button
              onClick={handleBuy}
              disabled={checkoutLoading}
              className="flex-1 py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <CreditCard size={16} />
              <span>{checkoutLoading ? "Processing..." : "Buy High-Res ($0.50)"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-current/10 text-xs opacity-80 font-medium">
            <span>Community Rating ({engagement.ratingCount})</span>
            <StarRating value={engagement.viewerRating ?? 0} onSelect={handleRating} />
          </div>
        </div>

        {/* Comments Section */}
        <div
          className={`flex flex-col gap-4 p-6 rounded-3xl backdrop-blur-2xl shadow-xl transition-colors duration-300 ${
            isDarkMode
              ? "bg-neutral-900/70 border border-neutral-800/80"
              : "bg-white/80 border border-neutral-200/80"
          }`}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
            <MessageCircle size={15} /> Comments ({engagement.commentCount})
          </h2>

          {session ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Share your thoughts..."
                className={`flex-1 h-11 px-4 rounded-2xl text-xs transition-all outline-none border ${
                  isDarkMode
                    ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-neutral-600"
                    : "bg-neutral-100 border-neutral-200 text-black placeholder-neutral-400 focus:border-neutral-400"
                }`}
              />
              <button
                onClick={submitComment}
                disabled={submittingComment || !commentText.trim()}
                className="px-5 h-11 bg-white text-black text-xs font-bold rounded-2xl hover:bg-neutral-200 transition-all disabled:opacity-50 shadow-md"
              >
                Post
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/api/auth/signin")}
              className={`w-full py-3 rounded-2xl text-xs font-semibold transition-all border ${
                isDarkMode
                  ? "bg-neutral-800/40 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800"
                  : "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Sign in to leave a comment
            </button>
          )}

          <div className="space-y-3 pt-2">
            {loadingComments ? (
              <p className="text-xs opacity-50 text-center py-6">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs opacity-50 text-center py-6">No comments yet. Be the first!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3 text-xs">
                  <img
                    src={c.user.customImage || c.user.image || "/default-pfp.png"}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-current/10 shrink-0 mt-0.5"
                  />
                  <div
                    className={`flex-1 p-3.5 rounded-2xl border ${
                      isDarkMode
                        ? "bg-neutral-950/80 border-neutral-800/80"
                        : "bg-neutral-50 border-neutral-200/80"
                    }`}
                  >
                    <span className="font-bold opacity-90 block mb-1">{c.user.name || "User"}</span>
                    <span className="opacity-80 break-words leading-relaxed">{c.body || c.comment}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider opacity-70 px-1">
              More from the Gallery
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {recommendations.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => {
                    setIndex(photos.findIndex((p) => p.id === rec.id));
                    window.history.replaceState(null, "", `/photos/${rec.id}`);
                  }}
                  className={`relative h-36 rounded-2xl overflow-hidden group border transition-all duration-300 ${
                    isDarkMode ? "bg-neutral-900 border-neutral-800 hover:border-neutral-600" : "bg-neutral-200 border-neutral-300 hover:border-neutral-400"
                  }`}
                >
                  <Image
                    src={rec.url}
                    alt={rec.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}