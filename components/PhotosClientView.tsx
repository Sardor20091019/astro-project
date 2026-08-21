/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Heart, Star, MessageCircle, Plus, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";

interface PhotosClientViewProps {
  initialPhotos: any[];
  activeCategory: string;
  activeSort: string;
  categories: { label: string; value: string }[];
  sortOptions: { label: string; value: string }[];
}

export default function PhotosClientView({
  initialPhotos,
  activeCategory,
  activeSort,
  categories,
  sortOptions,
}: PhotosClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const handleCategoryChange = (catValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catValue === "ALL") {
      params.delete("category");
    } else {
      params.set("category", catValue);
    }
    router.push(`/photos?${params.toString()}`);
  };

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortValue === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", sortValue);
    }
    router.push(`/photos?${params.toString()}`);
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
        <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-5 bg-(--surface) border border-(--border) p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-xl">
          
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

          {/* Right Side: Sort & Submit Button */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-end shrink-0">
            <div className="flex items-center gap-2.5 bg-(--surface-2) border border-(--border) px-6 py-4 rounded-2xl">
              <SlidersHorizontal className="h-4 w-4 text-(--accent)" />
              <select
                value={activeSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent font-mono text-[10px] uppercase tracking-[0.15em] text-(--text) outline-none cursor-pointer font-bold focus:text-(--accent) transition-colors py-0.5"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-(--surface) text-(--text) font-mono">
                    {opt.label}
                  </option>
                ))}
              </select>
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

                  {/* Content & Metadata Area (Increased padding & spacing) */}
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
                            Location withheld
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