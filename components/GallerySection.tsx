import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, MessageCircle, Star } from "lucide-react";
import { CATEGORIES, type PhotoCategory } from "@/data/photos";

export interface GalleryPhoto {
  id: number;
  url: string;
  title: string;
  location: string | null;
  category: PhotoCategory | "OTHER";
  authorName: string | null;
  userId: string | null;
  camera: string | null;
  iso: number | null;
  aperture: string | null;
  shutter: string | null;
  focalLength: string | null;
  avgRating: number;
  likeCount: number;
  commentCount: number;
  ratingCount: number;
}

interface GallerySectionProps {
  photos: GalleryPhoto[];
  totalPhotos: number;
  categoryCounts: Record<PhotoCategory | "ALL", number>;
  activeCategory: PhotoCategory | "ALL";
  currentPage: number;
  sortBy: string;
  query: string;
}

const PAGE_SIZE = 12;
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTInIHZpZXdCb3g9JzAgMCAxNiAxMicgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTYnIGhlaWdodD0nMTInIGZpbGw9JyMwODA4MDgnLz48cmVjdCB4PScxJyB5PScxJyB3aWR0aD0nMTQnIGhlaWdodD0nMTAnIGZpbGw9JyMwZjBmMGYnLz48L3N2Zz4=";

function buildGalleryHref({
  page,
  category,
  sortBy,
  query,
}: {
  page: number;
  category: PhotoCategory | "ALL";
  sortBy: string;
  query: string;
}) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (sortBy && sortBy !== "latest") params.set("sortBy", sortBy);
  if (query.trim()) params.set("q", query.trim());
  if (category !== "ALL") params.set("category", category);

  const queryString = params.toString();
  return queryString ? `/?${queryString}#gallery` : "/#gallery";
}

