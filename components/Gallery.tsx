import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface GalleryProps {
  currentPage?: number;
}

export default async function Gallery({ currentPage = 1 }: GalleryProps) {
  const pageSize = 9;
  const skipAmount = (currentPage - 1) * pageSize;

  const totalPhotos = await prisma.photo.count({
    where: {
      NOT: [{ url: "" }, { url: "undefined" }, { url: "null" }],
    },
  });

  const totalPages = Math.ceil(totalPhotos / pageSize);

  const photos = await prisma.photo.findMany({
    where: {
      NOT: [{ url: "" }, { url: "undefined" }, { url: "null" }],
    },
    orderBy: { createdAt: "desc" },
    skip: skipAmount,
    take: pageSize,
  });

  if (photos.length === 0) {
    return (
      <div className="border border-dashed border-(--border) rounded-2xl px-6 py-24 text-center text-(--text-muted) text-xs uppercase tracking-widest">
        No photos found.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-10 w-full">
      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo, index) => {
          const title = photo.title?.trim() || "Untitled frame";
          const globalIndex = skipAmount + index + 1;

          return (
            <article 
              key={photo.id} 
              className="group relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface-1) transition-all duration-300 hover:border-(--border-hover) hover:shadow-2xl flex flex-col"
            >
              <Link href={`/photos/${photo.id}`} className="absolute inset-0 z-20" aria-label={`View ${title}`} />

              {/* Image Container with Natural/Balanced Aspect Ratio & Smooth Hover Zoom */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-(--surface-2)">
                <Image 
                  src={photo.url} 
                  alt={title} 
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  priority={currentPage === 1 && index < 2}
                  loading={currentPage === 1 && index < 2 ? "eager" : "lazy"}
                />

                {/* Index Number Badge */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span className="font-mono text-[9px] tracking-widest text-white/70 bg-black/60 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                    {String(globalIndex).padStart(2, "0")}
                  </span>
                </div>

                {/* Gradient Overlay & Title/Location Bar */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 flex flex-col justify-end pt-12">
                  {photo.location && (
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-(--accent) mb-1">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{photo.location}</span>
                    </div>
                  )}
                  <h3 className="text-white font-bold uppercase text-base tracking-tight leading-snug line-clamp-1 group-hover:text-(--accent) transition-colors">
                    {title}
                  </h3>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 grid grid-cols-[1fr_auto_1fr] items-center gap-4 max-w-md mx-auto w-full">
          {currentPage > 1 ? (
            <a
              href={`?page=${currentPage - 1}`}
              style={{ borderRadius: 'var(--btn-radius)', border: 'var(--btn-border)', boxShadow: 'var(--btn-shadow)' }}
              className="px-5 py-3 text-center text-[10px] uppercase tracking-[0.16em] font-bold text-(--text) transition-colors hover:bg-(--surface-2)"
            >
              Prev
            </a>
          ) : (
            <span 
              style={{ borderRadius: 'var(--btn-radius)', border: 'var(--btn-border)', opacity: 0.25 }}
              className="px-5 py-3 text-center text-[10px] uppercase tracking-[0.16em] font-bold text-(--text-muted) cursor-not-allowed"
            >
              Prev
            </span>
          )}

          <span className="px-3 text-[10px] font-mono uppercase tracking-[0.18em] text-(--text-muted) text-center">
            {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
          </span>

          {currentPage < totalPages ? (
            <a
              href={`?page=${currentPage + 1}`}
              style={{ borderRadius: 'var(--btn-radius)', border: 'var(--btn-border)', boxShadow: 'var(--btn-shadow)' }}
              className="px-5 py-3 text-center text-[10px] uppercase tracking-[0.16em] font-bold text-(--text) transition-colors hover:bg-(--surface-2)"
            >
              Next
            </a>
          ) : (
            <span 
              style={{ borderRadius: 'var(--btn-radius)', border: 'var(--btn-border)', opacity: 0.25 }}
              className="px-5 py-3 text-center text-[10px] uppercase tracking-[0.16em] font-bold text-(--text-muted) cursor-not-allowed"
            >
              Next
            </span>
          )}
        </div>
      )}
    </div>
  );
}