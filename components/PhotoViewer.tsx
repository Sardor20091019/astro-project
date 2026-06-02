/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Heart, Loader2, MapPin, MessageCircle, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitComment as submitCommentAction } from "@/app/actions/comments";
import StarRating from "./StarRating";
import StarDisplay from "./StarDisplay";

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

const spring = { type: "spring" as const, stiffness: 115, damping: 23, mass: 0.9 };

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
  const isAuthLoading = sessionStatus === "loading" && !session;
  const initialIndex = useMemo(() => photos.findIndex((photo) => photo.id === initialId), [photos, initialId]);
  const [index, setIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [direction, setDirection] = useState(0);
  const [engagement, setEngagement] = useState<Engagement>(initialEngagement);
  const photo = photos[index];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-2.5, 0, 2.5]);

  const navigate = useCallback(
    (nextDirection: number) => {
      setDirection(nextDirection);
      setIndex((current) => {
        const nextIndex = Math.min(photos.length - 1, Math.max(0, current + nextDirection));
        if (nextIndex !== current) {
          window.history.replaceState(null, "", `/photos/${photos[nextIndex].id}`);
        }
        return nextIndex;
      });
    },
    [photos],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigate(-1);
      if (event.key === "ArrowRight") navigate(1);
      if (event.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, router]);

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

  if (!photo) {
    return <div className="p-8 text-white">Photo not found.</div>;
  }

  const metadata = [
    photo.camera ? `Camera: ${photo.camera}` : null,
    photo.iso ? `ISO ${photo.iso}` : null,
    photo.aperture,
    photo.shutter,
    photo.focalLength ? `Focal Length: ${photo.focalLength}` : null,
  ].filter(Boolean);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={`wash-${photo.id}`}
          className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-110"
          style={{ backgroundImage: `url(${photo.url})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(to_bottom,rgba(0,0,0,0.1),#000_88%)]" />

      <button
        type="button"
        onClick={() => router.push("/")}
        className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/70 backdrop-blur-2xl transition hover:scale-105 hover:bg-white hover:text-black"
        aria-label="Close lightbox"
      >
        <X size={18} />
      </button>

      <button
        type="button"
        disabled={index === 0}
        onClick={() => navigate(-1)}
        className="fixed left-4 top-1/2 z-40 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/75 backdrop-blur-2xl transition hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-20 md:flex"
        aria-label="Previous photo"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        type="button"
        disabled={index === photos.length - 1}
        onClick={() => navigate(1)}
        className="fixed right-4 top-1/2 z-40 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/75 backdrop-blur-2xl transition hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-20 md:flex"
        aria-label="Next photo"
      >
        <ChevronRight size={24} />
      </button>

      <div className="relative z-10 grid min-h-screen grid-rows-[1fr_auto] px-4 pb-5 pt-20 md:px-10 md:pb-8">
        <div className="flex min-h-0 items-center justify-center">
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.img
              key={photo.id}
              src={photo.url}
              alt={photo.title}
              custom={direction}
              style={{ x, rotate }}
              drag="x"
              dragElastic={0.16}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -90 || info.velocity.x < -550) navigate(1);
                if (info.offset.x > 90 || info.velocity.x > 550) navigate(-1);
              }}
              initial={{ opacity: 0, x: direction >= 0 ? 150 : -150, scale: 0.96, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction >= 0 ? -150 : 150, scale: 0.96, filter: "blur(10px)" }}
              transition={spring}
              className="max-h-[63vh] w-auto max-w-full select-none rounded-[1.75rem] border border-white/10 object-contain shadow-[0_30px_120px_rgba(0,0,0,0.75)] md:max-h-[72vh]"
            />
          </AnimatePresence>
        </div>

        <motion.section
          key={`meta-${photo.id}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.06 }}
          className="mx-auto grid w-full max-w-7xl gap-4 rounded-[2rem] border border-white/10 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-2xl md:grid-cols-[1.1fr_0.9fr] md:p-5"
        >
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-red-300/90">
              <Sparkles size={13} />
              Frame {index + 1} / {photos.length}
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">{photo.title}</h1>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/65">
              <p className="flex gap-2">
                <MapPin className="mt-0.5 shrink-0 text-red-400" size={16} />
                <span>{photo.location || "Unknown location"}{photo.coordinates ? ` (${photo.coordinates})` : ""}</span>
              </p>
              <p className="flex gap-2">
                <Camera className="mt-0.5 shrink-0 text-red-400" size={16} />
                <span>{metadata.join(" | ").replace(" | ISO", " | ISO").replaceAll(" | f", " • f")}</span>
              </p>
            </div>
          </div>

          <EngagementPanel
            photoId={photo.id}
            engagement={engagement}
            setEngagement={setEngagement}
            isLoggedIn={Boolean(authSession)}
            isAuthLoading={isAuthLoading}
          />
        </motion.section>
      </div>
    </div>
  );
}

