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

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      // Swipe left -> Next photo
      setIndex((i) => (i + 1) % photos.length);
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> Prev photo
      setIndex((i) => (i - 1 + photos.length) % photos.length);
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
      }
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