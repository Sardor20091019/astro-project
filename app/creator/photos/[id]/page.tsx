"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, use } from "react";
import { photos, CATEGORIES } from "@/data/photos";
import Link from "next/link";
import { ArrowLeft, MapPin, Download, Camera, Clock, Aperture, Disc, Calendar, ChevronLeft, ChevronRight, Share2, Check, X } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PhotoDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const photoId = parseInt(id, 10);
  const currentIndex = photos.findIndex((p) => p.id === photoId);
  
  if (currentIndex === -1) {
    notFound();
  }

  const photo = photos[currentIndex];
  
  // Looping indices (wraps around: first goes to last, last goes to first)
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
  const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
  const prevPhoto = photos[prevIndex];
  const nextPhoto = photos[nextIndex];
  
  const categoryObj = CATEGORIES.find((c) => c.value === photo.category);

  // Keyboard Navigation Support (Looping & Escape Fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        return;
      }
      
      // Only trigger gallery navigation when NOT in fullscreen mode
      if (!isFullscreen) {
        if (e.key === "ArrowLeft") {
          router.push(`/creator/photos/${prevPhoto.id}`);
        } else if (e.key === "ArrowRight") {
          router.push(`/creator/photos/${nextPhoto.id}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, prevPhoto, nextPhoto, router]);

  // Mobile Swipe Handling (Looping)
  const handleDragEnd = (e: any, { offset }: any) => {
    if (isFullscreen) return;
    const swipeThreshold = 50;
    if (offset.x > swipeThreshold) {
      router.push(`/creator/photos/${prevPhoto.id}`);
    } else if (offset.x < -swipeThreshold) {
      router.push(`/creator/photos/${nextPhoto.id}`);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: photo.title,
      text: `Check out ${photo.title} from Astrospectrum gallery`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="main-wrapper py-6 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <Link
          href="/creator/photos"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--text-dim) hover:text-(--text) transition-colors"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Gallery Archive</span><span className="sm:hidden">Back</span>
        </Link>

        {/* Looping Prev / Next Switcher & Counter */}
        <div className="flex items-center gap-2">
          <Link
            href={`/creator/photos/${prevPhoto.id}`}
            className="flex items-center gap-1 px-3 py-2 sm:py-1.5 rounded-xl border border-(--border) bg-(--surface) text-xs font-mono text-(--text-dim) hover:text-(--text) hover:bg-(--surface-2) transition"
            title="Previous Frame"
          >
            <ChevronLeft size={14} /> <span className="hidden sm:inline">Prev</span>
          </Link>

          <span className="font-mono text-xs text-(--text-muted) px-2">
            {currentIndex + 1} / {photos.length}
          </span>

          <Link
            href={`/creator/photos/${nextPhoto.id}`}
            className="flex items-center gap-1 px-3 py-2 sm:py-1.5 rounded-xl border border-(--border) bg-(--surface) text-xs font-mono text-(--text-dim) hover:text-(--text) hover:bg-(--surface-2) transition"
            title="Next Frame"
          >
            <span className="hidden sm:inline">Next</span> <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Immersive Image Container (Swipeable on Mobile) */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-(--border) bg-(--surface) shadow-2xl flex items-center justify-center p-2 sm:p-4 touch-pan-y relative group">
          
          {/* Desktop Hover Arrows */}
          <div className="absolute left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block pointer-events-none">
            <Link href={`/creator/photos/${prevPhoto.id}`} className="pointer-events-auto bg-black/60 p-3 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-black/90 transition shadow-lg flex items-center justify-center">
              <ChevronLeft size={24} />
            </Link>
          </div>
          
          <div className="absolute right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block pointer-events-none">
            <Link href={`/creator/photos/${nextPhoto.id}`} className="pointer-events-auto bg-black/60 p-3 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-black/90 transition shadow-lg flex items-center justify-center">
              <ChevronRight size={24} />
            </Link>
          </div>

          <div className="relative w-full overflow-hidden rounded-2xl bg-black/40 flex items-center justify-center min-h-[320px] sm:min-h-[480px] max-h-[80vh]">
            <AnimatePresence mode="popLayout" custom={currentIndex}>
              <motion.img
                key={photo.id}
                src={photo.src}
                alt={photo.title}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                onClick={() => setIsFullscreen(true)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-auto max-h-[75vh] object-contain select-none cursor-zoom-in hover:opacity-95 transition"
                title="Click to view fullscreen"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Metadata & EXIF Specs */}
        <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface) p-5 sm:p-8 shadow-2xl flex flex-col gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {categoryObj && (
                <span className="text-[10px] font-black uppercase tracking-[0.16em] bg-(--surface-2) border border-(--border) text-(--accent) px-3 py-1.5 rounded-xl">
                  {categoryObj.icon} {categoryObj.label}
                </span>
              )}
              <span className="font-mono text-[10px] tracking-widest text-(--text-muted) px-3 py-1.5 rounded-xl bg-(--surface-2) border border-(--border)">
                FRAME #{String(photo.id).padStart(2, "0")}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-(--text) mb-2 leading-tight">
              {photo.title}
            </h1>

            {photo.location && (
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-(--text-dim) mt-2">
                <MapPin size={14} className="text-(--accent) shrink-0" />
                <span className="truncate">{photo.location}</span>
              </div>
            )}
          </div>

          <hr className="border-(--border)" />

          {/* Technical EXIF Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-(--surface-2) border border-(--border)/60 flex flex-col gap-1">
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-(--text-muted)">
                <Camera size={12} className="text-(--accent)" /> Camera
              </span>
              <span className="text-xs font-bold text-(--text) truncate" title={photo.camera}>{photo.camera || "Xiaomi 15T Pro"}</span>
            </div>

            <div className="p-3 rounded-2xl bg-(--surface-2) border border-(--border)/60 flex flex-col gap-1">
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-(--text-muted)">
                <Aperture size={12} className="text-(--accent)" /> Aperture
              </span>
              <span className="text-xs font-mono font-bold text-(--text)">{photo.aperture || "f/1.7"}</span>
            </div>

            <div className="p-3 rounded-2xl bg-(--surface-2) border border-(--border)/60 flex flex-col gap-1">
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-(--text-muted)">
                <Clock size={12} className="text-(--accent)" /> Shutter Speed
              </span>
              <span className="text-xs font-mono font-bold text-(--text)">{photo.shutter || "1/250s"}</span>
            </div>

            <div className="p-3 rounded-2xl bg-(--surface-2) border border-(--border)/60 flex flex-col gap-1">
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-(--text-muted)">
                <Disc size={12} className="text-(--accent)" /> Sensitivity
              </span>
              <span className="text-xs font-mono font-bold text-(--text)">{photo.iso || "ISO 100"}</span>
            </div>
          </div>

          {photo.date && (
            <div className="flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl bg-(--surface-2)/50 border border-(--border)/40">
              <span className="text-(--text-muted) uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={12} /> Captured Date
              </span>
              <span className="font-mono text-(--text)">{photo.date}</span>
            </div>
          )}

          {/* Action Buttons: Download & Share */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={photo.src}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-(--text) text-(--bg) text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg"
            >
              <Download size={15} /> Download
            </a>
            
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-(--surface-2) border border-(--border) text-(--text) text-xs font-bold uppercase tracking-widest hover:bg-(--surface-3) hover:border-(--border-hover) transition"
            >
              {copied ? <Check size={15} className="text-green-400" /> : <Share2 size={15} />}
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition shadow-lg"
              title="Close Fullscreen (Esc)"
            >
              <X size={24} />
            </button>

            {/* Fullscreen Image */}
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={photo.src}
              alt={photo.title}
              className="max-w-full max-h-[92vh] object-contain select-none shadow-2xl rounded-xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}