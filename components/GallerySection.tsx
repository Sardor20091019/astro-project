// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Aperture, Camera as CameraIcon, Clock, Heart, Loader2, MapPin, MessageCircle, Star, Maximize2 } from "lucide-react";
// import { CATEGORIES, type PhotoCategory } from "@/data/photos";
// import { motion } from "framer-motion";

// export interface GalleryPhoto {
//   id: number;
//   url: string;
//   title: string;
//   location: string | null;
//   category: PhotoCategory | "OTHER";
//   authorName: string | null;
//   userId: string | null;
//   camera: string | null;
//   iso: number | null;
//   aperture: string | null;
//   shutter: string | null;
//   focalLength: string | null;
//   avgRating: number;
//   likeCount: number;
//   commentCount: number;
//   ratingCount: number;
// }

// interface GallerySectionProps {
//   photos: GalleryPhoto[];
//   totalPhotos: number;
//   categoryCounts: Record<PhotoCategory | "ALL", number>;
//   activeCategory: PhotoCategory | "ALL";
//   currentPage: number;
//   sortBy: string;
//   query: string;
//   isLoading?: boolean;
// }

// const PAGE_SIZE = 12;

// function buildGalleryHref({
//   page,
//   category,
//   sortBy,
//   query,
// }: {
//   page: number;
//   category: PhotoCategory | "ALL";
//   sortBy: string;
//   query: string;
// }) {
//   const params = new URLSearchParams();
//   if (page > 1) params.set("page", String(page));
//   if (sortBy && sortBy !== "latest") params.set("sortBy", sortBy);
//   if (query.trim()) params.set("q", query.trim());
//   if (category !== "ALL") params.set("category", category);

//   const queryString = params.toString();
//   return queryString ? `/?${queryString}#gallery` : "/#gallery";
// }

// function formatMetric(value: number) {
//   if (value < 1000) return String(value);
//   if (value < 1000000) return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)}k`;
//   return `${(value / 1000000).toFixed(1)}m`;
// }

// function GalleryCardSkeleton() {
//   return (
//     <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 flex flex-col shadow-2xl">
//       <style dangerouslySetInnerHTML={{ __html: `
//         @keyframes explicitShimmer {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
//         .animate-shimmer-sweep {
//           animation: explicitShimmer 1.4s infinite linear;
//           background: linear-gradient(
//             90deg, 
//             transparent 0%, 
//             rgba(255, 255, 255, 0.25) 50%, 
//             transparent 100%
//           );
//         }
//       `}} />

//       <div className="relative aspect-4/3 w-full bg-white/10 overflow-hidden">
//         <div className="absolute inset-0 animate-shimmer-sweep pointer-events-none" />
//       </div>

//       <div className="p-5 flex flex-col gap-4 flex-grow justify-between bg-black/40">
//         <div className="flex flex-col gap-3">
//           <div className="flex items-center justify-between gap-2">
//             <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
//             <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
//           </div>
//           <div className="h-5 w-3/4 bg-white/30 rounded animate-pulse" />
//           <div className="h-3 w-1/2 bg-white/15 rounded animate-pulse" />
//         </div>

//         <div className="grid grid-cols-3 pt-3 border-t border-white/10 gap-2">
//           <div className="h-3 bg-white/15 rounded animate-pulse" />
//           <div className="h-3 bg-white/15 rounded animate-pulse" />
//           <div className="h-3 bg-white/15 rounded animate-pulse" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function GalleryCard({ photo, index }: { photo: GalleryPhoto; index: number }) {
//   const [isImageLoaded, setIsImageLoaded] = useState(false);
//   const title = photo.title.trim() || "Untitled frame";

//   return (
//     <motion.article 
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
//       className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-white/20 transition-all duration-500 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
//     >
//       <style dangerouslySetInnerHTML={{ __html: `
//         @keyframes explicitShimmer {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
//         .animate-shimmer-sweep {
//           animation: explicitShimmer 1.4s infinite linear;
//           background: linear-gradient(
//             90deg, 
//             transparent 0%, 
//             rgba(255, 255, 255, 0.25) 50%, 
//             transparent 100%
//           );
//         }
//       `}} />

