/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CATEGORIES } from "../data/photos";
import { MapPin, Heart, MessageSquare, Maximize2 } from "lucide-react";

type PhotoCardProps = {
  photo: {
    id: number;
    url?: string;
    src?: string;
    imageUrl?: string;
    image_url?: string;
    title: string;
    location?: string | null;
    category?: string | null;
  };
  index: number;
  onOpenViewer?: (photo: any) => void;
  onOpenComments?: (photo: any) => void;
};

export default function PhotoCard({ photo, index, onOpenViewer, onOpenComments }: PhotoCardProps) {
  const imageSource = photo.url || photo.src || photo.imageUrl || photo.image_url || "";

  return (
    <div className="block group relative h-full">
      <article className="cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] shadow-lg transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-2xl flex flex-col h-full">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-[var(--surface-2)] flex flex-col justify-between">
          
          <Link href={`/creator/photos/${photo.id}`} className="absolute inset-0 z-0">
            {imageSource ? (
              <img
                src={imageSource}
                alt={photo.title || "Photo"}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase text-[var(--text-muted)] tracking-widest">
                Missing Image Source
              </div>
            )}
          </Link>
          
          <div className="relative z-10 flex items-center justify-between p-3 pointer-events-none">
            {photo.category && photo.category !== "OTHER" ? (
              <span className="text-[9px] font-black uppercase tracking-[0.16em] bg-black/60 backdrop-blur-md border border-white/10 text-white/90 px-2.5 py-1 rounded-md">
                {CATEGORIES.find(c => c.value === photo.category)?.icon} {photo.category}
              </span>
            ) : <span />}
            
            <span className="font-mono text-[9px] tracking-widest text-white/70 bg-black/60 px-2 py-1 rounded-md backdrop-blur-md border border-white/10 shadow-md">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="relative z-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 pt-12 flex flex-col gap-2">
            <div className="flex items-end justify-between gap-2 sm:gap-3">
              <div className="flex flex-col min-w-0 flex-1">
                {photo.location && (
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-[var(--accent)] mb-1">
                    <MapPin size={11} className="shrink-0 sm:w-3 sm:h-3" />
                    <span className="truncate">{photo.location}</span>
                  </div>
                )}
                <Link href={`/creator/photos/${photo.id}`} className="pointer-events-auto">
                  <h3 className="text-white font-bold uppercase text-xs sm:text-base tracking-tight leading-snug line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                    {photo.title}
                  </h3>
                </Link>
              </div>

              {/* Scaled-down button sizing on mobile screens */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-black/70 backdrop-blur-md border border-white/15 p-1 sm:p-1.5 rounded-md sm:rounded-xl shadow-lg shrink-0 pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="p-1.5 sm:p-2 rounded sm:rounded-lg text-white hover:text-[var(--accent)] hover:bg-white/10 transition-colors cursor-pointer"
                  title="Favorite"
                >
                  <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onOpenComments) onOpenComments(photo);
                  }}
                  className="p-1.5 sm:p-2 rounded sm:rounded-lg text-white hover:text-[var(--accent)] hover:bg-white/10 transition-colors cursor-pointer"
                  title="Comments"
                >
                  <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onOpenViewer) onOpenViewer(photo);
                  }}
                  className="p-1.5 sm:p-2 rounded sm:rounded-lg text-white hover:text-[var(--accent)] hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fullscreen / Preview"
                >
                  <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
}