/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Heart, Star, MessageCircle, Plus, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";

interface PhotosClientViewProps {
  initialPhotos: any[]; // Pass all photos here instead of server-paginated chunks
  categories: { label: string; value: string }[];
  sortOptions: { label: string; value: string }[];
}

export default function PhotosClientView({
  initialPhotos,
  categories,
  sortOptions,
}: PhotosClientViewProps) {
  const router = useRouter();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Local state for instant UI updates
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeSort, setActiveSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Adjust items per page as needed

  const currentSortLabel = sortOptions.find((opt) => opt.value === activeSort)?.label || "Sort";

  // 1. Instant Client-Side Filtering & Sorting
  const filteredPhotos = useMemo(() => {
    let result = [...initialPhotos];

    // Filter by category
    if (activeCategory !== "ALL") {
      result = result.filter((p) => p.category?.toUpperCase() === activeCategory.toUpperCase());
    }

    // Sort items
    result.sort((a, b) => {
      if (activeSort === "latest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (activeSort === "popular") {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      if (activeSort === "rating") {
        return (b.avgRating || 0) - (a.avgRating || 0);
      }
      return 0;
    });

    return result;
  }, [initialPhotos, activeCategory, activeSort]);

  // 2. Client-Side Pagination
  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage) || 1;
  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPhotos.slice(start, start + itemsPerPage);
  }, [filteredPhotos, currentPage]);

  const handleCategoryChange = (catValue: string) => {
    setActiveCategory(catValue);
    setCurrentPage(1); // Reset to page 1 instantly
  };

  const handleSortChange = (sortValue: string) => {
    setActiveSort(sortValue);
    setCurrentPage(1);
    setIsSortOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col items-center selection:bg-(--accent) selection:text-(--bg)">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-(--border) bg-(--bg)/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-(--text-dim) hover:text-(--text) transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col items-center text-center gap-8">
        
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-(--text)">
            Gallery Archive
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
          Selected photos
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-4 bg-(--surface) border border-(--border) p-4 sm:p-5 rounded-2xl backdrop-blur-md shadow-lg relative z-30">
          
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center xl:justify-start flex-wrap gap-2 w-full xl:w-auto overflow-x-auto">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.18em] transition-all whitespace-nowrap border cursor-pointer ${
                    isActive
                      ? "bg-(--accent) text-(--bg) border-(--accent) font-bold shadow-xs"
                      : "bg-(--surface-2) text-(--text-dim) border-(--border) hover:bg-(--surface-3) hover:text-(--text)"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort & Submit */}
          <div className="flex items-center gap-3 w-full xl:w-auto justify-end shrink-0">
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2.5 bg-(--surface-2) border border-(--border) px-4 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.15em] text-(--text) font-bold hover:bg-(--surface-3) transition-all cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-(--accent)" />
                <span>{currentSortLabel}</span>
                <ChevronDown className={`h-3 w-3 text-(--text-dim) transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-(--surface) border border-(--border) p-1.5 shadow-2xl z-50 backdrop-blur-2xl"
                  >
                    <div className="flex flex-col gap-1">
                      {sortOptions.map((opt) => {
                        const isSelected = activeSort === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleSortChange(opt.value)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-[0.15em] transition-all cursor-pointer ${
                              isSelected
                                ? "bg-(--accent) text-(--bg) font-bold shadow-xs"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--text) text-(--bg) font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-(--accent) hover:text-(--bg) transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Submit Frame
            </button>
          </div>
        </div>

        {/* Photo Display Area */}
        {paginatedPhotos.length === 0 ? (
          <div className="w-full max-w-lg border border-dashed border-(--border) rounded-2xl py-20 px-6 text-center flex flex-col items-center justify-center gap-4 bg-(--surface) backdrop-blur-md mt-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--text-muted)">
              No images found matching your criteria.
            </p>
            <button
              onClick={() => { setActiveCategory("ALL"); setActiveSort("latest"); }}
              className="px-5 py-2.5 rounded-xl bg-(--surface-2) hover:bg-(--surface-3) text-(--text) font-mono text-[10px] uppercase tracking-[0.18em] transition-all cursor-pointer border border-(--border)"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center items-stretch gap-6 w-full max-w-7xl mt-2">
              {paginatedPhotos.map((photo, index) => {
                const exifLine = [photo.camera, photo.focalLength, photo.aperture, photo.shutter]
                  .filter(Boolean)
                  .join(" / ");

                return (
                  <article 
                    key={photo.id}
                    className="group relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface) hover:border-(--border-hover) transition-all duration-500 flex flex-col text-left shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm"
                  >
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-(--surface-2)">
                      <Link
                        href={`/photos/${photo.id}`}
                        className="absolute inset-0 z-20 block focus-visible:outline-none"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/25 opacity-40 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none" />

                      <div className="absolute left-3.5 top-3.5 z-30 pointer-events-none">
                        <span className="bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.18em] text-white/90">
                          {photo.category ? photo.category.toLowerCase() : "other"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col gap-4 flex-grow justify-between bg-(--surface)">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-(--accent) truncate">
                            {photo.location || "Location N/A"}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-(--text-dim) truncate font-medium">
                            {photo.authorName || "Artist"}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-(--text) group-hover:text-(--accent) transition-colors line-clamp-1">
                          {photo.title}
                        </h3>

                        {exifLine && (
                          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-(--text-dim) truncate bg-(--surface-2) px-3 py-2 rounded-xl border border-(--border)">
                            {exifLine}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 pt-4 border-t border-(--border) text-[10px] font-mono uppercase tracking-[0.15em] text-(--text-dim)">
                        <span className="inline-flex items-center justify-center gap-1.5 border-r border-(--border) pr-2">
                          <Heart className="h-3 w-3 text-rose-500" />
                          {photo.likeCount ?? 0}
                        </span>
                        <span className="inline-flex items-center justify-center gap-1.5 border-r border-(--border) px-2">
                          <Star className="h-3 w-3 text-amber-400" />
                          {photo.avgRating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center justify-center gap-1.5 pl-2">
                          <MessageCircle className="h-3 w-3 text-sky-400" />
                          {photo.commentCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 bg-(--surface) border border-(--border) px-4 py-3.5 rounded-2xl shadow-md backdrop-blur-md">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] font-bold text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="px-3 font-mono text-xs font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] font-bold text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <SubmitPhotoModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </div>
  );
}