function EngagementPanel({
  photoId,
  engagement,
  setEngagement,
  isLoggedIn,
  isAuthLoading,
}: {
  photoId: number;
  engagement: Engagement;
  setEngagement: (engagement: Engagement | ((current: Engagement) => Engagement)) => void;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
}) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?photoId=${photoId}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } finally {
      setLoadingComments(false);
    }
  }, [photoId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

const toggleLike = async () => {
    // 1. Optimistic update
    setEngagement((current) => ({
      ...current,
      viewerLiked: !current.viewerLiked,
      likeCount: Math.max(0, current.likeCount + (current.viewerLiked ? -1 : 1)),
    }));

    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });

    const data = await res.json();
    
    // DEBUG: Add this log
    console.log("API Response received:", data); 

    if (res.ok) {
      setEngagement((current) => ({ 
        ...current, 
        viewerLiked: data.liked, 
        likeCount: data.likeCount 
      }));
    } else {
      console.error("API failed, reverting state...");
    }
};

  const ratePhoto = async (value: number) => {
    setEngagement((current) => ({ ...current, viewerRating: value }));
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, value }),
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

  const submitComment = async () => {
    if (!comment.trim()) return;
    if (!isLoggedIn) {
      setCommentError("Please sign in before posting a comment.");
      return;
    }

    setSubmitting(true);
    setCommentError("");
    try {
      const result = await submitCommentAction(photoId, comment);

      if (!result.ok) {
        setCommentError(result.error === "UNAUTHORIZED" ? "Please sign in before posting a comment." : "Please write a longer comment.");
        return;
      }

      setComment("");
      setComments((current) => [result.comment, ...current]);
      setEngagement((current) => ({ ...current, commentCount: result.commentCount }));
    } catch {
      setCommentError("Comment submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
        <button
          type="button"
          onClick={toggleLike}
          className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition ${
            engagement.viewerLiked
              ? "border-red-400/50 bg-red-500/15 text-red-200"
              : "border-white/10 bg-white/[0.04] text-white/75 hover:border-red-400/50 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Heart size={17} className={engagement.viewerLiked ? "fill-red-500 text-red-500" : "group-hover:text-red-400"} />
            Like
          </span>
          <span>{engagement.likeCount}</span>
        </button>

        <div>
          <StarRating value={engagement.viewerRating ?? 0} onSelect={ratePhoto} />
          <div className="mt-3">
            <StarDisplay rating={engagement.ratingAverage} total={engagement.ratingCount} />
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em]">
            <MessageCircle size={15} /> Comments
          </h2>
          <span className="text-xs text-white/35">{engagement.commentCount}</span>
        </div>

        {isAuthLoading ? (
          <div className="h-11 rounded-2xl border border-white/10 bg-white/[0.04]" />
        ) : isLoggedIn ? (
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="input h-11 flex-1 rounded-2xl bg-white/[0.06]"
              placeholder="Write a thoughtful comment..."
            />
            <button
              type="button"
              disabled={submitting || !comment.trim()}
              onClick={submitComment}
              className="rounded-2xl bg-white px-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-red-500 hover:text-white disabled:opacity-35"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "Post"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: window.location.pathname })}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/60 transition hover:border-red-400/50 hover:text-white"
          >
            Sign in to write a comment
          </button>
        )}

        {commentError ? (
          <p className="mt-2 text-xs font-medium text-red-300">{commentError}</p>
        ) : null}

        <div className="mt-4 max-h-36 space-y-3 overflow-y-auto pr-1">
          {loadingComments ? (
            <p className="text-sm text-white/35">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-white/35">No comments yet.</p>
          ) : (
            comments.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-white/5 pb-3 last:border-0">
                <img
                  src={item.user.customImage || item.user.image || "/default-pfp.png"}
                  alt=""
                  className="h-8 w-8 rounded-full border border-white/10 object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white/85">{item.user.name || "Guest artist"}</p>
                  <p className="text-sm leading-5 text-white/55">{item.body ?? item.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