function formatMetric(value: number) {
  if (value < 1000) return String(value);
  if (value < 1000000) return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)}k`;
  return `${(value / 1000000).toFixed(1)}m`;
}

function GalleryCard({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const title = photo.title.trim() || "Untitled frame";
  const exifLine = [photo.camera, photo.focalLength, photo.aperture, photo.shutter]
    .filter((value): value is string => Boolean(value))
    .join(" / ");

  return (
    /* Integrated .world-card to dynamically control borders, radius, backgrounds, and drop shadows */
    <article className="world-card group relative overflow-hidden transition-all duration-300 ease-out">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface-2)] sm:aspect-[3/4] lg:aspect-[4/3]">
        <Link
          href={`/photos/${photo.id}`}
          className="absolute inset-0 z-0 block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          aria-label={`Open ${title}`}
        >
          <Image
            src={photo.url}
            alt={title}
            fill
            priority={index < 2}
            loading={index < 2 ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 mix-blend-multiply" />
        </Link>

        <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-3 sm:left-4 sm:right-4 sm:top-4">
          {photo.userId ? (
            <Link
              href={`/profile/${photo.userId}`}
              style={{ borderRadius: 'var(--radius-sm)' }}
              className="max-w-[70%] truncate border border-[var(--border)] bg-[var(--surface-3)]/60 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[var(--text-dim)] backdrop-blur-sm transition-colors hover:text-[var(--text)]"
            >
              {photo.authorName || "Unknown artist"}
            </Link>
          ) : (
            <span style={{ borderRadius: 'var(--radius-sm)' }} className="max-w-[70%] truncate border border-[var(--border)] bg-[var(--surface-3)]/60 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)] backdrop-blur-sm">
              {photo.authorName || "Unknown artist"}
            </span>
          )}
          <span className="font-mono text-[9px] tracking-[0.14em] text-[var(--text-muted)]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            {photo.location ? (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{photo.location}</span>
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Location withheld
              </span>
            )}
            <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {photo.category.toLowerCase()}
            </span>
          </div>
          <h3 className="line-clamp-2 text-[1.45rem] leading-[0.95] text-[var(--text)] sm:text-[1.6rem]">
            {title}
          </h3>
          {exifLine && (
            <p className="mt-3 truncate text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
              {exifLine}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-[var(--border)] text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
        <span className="inline-flex items-center justify-center gap-1.5 border-r border-[var(--border)] px-2 py-3">
          <Heart className="h-3 w-3" aria-hidden="true" />
          {formatMetric(photo.likeCount)}
        </span>
        <span className="inline-flex items-center justify-center gap-1.5 border-r border-[var(--border)] px-2 py-3">
          <Star className="h-3 w-3" aria-hidden="true" />
          {photo.avgRating.toFixed(1)}
        </span>
        <span className="inline-flex items-center justify-center gap-1.5 px-2 py-3">
          <MessageCircle className="h-3 w-3" aria-hidden="true" />
          {formatMetric(photo.commentCount)}
        </span>
      </div>
    </article>
  );
}

export default function GallerySection({
  photos,
  totalPhotos,
  categoryCounts,
  activeCategory,
  currentPage,
  sortBy,
  query,
}: GallerySectionProps) {
  const totalPages = Math.ceil(totalPhotos / PAGE_SIZE);

  const previousHref = buildGalleryHref({ page: currentPage - 1, category: activeCategory, sortBy, query });
  const nextHref = buildGalleryHref({ page: currentPage + 1, category: activeCategory, sortBy, query });

  return (
    <section id="gallery" style={{ paddingBottom: 'var(--footer-padding)' }} className="py-10 text-[var(--text)] sm:py-14 lg:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-0 sm:px-4 lg:px-8">
        <div className="border-y border-[var(--border)] px-4 py-6 sm:px-0 sm:py-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--accent)]">
            Open gallery / {totalPhotos} frames
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-3xl text-5xl leading-[0.9] text-[var(--text)] sm:text-6xl lg:text-7xl">
              Recent frames
            </h2>
          </div>
        </div>

        <nav
          className="scrollbar-none overflow-x-auto border-b border-[var(--border)] px-4 py-3 sm:px-0"
          aria-label="Gallery categories"
        >
          <div className="flex min-w-max gap-2">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category.value;
              const href = buildGalleryHref({ page: 1, category: category.value, sortBy, query });

              return (
                <Link
                  key={category.value}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  className={[
                    "inline-flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition-all duration-200",
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
                      : "border-[var(--border)] bg-transparent text-[var(--text-dim)] hover:border-[var(--border-hover)] hover:text-[var(--text)]",
                  ].join(" ")}
                >
                  <span>{category.label}</span>
                  <span className={isActive ? "opacity-90" : "text-[var(--text-muted)]"}>
                    {categoryCounts[category.value] ?? 0}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center justify-between px-4 py-4 sm:px-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Showing {photos.length} of {totalPhotos}
          </p>
          {activeCategory !== "ALL" && (
            <Link
              href={buildGalleryHref({ page: 1, category: "ALL", sortBy, query })}
              className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              Clear
            </Link>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="mx-4 border border-dashed border-[var(--border)] px-6 py-20 text-center text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] sm:mx-0">
            No frames found in this category
          </div>
        ) : (
          /* Enforced grid gap properties and grid configurations cleanly using theme border definitions */
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {photos.map((photo, index) => (
              <GalleryCard key={photo.id} photo={photo} index={index} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mx-4 mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mx-0 sm:mt-10">
            {currentPage > 1 ? (
              <Link
                href={previousHref}
                style={{ borderRadius: 'var(--btn-radius)', border: 'var(--btn-border)', boxShadow: 'var(--btn-shadow)' }}
                className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.16em] text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
              >
                Prev
              </Link>
            ) : (
              <span 
                style={{ borderRadius: 'var(--btn-radius)', border: 'var(--btn-border)', opacity: 0.25 }}
                className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]"
              >
                Prev
              </span>
            )}

            <span className="px-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={nextHref}
                style={{ borderRadius: 'var(--btn-radius)', border: 'var(--btn-border)', boxShadow: 'var(--btn-shadow)' }}
                className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.16em] text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
              >
                Next
              </Link>
            ) : (
              <span 
                style={{ borderRadius: 'var(--btn-radius)', border: 'var(--btn-border)', opacity: 0.25 }}
                className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]"
              >
                Next
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}