/* eslint-disable @next/next/no-img-element */
"use client"
import { useState, useMemo } from "react"
import { CATEGORIES, type PhotoCategory } from "../data/photos"
import { ChevronDown, X } from "lucide-react"
import PhotoCard from "./PhotoCard"

type PhotoType = {
  id: number;
  url?: string;
  src?: string;
  imageUrl?: string; 
  image_url?: string; 
  title: string;
  location?: string | null;
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
          No images found in this category yet.
        </div>
      ) : (
        <>
          {/* Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {visible.map((photo, index) => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                index={index} 
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-[10px] text-(--text-muted) uppercase tracking-widest font-bold">
                {filtered.length - visibleCount} more images remaining
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