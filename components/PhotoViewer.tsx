/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  X,
  Star,
  Info,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Check,
  Film,
  Sun,
  Moon,
  Play,
  Pause,
  HelpCircle,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submitComment as submitCommentAction } from "@/app/actions/comments";
import StarRating from "./StarRating";

// --- Types ---
type GalleryPhoto = {
  id: number;
  url: string;
  title: string;
  location: string | null;
  coordinates?: string | null;
  camera: string | null;
  iso: number | null;
  aperture: string | null;
  shutter: string | null;
  focalLength: string | null;
  authorName?: string | null;
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

type Engagement = {
  ratingAverage: number;
  ratingCount: number;
  viewerRating: number | null;
  likeCount: number;
  viewerLiked: boolean;
  commentCount: number;
};

// --- Film Stock Definitions ---
export const FILM_STOCKS = [
  { id: "normal", label: "Original", filter: "none" },
  { id: "portra", label: "Portra 400 (Warm)", filter: "sepia(0.15) saturate(1.2) contrast(1.05)" },
  { id: "ektar", label: "Ektar 100 (Vibrant)", filter: "saturate(1.4) contrast(1.1) brightness(1.02)" },
  { id: "provia", label: "Provia 100F (Cool)", filter: "hue-rotate(-10deg) saturate(1.15) contrast(1.1)" },
  { id: "cinestill", label: "CineStill 800T (Teal)", filter: "hue-rotate(15deg) saturate(1.3) brightness(0.95)" },
  { id: "acros", label: "Acros 100 (Fine B&W)", filter: "grayscale(1) contrast(1.2) brightness(1.02)" },
  { id: "monochrome", label: "Ilford HP5 (Noir)", filter: "grayscale(1) contrast(1.35) brightness(1.05)" },
  { id: "bleach", label: "Bleach Bypass", filter: "grayscale(0.4) contrast(1.4) brightness(0.9)" },
  { id: "lomo", label: "Lomo Chrome", filter: "hue-rotate(35deg) saturate(1.5) contrast(1.2)" },
];

const springConfig = { type: "spring" as const, stiffness: 280, damping: 30 };

function MagneticButton({
  children,
  className,
  onClick,
  title,
  disabled
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    x.set((clientX - (left + width / 2)) * 0.2);
    y.set((clientY - (top + height / 2)) * 0.2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: xSpring, y: ySpring }}
      className={className}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

const Spinner = ({ dark }: { dark?: boolean }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    className={`w-5 h-5 rounded-full border-2 ${dark ? "border-zinc-300 border-t-zinc-900" : "border-white/20 border-t-white"}`}
  />
);

export default function PhotoViewer({
  photos,
  initialId,
  stats,
  initialEngagement,
  session,
}: {
  photos: GalleryPhoto[];
  initialId: number;
  stats: { avg: number; total: number; likes?: number; comments?: number };
  initialEngagement: Engagement;
  session: Session | null;
}) {
  const router = useRouter();
  const { data: liveSession, status: sessionStatus } = useSession({ required: false });
  const authSession = sessionStatus === "loading" ? session : liveSession ?? session;
  const isLoggedIn = Boolean(authSession);
  const isAuthLoading = sessionStatus === "loading" && !session;

  const initialIndex = useMemo(() => photos.findIndex((p) => p.id === initialId), [photos, initialId]);
  const [index, setIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [direction, setDirection] = useState(0);
  const [engagement, setEngagement] = useState<Engagement>(initialEngagement);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [hudVisible, setHudVisible] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Theme, Film Stock states
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeFilmStock, setActiveFilmStock] = useState("normal");
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [splitPos, setSplitPos] = useState(50);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const photo = photos[index];
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  void stats;

  const rotate = useTransform(x, [-300, 0, 300], isZoomed ? [0, 0, 0] : [-2, 0, 2]);

  // Calculated counter: Latest photo (last index) displays as #1, oldest (index 0) displays as photos.length
  const displayIndex = photos.length - index;

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isSlideshowPlaying) return;
    const interval = setInterval(() => {
      navigate(-1); // In slideshow, advance forward in time to older photos
    }, 4000);
    return () => clearInterval(interval);
  }, [isSlideshowPlaying, index, photos.length]);

  useEffect(() => {
    setImageLoaded(false);
    scale.set(1);
    x.set(0);
    y.set(0);
  }, [index, scale, x, y]);

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
    if (showDrawer || showShortcuts) {
      setHudVisible(true);
      return;
    }
    
    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setHudVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setHudVisible(false), 3000);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("keydown", handleActivity);
    handleActivity();
    
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearTimeout(timeout);
    };
  }, [showDrawer, showShortcuts, index]);

  // Navigation: direction +1 moves to newer photo (higher index), -1 moves to older photo (lower index)
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
    }
  };

  const toggleZoom = () => {
    const current = scale.get();
    if (current > 1.05) {
      scale.set(1);
      x.set(0);
      y.set(0);
    } else {
      scale.set(3);
    }
  };

  // Keyboard Shortcuts Listener (ArrowRight = older photo [-1], ArrowLeft = newer photo [+1])
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && !isZoomed) navigate(-1);
      if (event.key === "ArrowLeft" && !isZoomed) navigate(1);
      if (event.key === "i" || event.key === "I") setShowDrawer((prev) => !prev);
      if (event.key === "f" || event.key === "F") toggleZoom();
      if (event.key === "p" || event.key === "P") setIsSlideshowPlaying((prev) => !prev);
      if (event.key === "c" || event.key === "C") setIsComparing((prev) => !prev);
      if (event.key === "?" || event.key === "/") {
        event.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      if (event.key === "Escape") {
        if (scale.get() > 1.05) {
          scale.set(1);
          x.set(0);
          y.set(0);
        } else if (showDrawer) {
          setShowDrawer(false);
        } else if (showShortcuts) {
          setShowShortcuts(false);
        } else {
          router.back();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, router, showDrawer, showShortcuts, scale, x, y, isZoomed]);

  useEffect(() => {
    if (!photo) return;
    if (photo.id === initialId) {
      setEngagement(initialEngagement);
      return;
    }
    fetch(`/api/photos/${photo.id}/engagement`)
      .then((res) => res.json())
      .then((data) => setEngagement(data))
      .catch(() => undefined);
  }, [photo, initialId, initialEngagement]);

  const toggleLike = async () => {
    setEngagement((current) => ({
      ...current,
      viewerLiked: !current.viewerLiked,
      likeCount: Math.max(0, current.likeCount + (current.viewerLiked ? -1 : 1)),
    }));
    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: photo.id }),
    });
  };

  const handleRating = async (val: number) => {
    setEngagement((current) => ({ ...current, viewerRating: val }));
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: photo.id, value: val }),
    });
    const data = await res.json();
    if (res.ok) {
      setEngagement((current) => ({
        ...current,
        ratingAverage: data.ratingAverage,
        ratingCount: data.ratingCount,
        viewerRating: data.viewerRating,
      }));
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: photo.title, url: shareUrl });
        return;
      } catch {
        // Fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
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
      if (!engagement.viewerLiked) toggleLike();
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
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden w-full h-full p-4 md:p-12">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={photo.id}
            custom={direction}
            onClick={handleTouchOrClick}
            onTouchStart={handleTouchOrClick}
            style={{ x, y, rotate, scale }}
            drag={mounted && !isComparing ? true : false}
            dragConstraints={isZoomed ? constraints : { left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (isZoomed || isComparing) return;
              const offset = info.offset.x;
              const velocity = info.velocity.x;
              if (offset < -70 || velocity < -400) navigate(-1); // Swipe left -> older photo
              if (offset > 70 || velocity > 400) navigate(1);   // Swipe right -> newer photo
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: scale.get(), cursor: isZoomed ? "grab" : "zoom-in" }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={springConfig}
            className="relative flex items-center justify-center touch-none"
          >
            {!imageLoaded && (
              <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-md z-20 rounded-xl overflow-hidden min-w-[300px] min-h-[300px] ${
                isDark ? "bg-zinc-900/50" : "bg-zinc-200/50"
              }`}>
                <div className="flex flex-col items-center gap-3">
                  <Spinner dark={!isDark} />
                  <span className={`text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Loading image...</span>
                </div>
              </div>
            )}

            {/* SPLIT COMPARISON VIEW */}
            {isComparing && activeFilmStock !== "normal" ? (
              <div 
                ref={imageContainerRef}
                onMouseMove={handleSplitDrag}
                onTouchMove={handleSplitDrag}
                className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg shadow-2xl select-none cursor-ew-resize"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  draggable={false}
                  onLoad={() => setImageLoaded(true)}
                  className="max-h-[85vh] max-w-[90vw] object-contain block pointer-events-none"
                />
                <div 
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` }}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    draggable={false}
                    style={{ filter: activeFilterStyle }}
                    className="max-h-[85vh] max-w-[90vw] object-contain block max-w-none w-full h-full"
                  />
                </div>
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none flex items-center justify-center"
                  style={{ left: `${splitPos}%` }}
                >
                  <div className="w-7 h-7 rounded-full bg-white text-black shadow-lg flex items-center justify-center text-[10px] font-bold">
                    VS
                  </div>
                </div>
              </div>
            ) : (
              <img
                ref={imgRef}
                src={photo.url}
                alt={photo.title}
                draggable={false}
                onLoad={() => setImageLoaded(true)}
                style={{ filter: activeFilterStyle }}
                className={`max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-all duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Copy Link Toast Notification */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`absolute top-20 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-2xl text-xs font-medium ${
                isDark ? "bg-zinc-900/90 border border-zinc-700 text-white" : "bg-white/90 border border-zinc-300 text-zinc-900"
              }`}
            >
              <Check size={14} className="text-emerald-500" /> Link copied to clipboard
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Hearts Animation */}
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
            className={`absolute top-0 inset-x-0 z-40 flex flex-col xl:flex-row items-center justify-between p-4 sm:p-6 bg-gradient-to-b pointer-events-auto gap-4 ${
              isDark ? "from-black/90 via-black/50 to-transparent" : "from-zinc-100/90 via-zinc-100/50 to-transparent"
            }`}
          >
            <div className="flex items-center justify-between w-full xl:w-auto gap-4">
              <div className="flex items-center gap-4">
                <MagneticButton
                  onClick={() => router.back()}
                  className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border transition shrink-0 ${
                    isDark ? "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white" : "bg-white/80 text-zinc-700 border-zinc-200 hover:bg-white hover:text-black shadow-sm"
                  }`}
                  title="Back to Gallery"
                >
                  <X size={18} strokeWidth={2} />
                </MagneticButton>
                <div className="hidden sm:flex flex-col">
                  <h2 className={`text-sm font-medium truncate max-w-xs ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{photo.title}</h2>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {photo.camera && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-400" : "bg-white/80 border-zinc-200 text-zinc-600"}`}>
                        📷 {photo.camera}
                      </span>
                    )}
                    {photo.focalLength && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-400" : "bg-white/80 border-zinc-200 text-zinc-600"}`}>
                        🔍 {photo.focalLength}
                      </span>
                    )}
                    {photo.aperture && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-400" : "bg-white/80 border-zinc-200 text-zinc-600"}`}>
                        ☀️ {photo.aperture}
                      </span>
                    )}
                    {photo.iso && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-400" : "bg-white/80 border-zinc-200 text-zinc-600"}`}>
                        ISO {photo.iso}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex xl:hidden items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-medium ${
                  isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-400" : "bg-white/80 border-zinc-200 text-zinc-600 shadow-sm"
                }`}>
                  {displayIndex} / {photos.length}
                </span>
              </div>
            </div>

            {/* FILM STOCK SELECTOR TOOLBAR */}
            <div className={`flex items-center gap-1 overflow-x-auto max-w-full py-1.5 px-2.5 backdrop-blur-xl border rounded-2xl scrollbar-none ${
              isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-300" : "bg-white/90 border-zinc-200 text-zinc-700 shadow-md"
            }`}>
              <Film size={14} className="text-amber-500 ml-1.5 mr-1 shrink-0 hidden md:block" />
              {FILM_STOCKS.map((stock) => (
                <button
                  key={stock.id}
                  onClick={() => setActiveFilmStock(stock.id)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                    activeFilmStock === stock.id
                      ? "bg-amber-500 text-black font-bold shadow-md"
                      : isDark
                      ? "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      : "bg-transparent text-zinc-600 hover:text-black hover:bg-zinc-100"
                  }`}
                >
                  {stock.label.split(" ")[0]}
                </button>
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-medium ${
                isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-400" : "bg-white/80 border-zinc-200 text-zinc-600 shadow-sm"
              }`}>
                {displayIndex} / {photos.length}
              </span>

              {/* Slideshow Toggle Button */}
              <MagneticButton
                onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border text-xs font-medium transition ${
                  isSlideshowPlaying 
                    ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md" 
                    : isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white/90 border-zinc-200 text-zinc-700 hover:bg-white shadow-sm"
                }`}
                title="Toggle Slideshow [P]"
              >
                {isSlideshowPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span className="hidden sm:inline">{isSlideshowPlaying ? "Pause" : "Slideshow"}</span>
              </MagneticButton>

              {/* Theme Toggle Button */}
              <MagneticButton
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border text-xs font-medium transition ${
                  isDark ? "bg-zinc-900/80 border-zinc-800 text-amber-400 hover:bg-zinc-800" : "bg-white/90 border-zinc-200 text-amber-600 hover:bg-white shadow-sm"
                }`}
                title="Toggle Theme"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
                <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
              </MagneticButton>

              {/* Shortcuts Guide Button */}
              <MagneticButton
                onClick={() => setShowShortcuts(true)}
                className={`p-2.5 rounded-full backdrop-blur-md border transition ${
                  isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white" : "bg-white/90 border-zinc-200 text-zinc-600 hover:text-black shadow-sm"
                }`}
                title="Keyboard Shortcuts [?]"
              >
                <HelpCircle size={16} strokeWidth={2} />
              </MagneticButton>

              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border text-xs font-medium transition ${
                  isDark ? "bg-zinc-900/85 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" : "bg-white/90 border-zinc-200 text-zinc-700 hover:bg-white hover:text-black shadow-sm"
                }`}
                title="Details [I]"
              >
                <Info size={14} strokeWidth={2} />
                <span className="hidden sm:inline">Details</span>
              </MagneticButton>
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
            className="absolute bottom-6 inset-x-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className={`pointer-events-auto flex items-center gap-1 px-3 py-2 backdrop-blur-xl border rounded-full shadow-2xl ${
              isDark ? "bg-zinc-900/80 border-zinc-800/80 text-zinc-300" : "bg-white/90 border-zinc-200 text-zinc-700"
            }`}>
              <MagneticButton
                onClick={() => navigate(1)}
                className={`p-2.5 rounded-full transition ${isDark ? "hover:bg-zinc-800/50 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                title="Newer Photo [←]"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </MagneticButton>

              <div className={`w-[1px] h-4 mx-1 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              <MagneticButton
                onClick={toggleLike}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition group`}
              >
                <Heart size={16} strokeWidth={engagement.viewerLiked ? 0 : 2} className={`transition-all ${engagement.viewerLiked ? "text-red-500 fill-current scale-110" : isDark ? "text-zinc-400 group-hover:text-white" : "text-zinc-600 group-hover:text-black"}`} />
                <span className={`text-xs font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{engagement.likeCount}</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition group`}
              >
                <Star size={16} strokeWidth={2} className="text-amber-500 transition-colors" />
                <span className={`text-xs font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{engagement.ratingAverage.toFixed(1)}</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition group`}
              >
                <MessageCircle size={16} strokeWidth={2} className={isDark ? "text-zinc-400 group-hover:text-white" : "text-zinc-600 group-hover:text-black"} />
                <span className={`text-xs font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{engagement.commentCount}</span>
              </MagneticButton>

              <div className={`w-[1px] h-4 mx-1 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              {/* Before/After Split Comparison Toggle */}
              {activeFilmStock !== "normal" && (
                <MagneticButton
                  onClick={() => setIsComparing(!isComparing)}
                  className={`p-2.5 rounded-full transition ${
                    isComparing ? "bg-amber-500 text-black font-bold" : isDark ? "hover:bg-zinc-800/50 text-zinc-400" : "hover:bg-zinc-100 text-zinc-600"
                  }`}
                  title="Toggle Before/After Split View [C]"
                >
                  <SlidersHorizontal size={16} strokeWidth={2} />
                </MagneticButton>
              )}

              <MagneticButton
                onClick={handleShare}
                className={`p-2.5 rounded-full transition ${isDark ? "hover:bg-zinc-800/50 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                title="Share Photo"
              >
                <Share2 size={16} strokeWidth={2} />
              </MagneticButton>

              <MagneticButton
                onClick={handleDownload}
                className={`p-2.5 rounded-full transition ${isDark ? "hover:bg-zinc-800/50 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                title="Download"
              >
                <Download size={16} strokeWidth={2} />
              </MagneticButton>

              <MagneticButton
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`p-2.5 rounded-full xl:hidden transition ${isDark ? "hover:bg-zinc-800/50 text-amber-400" : "hover:bg-zinc-100 text-amber-600"}`}
                title="Toggle Theme"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </MagneticButton>

              {!isMobile && (
                <MagneticButton
                  onClick={toggleZoom}
                  className={`p-2.5 rounded-full transition ${isDark ? "hover:bg-zinc-800/50 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                  title={isZoomed ? "Zoom Out" : "Zoom In [F]"}
                >
                  {isZoomed ? <Minimize2 size={16} strokeWidth={2} /> : <Maximize2 size={16} strokeWidth={2} />}
                </MagneticButton>
              )}

              <div className={`w-[1px] h-4 mx-1 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              <MagneticButton
                onClick={() => navigate(-1)}
                className={`p-2.5 rounded-full transition ${isDark ? "hover:bg-zinc-800/50 hover:text-white text-zinc-400" : "hover:bg-zinc-100 hover:text-black text-zinc-600"}`}
                title="Older Photo [→]"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </MagneticButton>
            </div>
          </motion.div>
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
              className={`absolute z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
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
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>Toggle Before / After Split</span>
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
                      <span className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{engagement.ratingAverage.toFixed(1)}</span> / 5 
                      <span className={`ml-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>({engagement.ratingCount})</span>
                    </div>
                  </div>
                </div>

                <div className={`space-y-4 pt-4 border-t ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                  <h4 className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    <MessageCircle size={14} /> Comments ({engagement.commentCount})
                  </h4>
                  <CommentsList photoId={photo.id} setEngagement={setEngagement} isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} isDark={isDark} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Comments List Sub-Component ---
function CommentsList({
  photoId,
  setEngagement,
  isLoggedIn,
  isAuthLoading,
  isDark,
}: {
  photoId: number;
  setEngagement: React.Dispatch<React.SetStateAction<Engagement>>;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isDark: boolean;
}) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/comments?photoId=${photoId}`)
      .then(res => res.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [photoId]);

  const submit = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const result = await submitCommentAction(photoId, comment);
      if (result.ok) {
        setComment("");
        setComments(c => [result.comment, ...c]);
        setEngagement(c => ({ ...c, commentCount: result.commentCount }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {isAuthLoading ? (
        <div className={`h-10 w-full rounded-xl animate-pulse ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`} />
      ) : isLoggedIn ? (
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={`flex-1 h-10 px-3.5 text-xs border transition-colors rounded-xl focus:outline-none ${
              isDark 
                ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700" 
                : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300"
            }`}
            placeholder="Write a comment..."
          />
          <button
            onClick={submit}
            disabled={submitting || !comment.trim()}
            className={`h-10 px-4 text-xs font-medium transition disabled:opacity-40 rounded-xl flex items-center justify-center min-w-[64px] ${
              isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {submitting ? <Spinner dark={!isDark} /> : "Post"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google", { callbackUrl: window.location.pathname })}
          className={`w-full border px-4 py-2.5 text-xs font-medium transition rounded-xl ${
            isDark ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800" : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          Sign in to comment
        </button>
      )}

      <div className="space-y-3 pt-2">
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner dark={!isDark} />
          </div>
        ) : comments.length === 0 ? (
          <p className={`text-xs text-center py-6 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>No comments yet.</p>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="flex gap-3 group">
              <img
                src={item.user.customImage || item.user.image || "/default-pfp.png"}
                alt=""
                className={`h-7 w-7 rounded-full object-cover border shrink-0 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}
              />
              <div className={`flex-1 min-w-0 border p-3 rounded-xl ${
                isDark ? "bg-zinc-950 border-zinc-900" : "bg-zinc-50 border-zinc-200"
              }`}>
                <p className={`text-xs font-medium mb-1 ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>{item.user.name || "User"}</p>
                <p className={`text-xs break-words leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{item.body ?? item.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}