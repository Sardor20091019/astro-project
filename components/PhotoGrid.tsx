/* eslint-disable @next/next/no-img-element */
"use client"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { photos as mockPhotos, CATEGORIES, type PhotoCategory } from "../data/photos"
import ReviewSection from "./ReviewSection"
import ReviewList from "./ReviewList"
import { ChevronDown, X, MapPin } from "lucide-react"

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

const PAGE_SIZE = 20;

export default function PhotoGrid({ initialPhotos }: { initialPhotos?: PhotoType[] }) {
  const allPhotos = (initialPhotos || mockPhotos) as PhotoType[];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | "ALL">("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return allPhotos;
    return allPhotos.filter(p => (p.category || "OTHER") === activeCategory);
  }, [allPhotos, activeCategory]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleCategoryChange = (cat: PhotoCategory | "ALL") => {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
    setSelectedIndex(null);
  };

  const handleReviewSuccess = () => setRefreshKey(prev => prev + 1);

  const openModal = (idx: number) => setSelectedIndex(idx);
  const closeModal = () => setSelectedIndex(null);

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < visible.length - 1) setSelectedIndex(selectedIndex + 1);
  };
  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  return (
    <section className="py-8">
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
            : `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} frames`
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
              {visible.map((photo, index) => {
                const imageSource = photo.url || photo.src || photo.imageUrl || photo.image_url || "";

                return (
                  <motion.article
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.25, delay: index % PAGE_SIZE < 8 ? (index % 8) * 0.03 : 0 }}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-(--border) bg-(--surface-1) group shadow-lg transition-all duration-300 hover:border-(--border-hover) hover:shadow-2xl flex flex-col"
                    onClick={() => openModal(index)}
                  >
                    {/* Image Box with Balanced Aspect Ratio & Smooth Hover Zoom */}
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
                      
                      {/* Top Category Badge */}
                      {photo.category && photo.category !== "OTHER" && (
                        <div className="absolute top-3 left-3 z-10 pointer-events-none">
                          <span className="text-[9px] font-black uppercase tracking-[0.16em] bg-black/60 backdrop-blur-md border border-white/10 text-white/90 px-2.5 py-1 rounded-md">
                            {CATEGORIES.find(c => c.value === photo.category)?.icon} {photo.category}
                          </span>
                        </div>
                      )}

                      {/* Index Number Badge */}
                      <div className="absolute top-3 right-3 z-10 pointer-events-none">
                        <span className="font-mono text-[9px] tracking-widest text-white/70 bg-black/60 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Gradient Overlay for Text Readability */}
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
                );
              })}
            </AnimatePresence>
          </div>

          {/* Show More Button */}
          {hasMore && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-[10px] text-(--text-muted) uppercase tracking-widest font-bold">
                {filtered.length - visibleCount} more frames remaining
              </p>
              <motion.button
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-(--border) bg-(--surface-1) text-(--text) hover:bg-(--surface-2) hover:border-(--border-hover) transition-all duration-200 text-[11px] font-black uppercase tracking-widest shadow-sm"
              >
                Show more
                <ChevronDown size={14} />
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Immersive Photo Modal */}
      <AnimatePresence>
        {selectedIndex !== null && visible[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              className="bg-(--surface-1) border border-(--border) w-full max-w-6xl rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Image View Side */}
              <div className="md:w-[60%] bg-black flex items-center justify-center p-6 relative min-h-[350px]">
                <img
                  src={visible[selectedIndex].url || visible[selectedIndex].src || visible[selectedIndex].imageUrl || visible[selectedIndex].image_url}
                  className="max-h-[80vh] w-auto h-auto object-contain rounded-xl shadow-lg"
                  alt={visible[selectedIndex].title}
                />
                
                {/* Prev / Next navigation buttons */}
                {selectedIndex > 0 && (
                  <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition flex items-center justify-center text-white border border-white/10 text-lg shadow-lg">
                    ‹
                  </button>
                )}
                {selectedIndex < visible.length - 1 && (
                  <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition flex items-center justify-center text-white border border-white/10 text-lg shadow-lg">
                    ›
                  </button>
                )}

                {/* Close Button */}
                <button onClick={closeModal} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition flex items-center justify-center text-white border border-white/10 text-xs shadow-lg">
                  <X size={14} />
                </button>

                {/* Counter Badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/70 font-mono font-bold uppercase tracking-widest bg-black/70 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                  {selectedIndex + 1} / {visible.length}
                </div>
              </div>

              {/* Data & Review Side */}
              <div className="md:w-[40%] p-6 sm:p-8 overflow-y-auto border-t md:border-t-0 md:border-l border-(--border) flex flex-col justify-between bg-(--surface-1)">
                <div>
                  {visible[selectedIndex].category && (
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-(--accent)/10 border border-(--accent)/20 text-(--accent) px-3 py-1 rounded-md mb-3">
                      {CATEGORIES.find(c => c.value === visible[selectedIndex].category)?.icon} {visible[selectedIndex].category}
                    </span>
                  )}
                  <h2 className="text-2xl font-black uppercase tracking-tight text-(--text) mb-1 leading-tight">
                    {visible[selectedIndex].title}
                  </h2>
                  <p className="text-(--accent) text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-1.5">
                    <MapPin size={12} />
                    {visible[selectedIndex].location || "Unknown Location"}
                  </p>

                  <ReviewSection
                    photoId={visible[selectedIndex].id}
                    onSuccess={handleReviewSuccess}
                  />

                  <div className="mt-8">
                    <h3 className="text-(--text) font-bold text-[10px] uppercase tracking-widest mb-4 border-b border-(--border) pb-2">Reviews</h3>
                    <ReviewList photoId={visible[selectedIndex].id} refreshTrigger={refreshKey} />
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-(--border)">
                  <a
                    href={`/photos/${visible[selectedIndex].id}`}
                    className="block text-center w-full bg-(--accent) text-(--bg) py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    View full details →
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}