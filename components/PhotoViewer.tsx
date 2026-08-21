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
  Sparkles,
  X,
  Star,
  Info,
  Maximize2,
  Minimize2,
  Download,
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

const springConfig = { type: "spring" as const, stiffness: 280, damping: 30 };

// Optimized Magnetic Button using pure motion values (Zero React re-renders)
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

const KineticLoader = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    className="w-4 h-4 rounded-full border-[1.5px] border-white/20 border-t-white"
  />
);

export default function PhotoViewer({
  photos,
  initialId,
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
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const photo = photos[index];
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const [isZoomed, setIsZoomed] = useState(false);

  const rotate = useTransform(isMobile ? y : x, [-300, 0, 300], [-2, 0, 2]);

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Preload adjacent images
  useEffect(() => {
    if (photos.length <= 1) return;
    const prevIndex = (index - 1 + photos.length) % photos.length;
    const nextIndex = (index + 1) % photos.length;
    const imgPrev = new window.Image();
    imgPrev.src = photos[prevIndex].url;
    const imgNext = new window.Image();
    imgNext.src = photos[nextIndex].url;
  }, [index, photos]);

  // Immersive Focus Mode timeout
  useEffect(() => {
    if (showDrawer) {
      setHudVisible(true);
      return;
    }
    
    let timeout: NodeJS.Timeout;
    const handleActivity = () => {
      setHudVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setHudVisible(false), 2500);
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
  }, [showDrawer, index]);

  useEffect(() => {
    const unsubscribe = scale.onChange((val) => setIsZoomed(val > 1.05));
    return () => unsubscribe();
  }, [scale]);

  const navigate = useCallback(
    (nextDirection: number) => {
      if (photos.length === 0) return;
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
    [photos, x, y, scale],
  );

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const currentScale = scale.get();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.min(Math.max(currentScale * zoomFactor, 1), 4);
    
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
      scale.set(2.2);
    }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigate(-1);
      if (event.key === "ArrowRight") navigate(1);
      if (event.key === "Escape") {
        if (scale.get() > 1.05) {
          scale.set(1);
          x.set(0);
          y.set(0);
        } else if (showDrawer) {
          setShowDrawer(false);
        } else {
          router.push("/");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, router, showDrawer, scale, x, y]);

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

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${photo.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "astrospectrum"}-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(photo.url, "_blank");
    }
  };

  let lastTap = 0;
  const handleTouchOrClick = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!engagement.viewerLiked) toggleLike();
      let clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      let clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setHearts((prev) => [...prev, { id: Date.now(), x: clientX, y: clientY }]);
    }
    lastTap = now;
  };

  if (!photo) return <div className="p-8 text-white bg-[#030305] min-h-screen">Photo not found.</div>;

  const metadata = [
    photo.camera,
    photo.focalLength,
    photo.aperture,
    photo.shutter,
    photo.iso ? `ISO ${photo.iso}` : null,
  ].filter(Boolean);

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[#030305] text-white select-none">
      
      {/* Optimized Static Ambient Background (Zero performance overhead) */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-[#030305] via-[#09090c] to-[#030305]" />

      {/* STAGE */}
      <div 
        onWheel={handleWheel}
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden touch-none w-full h-full p-4 md:p-12"
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={photo.id}
            custom={direction}
            style={isMobile ? { y, rotate, scale } : { x, y, rotate, scale }}
            drag={mounted ? (isZoomed ? true : isMobile ? "y" : "x") : false}
            dragElastic={0.15}
            dragConstraints={isZoomed ? { left: -800, right: 800, top: -800, bottom: 800 } : { left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (isZoomed) return;
              const offset = isMobile ? info.offset.y : info.offset.x;
              const velocity = isMobile ? info.velocity.y : info.velocity.x;
              if (offset < -90 || velocity < -500) navigate(1);
              if (offset > 90 || velocity > 500) navigate(-1);
            }}
            onClick={handleTouchOrClick}
            onTouchStart={handleTouchOrClick}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, cursor: isZoomed ? "grab" : "zoom-in" }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={springConfig}
            className="relative flex items-center justify-center bg-black/40 backdrop-blur-sm p-1 shadow-2xl border border-white/[0.06]"
          >
            <img
              src={photo.url}
              alt={photo.title}
              className="max-h-[85vh] max-w-[90vw] object-contain pointer-events-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Hearts */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, scale: 0.4, y: 15 }}
              animate={{ opacity: 1, scale: 1.4, y: -25 }}
              exit={{ opacity: 0, scale: 1.8, y: -60 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute pointer-events-none z-50 text-red-500"
              style={{ left: h.x - 32, top: h.y - 32 }}
            >
              <Heart size={64} className="fill-current" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* TOP HEADER CONTROLS */}
      <AnimatePresence>
        {hudVisible && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 inset-x-0 z-40 flex items-start justify-between p-6 bg-gradient-to-b from-[#030305]/90 to-transparent pointer-events-auto"
          >
            <div className="flex items-center gap-4">
              <MagneticButton
                onClick={() => router.push("/")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.02] text-white/70 backdrop-blur-xl border border-white/10 transition hover:bg-white/10 hover:text-white"
                title="Back to Gallery"
              >
                <X size={18} strokeWidth={1.5} />
              </MagneticButton>
              <div className="hidden sm:flex flex-col gap-1">
                <h2 className="text-lg font-serif italic tracking-wide text-white/95 truncate max-w-xs">{photo.title}</h2>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/40">Astrospectrum Archive</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full bg-white/[0.02] backdrop-blur-xl border border-white/10 font-mono text-[10px] tracking-widest text-white/60">
                {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
              </span>
              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.02] hover:bg-white/10 backdrop-blur-xl border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] transition text-white/70 hover:text-white"
              >
                <Info size={14} strokeWidth={1.5} />
                <span className="hidden sm:inline">Index & Meta</span>
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM FLOATING DOCK */}
      <AnimatePresence>
        {hudVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-8 inset-x-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-full bg-[#030305]/60 backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
              <MagneticButton
                onClick={() => navigate(-1)}
                className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/[0.05] transition"
                title="Previous Frame"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </MagneticButton>

              <div className="w-[1px] h-3 bg-white/10 mx-1" />

              <MagneticButton
                onClick={toggleLike}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/[0.05] transition group"
              >
                <Heart size={16} strokeWidth={engagement.viewerLiked ? 0 : 1.5} className={`transition-all ${engagement.viewerLiked ? "text-red-500 fill-current scale-110" : "text-white/50 group-hover:text-white"}`} />
                <span className="text-[10px] font-mono tracking-widest text-white/70">{engagement.likeCount}</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/[0.05] transition group"
              >
                <Star size={16} strokeWidth={1.5} className="text-white/50 group-hover:text-yellow-400 transition-colors" />
                <span className="text-[10px] font-mono tracking-widest text-white/70">{engagement.ratingAverage.toFixed(1)}</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/[0.05] transition group"
              >
                <MessageCircle size={16} strokeWidth={1.5} className="text-white/50 group-hover:text-white" />
                <span className="text-[10px] font-mono tracking-widest text-white/70">{engagement.commentCount}</span>
              </MagneticButton>

              <div className="w-[1px] h-3 bg-white/10 mx-1" />

              <MagneticButton
                onClick={handleDownload}
                className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/[0.05] transition"
                title="Acquire Asset"
              >
                <Download size={16} strokeWidth={1.5} />
              </MagneticButton>

              {!isMobile && (
                <MagneticButton
                  onClick={toggleZoom}
                  className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/[0.05] transition"
                  title={isZoomed ? "Contract" : "Expand"}
                >
                  {isZoomed ? <Minimize2 size={16} strokeWidth={1.5} /> : <Maximize2 size={16} strokeWidth={1.5} />}
                </MagneticButton>
              )}

              <div className="w-[1px] h-3 bg-white/10 mx-1" />

              <MagneticButton
                onClick={() => navigate(1)}
                className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/[0.05] transition"
                title="Next Frame"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="absolute inset-0 z-50 bg-[#030305]/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#060608] border-l border-white/[0.06] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-white/40" />
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">Exhibit Data</h3>
                </div>
                <MagneticButton
                  onClick={() => setShowDrawer(false)}
                  className="p-2 rounded-full text-white/50 hover:text-white transition"
                >
                  <X size={18} strokeWidth={1.5} />
                </MagneticButton>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                <div>
                  <h2 className="text-3xl font-serif tracking-wide text-white/90 mb-3">{photo.title}</h2>
                  {photo.authorName && (
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-2">Lens of {photo.authorName}</p>
                  )}
                  <p className="text-xs text-white/40 flex items-center gap-2 mb-6">
                    <MapPin size={12} className="text-white/30" /> {photo.location || "Undisclosed Coordinates"}
                  </p>
                  
                  <MagneticButton
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/[0.03] hover:bg-white text-white hover:text-black border border-white/[0.08] text-[10px] font-mono uppercase tracking-[0.2em] transition-all"
                  >
                    <Download size={14} strokeWidth={1.5} /> Acquire High-Res Master
                  </MagneticButton>
                </div>

                {metadata.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-white/40">
                      <Camera size={12} /> Exposure Telemetry
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {metadata.map((meta, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono tracking-widest text-white/60">
                          {meta}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Curator Rating</p>
                  <div className="flex items-center gap-4">
                    <StarRating value={engagement.viewerRating ?? 0} onSelect={handleRating} />
                    <div className="text-[10px] font-mono tracking-widest text-white/50 border-l border-white/10 pl-4">
                      <span className="text-white/90 font-bold">{engagement.ratingAverage.toFixed(1)}</span> / 5.0 
                      <span className="text-white/30 ml-1">({engagement.ratingCount})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-3 border-t border-white/[0.06]">
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <MessageCircle size={12} /> Discourse ({engagement.commentCount})
                  </h4>
                  <CommentsList photoId={photo.id} setEngagement={setEngagement} isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />
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
  isAuthLoading
}: {
  photoId: number;
  setEngagement: React.Dispatch<React.SetStateAction<Engagement>>;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
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
    <div className="flex flex-col gap-4">
      {isAuthLoading ? (
        <div className="h-11 w-full bg-white/[0.02] border border-white/[0.06] animate-pulse" />
      ) : isLoggedIn ? (
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 h-11 px-3 text-xs font-serif italic bg-white/[0.02] border border-white/[0.08] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors rounded-none"
            placeholder="Add to the discourse..."
          />
          <button
            onClick={submit}
            disabled={submitting || !comment.trim()}
            className="h-11 px-5 bg-white/[0.05] border border-white/[0.08] text-white/70 text-[10px] font-mono tracking-widest uppercase transition-colors hover:bg-white hover:text-black disabled:opacity-30 rounded-none flex items-center justify-center min-w-[70px]"
          >
            {submitting ? <KineticLoader /> : "Post"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google", { callbackUrl: window.location.pathname })}
          className="w-full border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 transition hover:bg-white hover:text-black rounded-none"
        >
          Authenticate to Contribute
        </button>
      )}

      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="flex justify-center py-6">
            <KineticLoader />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-[10px] text-white/30 text-center py-6 font-mono tracking-widest uppercase">Silence in the gallery.</p>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="flex gap-3 group">
              <img
                src={item.user.customImage || item.user.image || "/default-pfp.png"}
                alt=""
                className="h-7 w-7 rounded-none object-cover border border-white/[0.08] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-0.5">{item.user.name || "Anonymous"}</p>
                <p className="text-xs font-serif text-white/80 break-words leading-relaxed">{item.body ?? item.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}