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
  Clock,
  LogIn,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Theme, Film Stock, Slideshow & Transformation states
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeFilmStock, setActiveFilmStock] = useState("normal");
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Consider any full 360 rotation cycle (e.g. 360, 720, 0) as original position
  const isTransformed = (rotation % 360 !== 0) || flipH || flipV;

  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [slideshowIntervalMs, setSlideshowIntervalMs] = useState<number>(4000);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseStationary, setIsMouseStationary] = useState(false);
  const mouseIdleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isComparing, setIsComparing] = useState(false);
  const [splitPos, setSplitPos] = useState(50);

  const showWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(null), 3000);
  };

  // Automatically turn off comparison mode if user rotates or flips the image
  useEffect(() => {
    if (isTransformed && isComparing) {
      setIsComparing(false);
    }
  }, [isTransformed, isComparing]);

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

  const rotateTilt = useTransform(x, [-300, 0, 300], isZoomed ? [0, 0, 0] : [-2, 0, 2]);

  const displayIndex = photos.length - index;

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const shouldRunSlideshow = isSlideshowPlaying && (!isHovered || isMouseStationary);

  useEffect(() => {
    if (!shouldRunSlideshow) return;
    const interval = setInterval(() => {
      navigate(-1);
    }, slideshowIntervalMs);
    return () => clearInterval(interval);
  }, [shouldRunSlideshow, slideshowIntervalMs, index, photos.length]);

  const handleStageMouseMove = () => {
    setIsMouseStationary(false);
    if (mouseIdleTimerRef.current) clearTimeout(mouseIdleTimerRef.current);
    mouseIdleTimerRef.current = setTimeout(() => {
      setIsMouseStationary(true);
    }, 1000);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsMouseStationary(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsMouseStationary(false);
    if (mouseIdleTimerRef.current) clearTimeout(mouseIdleTimerRef.current);
  };

  // Reset image view properties upon switching photos
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
  }, [showDrawer, showShortcuts, showAuthModal, index]);

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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && !isZoomed) navigate(-1);
      if (event.key === "ArrowLeft" && !isZoomed) navigate(1);
      if (event.key === "i" || event.key === "I") setShowDrawer((prev) => !prev);
      if (event.key === "f" || event.key === "F") toggleZoom();
      if (event.key === "p" || event.key === "P") setIsSlideshowPlaying((prev) => !prev);
      if (event.key === "c" || event.key === "C") {
        if (isTransformed) {
          showWarning("Comparison isn't available while image is rotated or mirrored.");
        } else {
          setIsComparing((prev) => !prev);
        }
      }
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        setRotation((prev) => prev + 90);
      }
      if (event.key === "?" || event.key === "/") {
        event.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      if (event.key === "Escape") {
        if (scale.get() > 1.05) {
          scale.set(1);
          x.set(0);
          y.set(0);
        } else if (showAuthModal) {
          setShowAuthModal(false);
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
  }, [navigate, router, showDrawer, showShortcuts, showAuthModal, scale, x, y, isZoomed, isTransformed]);

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
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    const nextLikedState = !engagement.viewerLiked;
    
    setEngagement((current) => ({
      ...current,
      viewerLiked: nextLikedState,
      likeCount: Math.max(0, current.likeCount + (nextLikedState ? 1 : -1)),
    }));

    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: photo.id }),
    });
  };

  const handleRating = async (val: number) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

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

  // Combined continuous rotation & mirroring style
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
                  className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-xl border transition shrink-0 ${
                    isDark ? "bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white" : "bg-white/90 text-zinc-700 border-zinc-200 hover:bg-white hover:text-black shadow-sm"
                  }`}
                  title="Back to Gallery"
                >
                  <X size={18} strokeWidth={2} />
                </MagneticButton>
                <div className="flex flex-col min-w-0">
                  <h2 className={`text-xs sm:text-sm font-medium truncate max-w-[170px] sm:max-w-xs ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{photo.title}</h2>
                  <div className="hidden sm:flex items-center gap-1.5 mt-0.5 flex-wrap">
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

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1.5 rounded-full backdrop-blur-xl border text-xs font-medium ${
                  isDark ? "bg-zinc-900/90 border-zinc-800 text-zinc-300" : "bg-white/90 border-zinc-200 text-zinc-700 shadow-sm"
                }`}>
                  {displayIndex} / {photos.length}
                </span>

                <div className="hidden xl:flex items-center gap-2.5">
                  <div className={`flex items-center gap-2 p-1.5 px-3 rounded-full backdrop-blur-xl border ${
                    isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white/90 border-zinc-200 shadow-sm"
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
            <div className={`flex items-center gap-1.5 overflow-x-auto w-full max-w-full py-1.5 px-2.5 backdrop-blur-2xl border rounded-2xl scrollbar-none shadow-lg ${
              isDark ? "bg-zinc-900/90 border-zinc-800 text-zinc-300" : "bg-white/95 border-zinc-200 text-zinc-700"
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
            <div className={`pointer-events-auto flex items-center gap-1 sm:gap-1.5 px-3 py-2 backdrop-blur-2xl border rounded-full shadow-2xl max-w-full overflow-x-auto scrollbar-none ${
              isDark ? "bg-zinc-900/90 border-zinc-800/80 text-zinc-300" : "bg-white/95 border-zinc-200 text-zinc-700"
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
                <span className={`text-xs font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{engagement.ratingAverage.toFixed(1)}</span>
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
                      <span className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{engagement.ratingAverage.toFixed(1)}</span> / 5 
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

// --- Comments List Sub-Component ---
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
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/photos/${photoId}/comments`)
      .then(res => res.json())
      .then(data => {
        // Support both direct arrays and wrapped response objects
        const commentsArray = Array.isArray(data) 
          ? data 
          : data.comments || data.data || [];
        setComments(commentsArray);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [photoId]);

  const submit = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const result = await submitCommentAction(photoId, comment);
      if (result.ok) {
        setComment("");
        setComments(c => [
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
          ...c,
        ]);
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
          onClick={onOpenAuthModal}
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