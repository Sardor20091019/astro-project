/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Heart, Star, MessageCircle, Plus, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";

interface PhotosClientViewProps {
  initialPhotos: any[];
  activeCategory: string;
  activeSort: string;
  currentPage: number;
  totalPages: number;
  categories: { label: string; value: string }[];
  sortOptions: { label: string; value: string }[];
}

export default function PhotosClientView({
  initialPhotos,
  activeCategory,
  activeSort,
  currentPage = 1,
  totalPages = 1,
  categories,
  sortOptions,
}: PhotosClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const currentSortLabel = sortOptions.find((opt) => opt.value === activeSort)?.label || "Sort";

  const handleCategoryChange = (catValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catValue === "ALL") {
      params.delete("category");
    } else {
      params.set("category", catValue);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`/photos?${params.toString()}`);
  };

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortValue === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", sortValue);
    }
    params.delete("page"); // Reset to page 1 on sort change
    router.push(`/photos?${params.toString()}`);
    setIsSortOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    router.push(`/photos?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers array for pagination buttons
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col items-center selection:bg-(--accent) selection:text-(--bg)">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-(--border) bg-(--bg)/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-(--text-dim) hover:text-(--text) transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col items-center text-center gap-10">
        
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-(--text)">
          Gallery
        </h1>

        {/* Filters, Sort & Submit Frame Bar */}
        <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-5 bg-(--surface) border border-(--border) p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-xl relative z-30">
          
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center xl:justify-start flex-wrap gap-3 w-full xl:w-auto overflow-x-auto">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-7 py-4 rounded-2xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap border cursor-pointer ${
                    isActive
                      ? "bg-(--accent) text-(--bg) border-(--accent) font-bold shadow-md"
                      : "bg-(--surface-2) text-(--text-dim) border-(--border) hover:bg-(--surface-3) hover:text-(--text)"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right Side: Custom Sort Dropdown & Submit Button */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-end shrink-0">
            
            {/* Custom Sort Menu */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-3 bg-(--surface-2) border border-(--border) px-6 py-4 rounded-2xl font-mono text-[10px] uppercase tracking-[0.15em] text-(--text) font-bold hover:bg-(--surface-3) transition-all cursor-pointer shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4 text-(--accent)" />
                <span>{currentSortLabel}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-(--text-dim) transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(4px)" }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-3 w-52 rounded-2xl bg-(--surface) border border-(--border) p-2 shadow-2xl z-50 backdrop-blur-2xl"
                  >
                    <div className="flex flex-col gap-1">
                      {sortOptions.map((opt) => {
                        const isSelected = activeSort === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleSortChange(opt.value)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.15em] transition-all cursor-pointer ${
                              isSelected
                                ? "bg-(--accent) text-(--bg) font-bold shadow-md"
                                : "text-(--text-dim) hover:bg-(--surface-2) hover:text-(--text)"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-(--text) text-(--bg) font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-(--accent) hover:text-(--bg) transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Submit Frame
            </button>
          </div>
        </div>

        {/* Photo Display Area */}
        {initialPhotos.length === 0 ? (
          <div className="w-full max-w-xl border border-dashed border-(--border) rounded-3xl py-24 px-6 text-center flex flex-col items-center justify-center gap-5 bg-(--surface) backdrop-blur-md mt-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-(--text-muted)">
              No frames found matching your criteria.
            </p>
            <button
              onClick={() => router.push("/photos")}
              className="px-6 py-3 rounded-xl bg-(--surface-2) hover:bg-(--surface-3) text-(--text) font-mono text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer border border-(--border)"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center items-stretch gap-8 w-full max-w-7xl mt-4">
              {initialPhotos.map((photo, index) => {
                const exifLine = [photo.camera, photo.focalLength, photo.aperture, photo.shutter]
                  .filter(Boolean)
                  .join(" / ");

                return (
                  <article 
                    key={photo.id}
                    className="group relative overflow-hidden rounded-3xl border border-(--border) bg-(--surface) hover:border-(--border-hover) transition-all duration-500 flex flex-col text-left shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:-translate-y-1 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] max-w-md"
                  >
                    {/* Image Frame */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-(--surface-2)">
                      <Link
                        href={`/photos/${photo.id}`}
                        className="absolute inset-0 z-20 block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--accent)"
                        aria-label={`Open ${photo.title}`}
                      >
                        <span className="sr-only">View {photo.title}</span>
                      </Link>

                      <Image
                        src={photo.url}
                        alt={photo.title}
                        fill
                        unoptimized={true}
                        priority={index < 3}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Gradient Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

                      {/* Category Badge */}
                      <div className="absolute left-4 top-4 z-30 flex items-center gap-2 pointer-events-none">
                        <span className="bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-[0.2em] text-white/90">
                          {photo.category ? photo.category.toLowerCase() : "other"}
                        </span>
                      </div>
                      
                      <div className="absolute right-4 top-4 z-30 pointer-events-none">
                        <span className="font-mono text-[9px] tracking-[0.14em] text-white/70 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Content & Metadata Area */}
                    <div className="p-8 sm:p-9 flex flex-col gap-6 flex-grow justify-between bg-(--surface)">
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center justify-between gap-2">
                          {photo.location ? (
                            <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-(--accent)">
                              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="truncate">{photo.location}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-(--text-muted)">
                              Location not available
                            </span>
                          )}

                          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-(--text-dim) truncate max-w-[50%] font-medium">
                            {photo.authorName || "Artist"}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold tracking-tight text-(--text) group-hover:text-(--accent) transition-colors line-clamp-1">
                          {photo.title}
                        </h3>

                        {exifLine && (
                          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-(--text-dim) truncate bg-(--surface-2) px-3.5 py-2 rounded-xl border border-(--border)">
                            {exifLine}
                          </p>
                        )}
                      </div>

                      {/* Metrics Bar */}
                      <div className="grid grid-cols-3 pt-5 border-t border-(--border) text-[10px] font-mono uppercase tracking-[0.16em] text-(--text-dim)">
                        <span className="inline-flex items-center justify-center gap-1.5 border-r border-(--border) pr-2">
                          <Heart className="h-3 w-3 text-rose-500" aria-hidden="true" />
                          {photo.likeCount ?? 0}
                        </span>
                        <span className="inline-flex items-center justify-center gap-1.5 border-r border-(--border) px-2">
                          <Star className="h-3 w-3 text-amber-400" aria-hidden="true" />
                          {photo.avgRating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center justify-center gap-1.5 pl-2">
                          <MessageCircle className="h-3 w-3 text-sky-400" aria-hidden="true" />
                          {photo.commentCount ?? 0}
                        </span>
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Bar with Page Numbers */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-12 bg-(--surface) border border-(--border) px-4 sm:px-6 py-4 rounded-2xl shadow-lg backdrop-blur-md flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] uppercase tracking-widest font-bold text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 font-mono text-xs text-(--text-muted)">
                          ...
                        </span>
                      );
                    }

                    const pageNum = page as number;
                    const isSelected = pageNum === currentPage;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-9 w-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                          isSelected
                            ? "bg-(--accent) text-(--bg) border-(--accent) shadow-md"
                            : "bg-(--surface-2) text-(--text-dim) border-(--border) hover:bg-(--surface-3) hover:text-(--text)"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] uppercase tracking-widest font-bold text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </>
        )}

      </main>

      {/* Submit Modal */}
      <SubmitPhotoModal 
        isOpen={isSubmitOpen} 
        onClose={() => setIsSubmitOpen(false)} 
      />
    </div>
  );
}