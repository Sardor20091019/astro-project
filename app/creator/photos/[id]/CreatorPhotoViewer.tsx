/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
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
  Edit3,
  Trash2,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submitComment as submitCommentAction } from "@/app/actions/comments";
import StarRating from "@/components/StarRating";


type CreatorPhoto = {
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
  status: "APPROVED" | "PENDING" | "REJECTED";
  views?: number;
  category?: string;
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

const Spinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white"
  />
);

export default function CreatorPhotoViewer({
  photos,
  initialId,
  initialEngagement,
  session,
}: {
  photos: CreatorPhoto[];
  initialId: number;
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const photo = photos[index];
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const [currentScale, setCurrentScale] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  const rotate = useTransform(x, [-300, 0, 300], isZoomed ? [0, 0, 0] : [-2, 0, 2]);

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

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
    if (showDrawer) {
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
  }, [showDrawer, index]);

  const navigate = useCallback(
    (nextDirection: number) => {
      if (photos.length === 0 || isZoomed) return;
      x.set(0);
      y.set(0);
      scale.set(1);
      setDirection(nextDirection);
      setIndex((current) => {
        const nextIndex = (current + nextDirection + photos.length) % photos.length;
        window.history.replaceState(null, "", `/creator/photos/${photos[nextIndex].id}`);
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
      if (event.key === "ArrowLeft" && !isZoomed) navigate(-1);
      if (event.key === "ArrowRight" && !isZoomed) navigate(1);
      if (event.key === "Escape") {
        if (scale.get() > 1.05) {
          scale.set(1);
          x.set(0);
          y.set(0);
        } else if (showDrawer) {
          setShowDrawer(false);
        } else {
          router.push("/creator/photos");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, router, showDrawer, scale, x, y, isZoomed]);

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/creator/photos/${photo.id}/delete`, { method: "POST" });
      if (res.ok) {
        router.push("/creator/photos");
        router.refresh();
      } else {
        alert("Failed to delete photo.");
        setIsDeleting(false);
      }
    } catch {
      alert("Something went wrong.");
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: photo.title, url: shareUrl });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
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

  if (!photo) return <div className="p-8 text-white bg-black min-h-screen">Photo not found.</div>;

  const metadata = [
    photo.camera,
    photo.focalLength,
    photo.aperture,
    photo.shutter,
    photo.iso ? `ISO ${photo.iso}` : null,
  ].filter(Boolean);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "PENDING": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "REJECTED": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      default: return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-black text-white select-none">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />

      {/* STAGE CONTAINER */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden w-full h-full p-4 md:p-12">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={photo.id}
            custom={direction}
            style={{ x, y, rotate, scale }}
            drag={mounted ? true : false}
            dragConstraints={isZoomed ? constraints : { left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (isZoomed) return;
              const offset = info.offset.x;
              const velocity = info.velocity.x;
              if (offset < -70 || velocity < -400) navigate(1);
              if (offset > 70 || velocity > 400) navigate(-1);
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: scale.get(), cursor: isZoomed ? "grab" : "zoom-in" }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={springConfig}
            className="relative flex items-center justify-center touch-none"
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-md z-20 rounded-xl overflow-hidden min-w-[300px] min-h-[300px]">
                <div className="flex flex-col items-center gap-3">
                  <Spinner />
                  <span className="text-xs font-medium text-zinc-400">Loading preview...</span>
                </div>
              </div>
            )}
            <img
              ref={imgRef}
              src={photo.url}
              alt={photo.title}
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              className={`max-h-[85vh] max-w-[90vw] object-contain rounded-lg transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-20 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md shadow-2xl text-xs font-medium text-white"
            >
              <Check size={14} className="text-emerald-400" /> Link copied to clipboard
            </motion.div>
          )}
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
            className="absolute top-0 inset-x-0 z-40 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto"
          >
            <div className="flex items-center gap-4">
              <MagneticButton
                onClick={() => router.push("/creator/photos")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-300 backdrop-blur-md border border-zinc-800 transition hover:bg-zinc-800 hover:text-white"
                title="Back to Portfolio"
              >
                <X size={18} strokeWidth={2} />
              </MagneticButton>
              <div className="hidden sm:flex items-center gap-3">
                <h2 className="text-sm font-medium text-zinc-200 truncate max-w-xs">{photo.title}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(photo.status)}`}>
                  {photo.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-xs font-medium text-zinc-400">
                {index + 1} / {photos.length}
              </span>
              <MagneticButton
                onClick={() => setShowDrawer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-zinc-800 text-xs font-medium transition text-zinc-300 hover:text-white"
              >
                <Info size={14} strokeWidth={2} />
                <span className="hidden sm:inline">Management</span>
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
            <div className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 shadow-2xl">
              <MagneticButton
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
                title="Previous"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </MagneticButton>

              <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

              <div className="flex items-center gap-1.5 px-3 py-2 text-zinc-300">
                <Heart size={15} className="text-red-500 fill-current" />
                <span className="text-xs font-medium">{engagement.likeCount}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-2 text-zinc-300">
                <Eye size={15} className="text-zinc-400" />
                <span className="text-xs font-medium">{photo.views || 0}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-2 text-zinc-300">
                <Star size={15} className="text-amber-400" />
                <span className="text-xs font-medium">{(engagement?.ratingAverage ?? 0).toFixed(1)}</span>
              </div>

              <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

              <MagneticButton
                onClick={() => router.push(`/creator/photos/${photo.id}/edit`)}
                className="p-2.5 rounded-full text-zinc-400 hover:text-blue-400 hover:bg-zinc-800/50 transition"
                title="Edit Photo"
              >
                <Edit3 size={16} strokeWidth={2} />
              </MagneticButton>

              <MagneticButton
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2.5 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/50 transition"
                title="Delete Photo"
              >
                <Trash2 size={16} strokeWidth={2} />
              </MagneticButton>

              <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

              <MagneticButton
                onClick={handleShare}
                className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
                title="Share"
              >
                <Share2 size={16} strokeWidth={2} />
              </MagneticButton>

              <MagneticButton
                onClick={handleDownload}
                className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
                title="Download"
              >
                <Download size={16} strokeWidth={2} />
              </MagneticButton>

              {!isMobile && (
                <MagneticButton
                  onClick={toggleZoom}
                  className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
                  title={isZoomed ? "Zoom Out" : "Zoom In"}
                >
                  {isZoomed ? <Minimize2 size={16} strokeWidth={2} /> : <Maximize2 size={16} strokeWidth={2} />}
                </MagneticButton>
              )}

              <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

              <MagneticButton
                onClick={() => navigate(1)}
                className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
                title="Next"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILS & MANAGEMENT DRAWER */}
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
              className="absolute right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-zinc-950 border-l border-zinc-800/80 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/80">
                <h3 className="text-sm font-semibold text-zinc-200">Management & Details</h3>
                <MagneticButton
                  onClick={() => setShowDrawer(false)}
                  className="p-2 rounded-full text-zinc-400 hover:text-white transition"
                >
                  <X size={18} strokeWidth={2} />
                </MagneticButton>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">{photo.title}</h2>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(photo.status)}`}>
                      {photo.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 mb-6">
                    <MapPin size={14} className="text-zinc-400" /> {photo.location || "Location not specified"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => router.push(`/creator/photos/${photo.id}/edit`)}
                      className="flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 text-xs font-medium rounded-xl transition"
                    >
                      <Edit3 size={15} /> Edit Photo
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center justify-center gap-2 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-medium rounded-xl transition"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>

                {metadata.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-900">
                    <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                      <Camera size={14} /> Camera Settings
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {metadata.map((meta, i) => (
                        <div key={i} className="px-3 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-xs text-zinc-300">
                          {meta}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-zinc-900">
                  <span className="text-xs font-medium text-zinc-400">Performance Metrics</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
                      <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Views</span>
                      <strong className="text-sm font-bold text-white">{photo.views || 0}</strong>
                    </div>
                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
                      <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Likes</span>
                      <strong className="text-sm font-bold text-white">{engagement.likeCount}</strong>
                    </div>
                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
                      <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Rating</span>
                      <strong className="text-sm font-bold text-white">{(engagement?.ratingAverage ?? 0).toFixed(1)}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <h4 className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <MessageCircle size={14} /> Comments ({engagement.commentCount})
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
    fetch(`/api/photos/${photoId}/comments`)
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
        <div className="h-10 w-full bg-zinc-900 rounded-xl animate-pulse" />
      ) : isLoggedIn ? (
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 h-10 px-3.5 text-xs bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors rounded-xl"
            placeholder="Write a comment..."
          />
          <button
            onClick={submit}
            disabled={submitting || !comment.trim()}
            className="h-10 px-4 bg-white text-black text-xs font-medium transition hover:bg-zinc-200 disabled:opacity-40 rounded-xl flex items-center justify-center min-w-[64px]"
          >
            {submitting ? <Spinner /> : "Post"}
          </button>
        </div>
      ) : null}

      <div className="space-y-3 pt-2">
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">No comments yet.</p>
        ) : (
          comments.map((item) => (
            <div key={item.id} className="flex gap-3 group">
              <img
                src={item.user.customImage || item.user.image || "/default-pfp.png"}
                alt=""
                className="h-7 w-7 rounded-full object-cover border border-zinc-800 shrink-0"
              />
              <div className="flex-1 min-w-0 bg-zinc-950 border border-zinc-900 p-3 rounded-xl">
                <p className="text-xs font-medium text-zinc-300 mb-1">{item.user.name || "NOT_AVAILABLE"}</p>
                <p className="text-xs text-zinc-400 break-words leading-relaxed">{item.body ?? item.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}