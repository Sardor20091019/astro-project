/* eslint-disable @next/next/no-img-element */
"use client"
import { useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { CATEGORIES, type PhotoCategory } from "../data/photos"
import { X, MapPin, ChevronLeft, ChevronRight } from "lucide-react"

type PhotoType = {
  id: number;
  url?: string;
  src?: string;
  imageUrl?: string; 
  image_url?: string; 
  title: string;
  location: string | null;
  coordinates?: string | null;
  category?: string | null;
};

const PAGE_SIZE = 12; // 12 items per page for a balanced 3x4 grid

export default function PhotoGrid({ initialPhotos }: { initialPhotos?: PhotoType[] }) {
  const allPhotos = (initialPhotos || []) as PhotoType[];
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return allPhotos;
    return allPhotos.filter(p => (p.category || "OTHER") === activeCategory);
  }, [allPhotos, activeCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  // Ensure current page is valid when filter changes
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPhotos = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safeCurrentPage]);

  const handleCategoryChange = (cat: PhotoCategory | "ALL") => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="py-8" ref={gridTopRef}>
      {/* Category Filter Bar */}
      <div className="mb-8 overflow-x-auto pb-3 scrollbar-none">
        <div className="flex gap-2.5 min-w-max">
          {CATEGORIES.map(cat => {
            const count = cat.value === "ALL" 
              ? allPhotos.length 
              : allPhotos.filter(p => (p.category || "OTHER") === cat.value).length;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest
                  transition-all duration-200 whitespace-nowrap border
                  ${isActive 
                    ? "bg-(--accent) text-(--bg) border-(--accent) shadow-lg shadow-(--accent)/20" 
                    : "bg-(--surface-1) text-(--text-dim) border-(--border) hover:bg-(--surface-2) hover:text-(--text) hover:border-(--border-hover)"
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`
                  text-[9px] px-2 py-0.5 rounded-md font-mono font-bold
                  ${isActive ? "bg-black/20 text-(--bg)" : "bg-(--surface-2) text-(--text-muted)"}
                `}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count & Clear */}
      <div className="flex items-center justify-between mb-6 px-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-(--text-muted) font-bold">
          {filtered.length === 0 
            ? "No photos in this category" 
            : `Showing ${(safeCurrentPage - 1) * PAGE_SIZE + 1}–${Math.min(safeCurrentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} frames`
          }
        </p>
        {activeCategory !== "ALL" && (
          <button
            onClick={() => handleCategoryChange("ALL")}
            className="flex items-center gap-1.5 text-[10px] text-(--accent) hover:underline uppercase tracking-[0.18em] font-bold transition-colors"
          >
            <X size={12} /> Clear filter
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border) px-6 py-24 text-center text-(--text-muted) text-xs uppercase tracking-widest">
          No frames found in this category yet.
        </div>
      ) : (
        <>
          {/* Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {paginatedPhotos.map((photo, index) => {
                const imageSource = photo.url || photo.src || photo.imageUrl || photo.image_url || "";
                const absoluteIndex = (safeCurrentPage - 1) * PAGE_SIZE + index;

                return (
                  <Link
                    key={photo.id}
                    href={`/creator/photos/${photo.id}`}
                    className="block group"
                  >
                    <motion.article
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.25, delay: (index % PAGE_SIZE) * 0.03 }}
                      className="cursor-pointer overflow-hidden rounded-2xl border border-(--border) bg-(--surface-1) shadow-lg transition-all duration-300 hover:border-(--border-hover) hover:shadow-2xl flex flex-col h-full"
                    >
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-(--surface-2)">
                        {imageSource ? (
                          <img
                            src={imageSource}
                            alt={photo.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase text-(--text-muted) tracking-widest">
                            Missing Image Source
                          </div>
                        )}
                        
                        {photo.category && photo.category !== "OTHER" && (
                          <div className="absolute top-3 left-3 z-10 pointer-events-none">
                            <span className="text-[9px] font-black uppercase tracking-[0.16em] bg-black/65 backdrop-blur-md border border-white/10 text-white/90 px-2.5 py-1 rounded-md">
                              {CATEGORIES.find(c => c.value === photo.category)?.icon} {photo.category}
                            </span>
                          </div>
                        )}

                        <div className="absolute top-3 right-3 z-10 pointer-events-none">
                          <span className="font-mono text-[9px] tracking-widest text-white/70 bg-black/65 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                            {String(absoluteIndex + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 flex flex-col justify-end pt-12">
                          {photo.location && (
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-(--accent) mb-1">
                              <MapPin size={12} className="shrink-0" />
                              <span className="truncate">{photo.location}</span>
                            </div>
                          )}
                          <h3 className="text-white font-bold uppercase text-base tracking-tight leading-snug line-clamp-1 group-hover:text-(--accent) transition-colors">
                            {photo.title}
                          </h3>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Page-Based Pagination Bar */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-(--border) bg-(--surface-1) text-xs font-mono text-(--text-dim) hover:text-white hover:bg-(--surface-2) transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`
                        w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all
                        ${isActive 
                          ? "bg-(--accent) text-(--bg) shadow-md shadow-(--accent)/20" 
                          : "bg-(--surface-1) border border-(--border) text-(--text-dim) hover:bg-(--surface-2) hover:text-white"
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-(--border) bg-(--surface-1) text-xs font-mono text-(--text-dim) hover:text-white hover:bg-(--surface-2) transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}