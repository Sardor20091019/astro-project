/* eslint-disable @next/next/no-img-element */
"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { CATEGORIES, type PhotoCategory } from "../data/photos"
import { ChevronDown, X, MapPin } from "lucide-react"

type PhotoType = {
  id: number;
  url?: string;
  src?: string;
  imageUrl?: string; 
  image_url?: string; 
  title: string;
  location?: string | null; // Updated to accept undefined
  coordinates?: string | null;
  category?: string | null;
};

const PAGE_SIZE = 20;

export default function PhotoGrid({ initialPhotos }: { initialPhotos?: PhotoType[] }) {
  const allPhotos = (initialPhotos || []) as PhotoType[];
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
  };

  return (
    <section className="py-8">
      {/* Category Filter Bar */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
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
                  relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest
                  transition-all duration-200 whitespace-nowrap border cursor-pointer
                  ${isActive 
                    ? "bg-(--accent) text-(--bg) border-(--accent) shadow-md shadow-(--accent)/15" 
                    : "bg-(--surface-1) text-(--text-dim) border-(--border) hover:bg-(--surface-2) hover:text-(--text) hover:border-(--border-hover)"
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`
                  text-[9px] px-1.5 py-0.5 rounded font-mono font-bold
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
            : `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} images`
          }
        </p>
        {activeCategory !== "ALL" && (
          <button
            onClick={() => handleCategoryChange("ALL")}
            className="flex items-center gap-1.5 text-[10px] text-(--accent) hover:underline uppercase tracking-[0.18em] font-bold transition-colors cursor-pointer"
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
            {visible.map((photo, index) => {
              const imageSource = photo.url || photo.src || photo.imageUrl || photo.image_url || "";

              return (
                <Link
                  key={photo.id}
                  href={`/creator/photos/${photo.id}`}
                  className="block group"
                >
                  <article className="cursor-pointer overflow-hidden rounded-2xl border border-(--border) bg-(--surface-1) shadow-lg transition-all duration-300 hover:border-(--border-hover) hover:shadow-2xl flex flex-col h-full">
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
                          <span className="text-[9px] font-black uppercase tracking-[0.16em] bg-black/60 backdrop-blur-md border border-white/10 text-white/90 px-2.5 py-1 rounded-md">
                            {CATEGORIES.find(c => c.value === photo.category)?.icon} {photo.category}
                          </span>
                        </div>
                      )}

                      <div className="absolute top-3 right-3 z-10 pointer-events-none">
                        <span className="font-mono text-[9px] tracking-widest text-white/70 bg-black/60 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                          {String(index + 1).padStart(2, "0")}
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
                  </article>
                </Link>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-[10px] text-(--text-muted) uppercase tracking-widest font-bold">
                {filtered.length - visibleCount} more frames remaining
              </p>
              <button
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-(--border) bg-(--surface-1) text-(--text) hover:bg-(--surface-2) hover:border-(--border-hover) transition-all duration-200 text-[11px] font-black uppercase tracking-widest shadow-sm cursor-pointer"
              >
                Show more
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}