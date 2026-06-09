"use client"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { photos as mockPhotos, CATEGORIES, type PhotoCategory } from "../data/photos"
import ReviewSection from "./ReviewSection"
import ReviewList from "./ReviewList"
import { ChevronDown, X } from "lucide-react"

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
    <section className="py-6">
      {/* Category Filter Bar */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-2 min-w-max">
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
                  relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest
                  transition-all duration-200 whitespace-nowrap border
                  ${isActive 
                    ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25" 
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80 hover:border-white/20"
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`
                  text-[9px] px-1.5 py-0.5 rounded-full font-black
                  ${isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/40"}
                `}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] uppercase tracking-widest text-white/30 font-bold">
          {filtered.length === 0 
            ? "No photos in this category" 
            : `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} frames`
          }
        </p>
        {activeCategory !== "ALL" && (
          <button
            onClick={() => handleCategoryChange("ALL")}
            className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 uppercase tracking-widest font-bold transition-colors"
          >
            <X size={10} /> Clear filter
          </button>
        )}
      </div>

   
      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 px-6 py-20 text-center text-white/30 text-sm">
          No frames found in this category yet.
        </div>
      ) : (
        <>
      
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {visible.map((photo, index) => {
             
                const imageSource = photo.url || photo.src || photo.imageUrl || photo.image_url || "";

                return (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, delay: index % PAGE_SIZE < 8 ? (index % 8) * 0.04 : 0 }}
                    whileHover={{ y: -4 }}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/60 group shadow-xl min-h-[300px]"
                    onClick={() => openModal(index)}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                      {imageSource ? (
                        <img
                          src={imageSource}
                          alt={photo.title}
                   
                          className="w-full h-full object-cover group-hover:scale-[1.08] transition duration-[600ms]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase text-white/20 tracking-widest">
                          Missing Image Source
                        </div>
                      )}
                      
                      {/* Category badge */}
                      {photo.category && photo.category !== "OTHER" && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-[9px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/10 text-white/70 px-2.5 py-1 rounded-full">
                            {CATEGORIES.find(c => c.value === photo.category)?.icon} {photo.category}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
                        <h4 className="text-white font-black uppercase text-xs tracking-wider leading-tight">{photo.title}</h4>
                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-1">{photo.location || "Unknown"}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Show More */}
          {hasMore && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-bold">
                {filtered.length - visibleCount} more frames
              </p>
              <motion.button
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/25 hover:text-white transition-all duration-200 text-[11px] font-black uppercase tracking-widest"
              >
                Show more
                <ChevronDown size={14} />
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedIndex !== null && visible[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/96 flex items-center justify-center z-[100] p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.25 }}
              className="bg-zinc-950 border border-white/8 w-full max-w-6xl rounded-[2rem] overflow-hidden flex flex-col md:flex-row max-h-[92vh] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Image Side */}
              <div className="md:w-[58%] bg-black flex items-center justify-center p-4 relative">
                <img
                  src={visible[selectedIndex].url || visible[selectedIndex].src || visible[selectedIndex].imageUrl || visible[selectedIndex].image_url}
                  className="max-h-[80vh] w-auto object-contain rounded-xl"
                  alt={visible[selectedIndex].title}
                />
                {/* Prev/Next */}
                {selectedIndex > 0 && (
                  <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition flex items-center justify-center text-white/70 border border-white/10">
                    ‹
                  </button>
                )}
                {selectedIndex < visible.length - 1 && (
                  <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition flex items-center justify-center text-white/70 border border-white/10">
                    ›
                  </button>
                )}
                {/* Close */}
                <button onClick={closeModal} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition flex items-center justify-center text-white/70 border border-white/10 text-xs">
                  <X size={13} />
                </button>
                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/30 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  {selectedIndex + 1} / {visible.length}
                </div>
              </div>

              {/* Data Side */}
              <div className="md:w-[42%] p-8 overflow-y-auto border-l border-white/8 flex flex-col justify-between">
                <div>
                  {visible[selectedIndex].category && (
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-full mb-4">
                      {CATEGORIES.find(c => c.value === visible[selectedIndex].category)?.icon} {visible[selectedIndex].category}
                    </span>
                  )}
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1.5 leading-tight">
                    {visible[selectedIndex].title}
                  </h2>
                  <p className="text-red-500 text-[10px] font-bold tracking-widest uppercase mb-6">
                    {visible[selectedIndex].location || "Unknown Location"}
                  </p>

                  <ReviewSection
                    photoId={visible[selectedIndex].id}
                    onSuccess={handleReviewSuccess}
                  />

                  <div className="mt-8">
                    <h3 className="text-white font-bold text-[10px] uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Reviews</h3>
                    <ReviewList photoId={visible[selectedIndex].id} refreshTrigger={refreshKey} />
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <a
                    href={`/photos/${visible[selectedIndex].id}`}
                    className="block text-center w-full bg-white text-black py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-200"
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