//       {/* Image Frame with Shimmer Overlay Until Real Photo Downloads */}
//       <div className="relative aspect-4/3 w-full overflow-hidden bg-[var(--surface-2)]">
//         <div 
//           className={`absolute inset-0 z-30 bg-white/5 overflow-hidden pointer-events-none transition-opacity duration-500 ${
//             isImageLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
//           }`}
//         >
//           <div className="absolute inset-0 animate-shimmer-sweep pointer-events-none" />
//         </div>

//         <Link
//           href={`/photos/${photo.id}`}
//           className="absolute inset-0 z-20 block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
//           aria-label={`Open ${title}`}
//         >
//           <span className="sr-only">View {title}</span>
//         </Link>

//         <Image
//           src={photo.url}
//           alt={title}
//           fill
//           unoptimized={true}
//           priority={index < 2}
//           loading={index < 2 ? "eager" : "lazy"}
//           onLoad={() => setIsImageLoaded(true)}
//           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//           className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
//             isImageLoaded ? "opacity-100" : "opacity-0"
//           }`}
//         />

//         {/* Ambient Gradient Vignette on Hover */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />

//         {/* Top Badges */}
//         <div className="absolute left-3 top-3 z-30 flex items-center gap-2 pointer-events-none">
//           <span className="bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-[0.18em] text-white/90">
//             {photo.category.toLowerCase()}
//           </span>
//         </div>
        
//         <div className="absolute right-3 top-3 z-30 pointer-events-none">
//           <span className="font-mono text-[9px] tracking-[0.14em] text-white/70 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
//             {String(index + 1).padStart(2, "0")}
//           </span>
//         </div>
//       </div>

//       {/* Content & Metadata Area */}
//       <div className="p-5 flex flex-col gap-4 flex-grow justify-between bg-[var(--surface)]">
//         <div className="flex flex-col gap-2.5">
//           <div className="flex items-center justify-between gap-2">
//             {photo.location ? (
//               <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
//                 <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
//                 <span className="truncate">{photo.location}</span>
//               </span>
//             ) : (
//               <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
//                 Location withheld
//               </span>
//             )}

//             {photo.userId ? (
//               <Link
//                 href={`/profile/${photo.userId}`}
//                 className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)] hover:text-[var(--text)] truncate max-w-[50%] transition-colors relative z-30 font-medium"
//               >
//                 {photo.authorName || "Artist"}
//               </Link>
//             ) : (
//               <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] truncate max-w-[50%]">
//                 {photo.authorName || "Artist"}
//               </span>
//             )}
//           </div>

//           <h3 className="text-base font-bold tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
//             {title}
//           </h3>

//           {/* Styled Colorful EXIF Metadata Renderer */}
//           {(() => {
//             const cam = photo.camera?.trim();
//             const foc = photo.focalLength?.trim();
//             const apt = photo.aperture?.trim();
//             const sht = photo.shutter?.trim();
//             const isoVal = photo.iso;

//             if (!cam && !foc && !apt && !sht && !isoVal) return null;

//             const isCombinedString = cam && (cam.includes("•") || cam.includes("/"));

//             if (isCombinedString) {
//               const cleanedCam = cam.replace(/^Xiaomi\s+Xiaomi/i, "Xiaomi");
//               return (
//                 <div className="flex flex-wrap items-center gap-1.5 pt-1">
//                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/50 font-mono text-[9px] text-[var(--text)] transition-colors">
//                     <CameraIcon className="w-3 h-3 text-[var(--accent)] shrink-0" />
//                     <span className="truncate">{cleanedCam}</span>
//                   </span>
//                 </div>
//               );
//             }

