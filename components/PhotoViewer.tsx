/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Sparkles,
  X,
  Star,
  Info,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submitComment as submitCommentAction } from "@/app/actions/comments";
import StarRating from "./StarRating";
import StarDisplay from "./StarDisplay";

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

const spring = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };

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
  
  // UI States
  const [hudVisible, setHudVisible] = useState(true);
  const [showCommentsMobile, setShowCommentsMobile] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const photo = photos[index];
  
  // Framer Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(isMobile ? y : x, [-300, 0, 300], [-3, 0, 3]);

  // Handle Hydration & Responsive Layout Detection
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Auto-hide HUD on mobile after 3.5 seconds
  useEffect(() => {
    if (!isMobile || !hudVisible || showCommentsMobile) return;
    const timer = setTimeout(() => setHudVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [hudVisible, isMobile, showCommentsMobile]);

  // Infinite/Looping Navigation Handler
  const navigate = useCallback(
    (nextDirection: number) => {
      if (isZoomed || photos.length === 0) return;
      setDirection(nextDirection);
      setIndex((current) => {
        // Seamless circular wrap around
        const nextIndex = (current + nextDirection + photos.length) % photos.length;
        window.history.replaceState(null, "", `/photos/${photos[nextIndex].id}`);
        setHudVisible(true);
        setShowCommentsMobile(false);
        setHearts([]);
        return nextIndex;
      });
    },
    [photos, isZoomed],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigate(-1);
      if (event.key === "ArrowRight") navigate(1);
      if (event.key === "Escape") {
        if (isZoomed) setIsZoomed(false);
        else if (showCommentsMobile) setShowCommentsMobile(false);
        else router.push("/");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, router, isZoomed, showCommentsMobile]);

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

  // Actions
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

  let lastTap = 0;
  const handleTouchOrClick = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!engagement.viewerLiked) toggleLike();
      
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      
      setHearts((prev) => [...prev, { id: Date.now(), x: clientX, y: clientY }]);
    } else {
      if (isMobile) {
        setHudVisible(!hudVisible);
      }
    }
    lastTap = now;
  };

  if (!photo) return <div className="p-8 text-(--text) bg-(--surface-1) min-h-screen">Photo not found.</div>;

  const metadata = [
    photo.camera ? `${photo.camera}` : null,
    photo.focalLength ? `${photo.focalLength}` : null,
    photo.aperture,
    photo.shutter,
    photo.iso ? `ISO ${photo.iso}` : null,
  ].filter(Boolean);

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-black md:bg-(--surface-1) text-(--text)">
      
      {/* CLOSE BUTTON */}
      <button
        onClick={() => router.push("/")}
        className="fixed left-4 top-4 md:left-6 md:top-6 z-50 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-xl border border-white/15 transition hover:bg-white hover:text-black hover:scale-105"
      >
        <X size={20} />
      </button>

      {/* MAIN PHOTO CONTAINER */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black touch-none">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.img
            key={photo.id}
            src={photo.url}
            alt={photo.title}
            custom={direction}
            style={isMobile ? { y, rotate } : { x, rotate }}
            drag={mounted ? (isZoomed ? true : isMobile ? "y" : "x") : false}
            dragElastic={isZoomed ? 0 : 0.15}
            dragConstraints={isZoomed ? { left: -500, right: 500, top: -500, bottom: 500 } : { left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (isZoomed) return;
              const offset = isMobile ? info.offset.y : info.offset.x;
              const velocity = isMobile ? info.velocity.y : info.velocity.x;
              
              if (offset < -90 || velocity < -500) navigate(1);
              if (offset > 90 || velocity > 500) navigate(-1);
            }}
            onClick={handleTouchOrClick}
            onTouchStart={handleTouchOrClick}
            initial={{ 
              opacity: 0, 
              scale: 0.9,
              x: !isMobile ? (direction > 0 ? 300 : -300) : 0,
              y: isMobile ? (direction > 0 ? 300 : -300) : 0,
              filter: "blur(8px)" 
            }}
            animate={{ 
              opacity: 1, 
              scale: isZoomed ? 2.5 : 1, 
              x: 0, y: 0, 
              filter: "blur(0px)",
              cursor: isZoomed ? "grab" : "zoom-in"
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9,
              x: !isMobile ? (direction > 0 ? -300 : 300) : 0,
              y: isMobile ? (direction > 0 ? -300 : 300) : 0,
              filter: "blur(8px)" 
            }}
            transition={spring}
            className={`max-h-full w-auto max-w-full select-none object-contain ${isMobile ? 'h-full w-full object-cover' : 'rounded-lg shadow-2xl'}`}
          />
        </AnimatePresence>

        {/* Double Tap Floating Hearts */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1.5, y: -20 }}
              exit={{ opacity: 0, scale: 2, y: -60 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute pointer-events-none z-50 text-red-500 drop-shadow-2xl"
              style={{ left: h.x - 32, top: h.y - 32 }}
            >
              <Heart size={64} className="fill-current" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Desktop Zoom Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute bottom-6 right-6 z-40 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-white hover:text-black transition"
          >
            {isZoomed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        )}
      </div>

      {/* MOBILE HUD OVERLAY */}
      <AnimatePresence>
        {isMobile && hudVisible && !showCommentsMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-end pb-8 px-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          >
            {/* Right Action Bar */}
            <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6 pointer-events-auto">
              <button onClick={toggleLike} className="group flex flex-col items-center gap-1">
                <div className={`p-3 rounded-full backdrop-blur-md border transition ${engagement.viewerLiked ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-black/30 border-white/20 text-white'}`}>
                  <Heart size={24} className={engagement.viewerLiked ? "fill-current" : ""} />
                </div>
                <span className="text-xs font-bold drop-shadow-md text-white">{engagement.likeCount}</span>
              </button>
              
              <button onClick={() => setShowCommentsMobile(true)} className="group flex flex-col items-center gap-1">
                <div className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white transition hover:bg-white hover:text-black">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-bold drop-shadow-md text-white">{engagement.commentCount}</span>
              </button>

              <button onClick={() => setShowCommentsMobile(true)} className="group flex flex-col items-center gap-1">
                <div className="p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-yellow-400">
                  <Star size={24} className="fill-current" />
                </div>
                <span className="text-xs font-bold drop-shadow-md text-white">{engagement.ratingAverage.toFixed(1)}</span>
              </button>
            </div>

            {/* Bottom Metadata Block */}
            <div className="w-[75%] pointer-events-auto space-y-2">
              <h1 className="text-2xl font-black text-white drop-shadow-lg">{photo.title}</h1>
              {photo.authorName && <p className="text-sm font-bold text-white/90">📸 {photo.authorName}</p>}
              <p className="text-xs text-white/75 flex items-center gap-1 drop-shadow-md">
                <MapPin size={12} /> {photo.location || "Unknown Location"}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {metadata.map((meta, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded text-white">
                    {meta}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE COMMENTS & RATING SHEET */}
      <AnimatePresence>
        {isMobile && showCommentsMobile && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute inset-x-0 bottom-0 z-50 h-[75vh] rounded-t-3xl bg-(--surface-1) border-t border-(--card-border) shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-(--card-border)">
              <h3 className="font-bold text-sm uppercase tracking-wider">Photo Engagement</h3>
              <button onClick={() => setShowCommentsMobile(false)} className="p-2 bg-(--surface-2) rounded-full">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Star Rating Section inside Mobile Sheet */}
              <div className="p-4 rounded-2xl bg-(--surface-2) border border-(--card-border) flex flex-col items-center justify-center gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-(--text-muted)">Rate this photograph</p>
                <StarRating value={engagement.viewerRating ?? 0} onSelect={handleRating} />
                <span className="text-[11px] font-bold text-(--text-muted) mt-1">
                  Community Average: {engagement.ratingAverage.toFixed(1)} / 5 ({engagement.ratingCount} reviews)
                </span>
              </div>

              {/* Comments Section */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageCircle size={14} /> Comments ({engagement.commentCount})
                </h4>
                <CommentsList photoId={photo.id} setEngagement={setEngagement} isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR (Split Pane) */}
      {!isMobile && (
        <div className="hidden md:flex w-[420px] shrink-0 flex-col border-l border-(--card-border) bg-(--surface-1) shadow-2xl z-30 h-full">
          
          {/* Header & Meta */}
          <div className="p-6 border-b border-(--card-border) overflow-y-auto max-h-[50vh] scrollbar-hide">
            <div className="mb-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-red-500/80">
              <span className="flex items-center gap-1.5"><Sparkles size={13} /> Frame {index + 1} / {photos.length}</span>
              <span className="text-(--text-muted)">Loop Enabled</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">{photo.title}</h1>
            
            <div className="space-y-2 text-sm text-(--text-muted) mb-6">
              <p className="flex gap-2 items-center">
                <MapPin className="text-red-400" size={16} />
                <span>{photo.location || "Unknown location"}</span>
              </p>
              {metadata.length > 0 && (
                <div className="flex gap-2 items-start mt-3">
                  <Camera className="text-red-400 mt-1 shrink-0" size={16} />
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.map((meta, i) => (
                      <span key={i} className="px-2 py-1 bg-(--surface-2) rounded border border-(--card-border) text-xs font-medium">
                        {meta}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-4 border-t border-(--card-border) pt-5">
              <button
                onClick={toggleLike}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition ${
                  engagement.viewerLiked
                    ? "bg-red-500/10 border-red-500/50 text-red-500"
                    : "bg-(--surface-2) border-(--card-border) hover:border-red-400/50"
                }`}
              >
                <Heart size={18} className={engagement.viewerLiked ? "fill-current" : ""} />
                {engagement.likeCount} Likes
              </button>
              
              <div className="flex-1 flex flex-col items-center bg-(--surface-2) rounded-xl border border-(--card-border) p-2">
                <StarRating value={engagement.viewerRating ?? 0} onSelect={handleRating} />
                <span className="text-[10px] font-bold text-(--text-muted) mt-1">{engagement.ratingAverage.toFixed(1)} / 5</span>
              </div>
            </div>
          </div>

          {/* Desktop Comments Section */}
          <div className="flex-1 flex flex-col p-6 bg-(--surface-2)/30 overflow-hidden">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4">
              <MessageCircle size={15} /> Comments ({engagement.commentCount})
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-(--card-border)">
              <CommentsList photoId={photo.id} setEngagement={setEngagement} isLoggedIn={isLoggedIn} isAuthLoading={isAuthLoading} />
            </div>
          </div>
        </div>
      )}

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
    <div className="flex flex-col h-full gap-4">
      {/* Input Area */}
      {isAuthLoading ? (
        <div className="h-12 w-full rounded-xl bg-(--card-border) animate-pulse" />
      ) : isLoggedIn ? (
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 h-11 px-4 text-sm rounded-xl bg-(--surface-2) border border-(--card-border) text-(--text) focus:outline-none focus:border-red-400"
            placeholder="Add a comment..."
          />
          <button
            onClick={submit}
            disabled={submitting || !comment.trim()}
            className="h-11 px-4 rounded-xl bg-(--text) text-(--surface-1) font-bold text-xs uppercase transition hover:bg-red-500 hover:text-white disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Post"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google", { callbackUrl: window.location.pathname })}
          className="w-full rounded-xl border border-(--card-border) bg-(--surface-2) px-4 py-3 text-xs font-bold uppercase text-(--text-muted) transition hover:border-red-400"
        >
          Sign in to comment
        </button>
      )}

      {/* List */}
      <div className="space-y-4 pb-4">
        {loading ? (
          <Loader2 className="animate-spin mx-auto text-(--text-muted) mt-4" />
        ) : comments.length === 0 ? (
          <p className="text-sm text-(--text-muted) text-center mt-4 flex items-center justify-center gap-2">
            <Info size={16} /> No comments yet.
          </p>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.user.customImage || item.user.image || "/default-pfp.png"}
                alt=""
                className="h-8 w-8 rounded-full object-cover border border-(--card-border) shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-(--text)">{item.user.name || "Guest"}</p>
                <p className="text-sm text-(--text-muted) break-words mt-0.5">{item.body ?? item.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}