//             return (
//               <div className="flex flex-wrap items-center gap-1.5 pt-1">
//                 {cam && (
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/50 font-mono text-[9px] text-[var(--text)] transition-colors">
//                     <CameraIcon className="w-2.5 h-2.5 text-[var(--accent)] shrink-0" />
//                     <span className="truncate max-w-[130px]">{cam}</span>
//                   </span>
//                 )}
//                 {foc && (
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/50 font-mono text-[9px] text-[var(--text)] transition-colors">
//                     <Maximize2 className="w-2.5 h-2.5 text-[var(--accent)] shrink-0" />
//                     <span>{foc}</span>
//                   </span>
//                 )}
//                 {apt && (
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/50 font-mono text-[9px] text-[var(--text)] transition-colors">
//                     <Aperture className="w-2.5 h-2.5 text-[var(--accent)] shrink-0" />
//                     <span>{apt}</span>
//                   </span>
//                 )}
//                 {sht && (
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/50 font-mono text-[9px] text-[var(--text)] transition-colors">
//                     <Clock className="w-2.5 h-2.5 text-[var(--accent)] shrink-0" />
//                     <span>{sht}</span>
//                   </span>
//                 )}
//                 {isoVal && (
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/50 font-mono text-[9px] text-[var(--text)] transition-colors">
//                     <span className="text-[var(--accent)] font-bold">ISO</span>
//                     <span>{isoVal}</span>
//                   </span>
//                 )}
//               </div>
//             );
//           })()}
//         </div>

//         {/* Metrics Bar */}
//         <div className="grid grid-cols-3 pt-3 border-t border-[var(--border)] text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
//           <span className="inline-flex items-center justify-center gap-1.5 border-r border-[var(--border)] pr-2">
//             <Heart className="h-3 w-3 text-rose-500" aria-hidden="true" />
//             {formatMetric(photo.likeCount)}
//           </span>
//           <span className="inline-flex items-center justify-center gap-1.5 border-r border-[var(--border)] px-2">
//             <Star className="h-3 w-3 text-amber-400" aria-hidden="true" />
//             {photo.avgRating.toFixed(1)}
//           </span>
//           <span className="inline-flex items-center justify-center gap-1.5 pl-2">
//             <MessageCircle className="h-3 w-3 text-sky-400" aria-hidden="true" />
//             {formatMetric(photo.commentCount)}
//           </span>
//         </div>

//       </div>
//     </motion.article>
//   );
// }

// export default function GallerySection({
//   photos,
//   totalPhotos,
//   categoryCounts,
//   activeCategory,
//   currentPage,
//   sortBy,
//   query,
//   isLoading = false,
// }: GallerySectionProps) {
//   const totalPages = Math.ceil(totalPhotos / PAGE_SIZE);

//   const previousHref = buildGalleryHref({ page: currentPage - 1, category: activeCategory, sortBy, query });
//   const nextHref = buildGalleryHref({ page: currentPage + 1, category: activeCategory, sortBy, query });

//   return (
//     <section id="gallery" style={{ paddingBottom: 'var(--footer-padding)' }} className="py-12 text-[var(--text)] sm:py-16 lg:py-20 w-full flex justify-center">
//       <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col">
        
//         {/* Header Section */}
//         <div className="border-y border-[var(--border)] py-8 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
//               <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)] font-mono font-bold">
//                 Cinematic Archive
//               </p>
//             </div>
//             <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl text-[var(--text)]">
//               Gallery Frames
//             </h2>
//           </div>
//           <p className="text-xs uppercase font-mono tracking-widest text-[var(--text-muted)]">
//             Total Collection / {totalPhotos}
//           </p>
//         </div>

//         {/* Categories Filter Tabs */}
//         <nav
//           className="scrollbar-none overflow-x-auto border-b border-[var(--border)] py-4 mb-8"
//           aria-label="Gallery categories"
//         >
//           <div className="flex min-w-max gap-4">
//             {CATEGORIES.map((category) => {
//               const isActive = activeCategory === category.value;
//               const href = buildGalleryHref({ page: 1, category: category.value, sortBy, query });

//               return (
//                 <Link
//                   key={category.value}
//                   href={href}
//                   aria-current={isActive ? "page" : undefined}
//                   className={[
//                     "inline-flex items-center justify-between gap-6 px-10 py-4 rounded-2xl text-[10px] uppercase tracking-[0.18em] font-bold transition-all duration-300 min-w-[280px]",
//                     isActive
//                       ? "bg-[var(--accent)] text-[var(--bg)] shadow-lg shadow-[var(--accent)]/20 scale-[1.02]"
//                       : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-dim)] hover:border-white/20 hover:text-[var(--text)]",
//                   ].join(" ")}
//                 >
//                   <span className="truncate">{category.label}</span>
//                   <span className={isActive ? "opacity-90 font-mono text-[10px] px-2.5 py-1 rounded-md bg-black/20" : "text-[var(--text-muted)] font-mono text-[10px] px-2.5 py-1 rounded-md bg-[var(--surface-2)]"}>
//                     {categoryCounts[category.value] ?? 0}
//                   </span>
//                 </Link>
//               );
//             })}
//           </div>
//         </nav>

//         {/* Count Bar, Clear Filter & Live Loading Status Indicator */}
//         <div className="flex items-center justify-between pb-6">
//           <div className="flex items-center gap-3">
//             <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-[var(--text-muted)]">
//               {isLoading ? "Fetching collection..." : `Showing ${photos.length} of ${totalPhotos} entries`}
//             </p>
//             {isLoading && (
//               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[9px] uppercase tracking-[0.14em] text-[var(--accent)] font-mono font-bold animate-pulse">
//                 <Loader2 className="h-3 w-3 animate-spin" />
//                 Loading images...
//               </span>
//             )}
//           </div>
//           {activeCategory !== "ALL" && (
//             <Link
//               href={buildGalleryHref({ page: 1, category: "ALL", sortBy, query })}
//               className="text-[10px] uppercase tracking-[0.18em] font-bold text-[var(--accent)] hover:underline transition-colors"
//             >
//               Reset category filter
//             </Link>
//           )}
//         </div>

//         {/* Gallery Grid or Skeletons */}
//         {isLoading ? (
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <GalleryCardSkeleton key={`skeleton-${i}`} />
//             ))}
//           </div>
//         ) : photos.length === 0 ? (
//           <div className="border border-dashed border-[var(--border)] rounded-2xl px-6 py-24 text-center text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
//             No images found matching criteria
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//             {photos.map((photo, index) => (
//               <GalleryCard key={photo.id} photo={photo} index={index} />
//             ))}
//           </div>
//         )}

//         {/* Pagination Controls (Full-Width Grid Aligned) */}
//         {totalPages > 1 && !isLoading && (
//           <div className="mt-16 flex items-center justify-between gap-6 w-full">
//             {currentPage > 1 ? (
//               <Link
//                 href={previousHref}
//                 className="flex-1 py-4 px-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text)] transition-all hover:border-white/30 hover:bg-[var(--surface-2)] shadow-lg"
//               >
//                 ← Previous Page
//               </Link>
//             ) : (
//               <span className="flex-1 py-4 px-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-muted)] opacity-30 cursor-not-allowed">
//                 ← Previous Page
//               </span>
//             )}

//             <div className="px-6 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] font-mono text-[10px] tracking-[0.25em] text-[var(--text)] shrink-0">
//               {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
//             </div>

//             {currentPage < totalPages ? (
//               <Link
//                 href={nextHref}
//                 className="flex-1 py-4 px-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text)] transition-all hover:border-white/30 hover:bg-[var(--surface-2)] shadow-lg"
//               > 
//                 Next Page →
//               </Link>
//             ) : (
//               <span className="flex-1 py-4 px-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-muted)] opacity-30 cursor-not-allowed">
//                 Next Page →
//               </span>
//             )}
//           </div>
//         )}

//       </div>
//     </section>
//   );
// }