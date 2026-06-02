/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";

interface GalleryProps {
  currentPage?: number;
}

export default async function Gallery({ currentPage = 1 }: GalleryProps) {
  const pageSize = 9; // Exactly 9 images per page
  const skipAmount = (currentPage - 1) * pageSize;

  // 1. Get total count of valid images to calculate pages
  const totalPhotos = await prisma.photo.count({
    where: {
      NOT: [{ url: "" }, { url: "undefined" }, { url: "null" }],
    },
  });

  const totalPages = Math.ceil(totalPhotos / pageSize);

  // 2. Fetch only the 9 images for the current page
  const photos = await prisma.photo.findMany({
    where: {
      NOT: [{ url: "" }, { url: "undefined" }, { url: "null" }],
    },
    orderBy: { createdAt: "desc" },
    skip: skipAmount,
    take: pageSize,
  });

  if (photos.length === 0) {
    return <div className="text-zinc-500 text-center py-12">No photos found.</div>;
  }

  return (
    <div className="flex flex-col space-y-10 p-4">
      {/* 9-Image Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="flex flex-col group">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
              <img 
                src={photo.url} 
                alt={photo.title || "Gallery image"} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-sm text-zinc-400 font-medium truncate">
              {photo.title || "Untitled"}
            </p>
          </div>
        ))}
      </div>

      {/* Simple UI Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-4">
          {currentPage > 1 ? (
            <a 
              href={`?page=${currentPage - 1}`}
              className="px-4 py-2 bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700 transition"
            >
              Previous
            </a>
          ) : (
            <button disabled className="px-4 py-2 bg-zinc-900 text-zinc-600 text-sm rounded-lg cursor-not-allowed">
              Previous
            </button>
          )}

          <span className="text-sm text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <a 
              href={`?page=${currentPage + 1}`}
              className="px-4 py-2 bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700 transition"
            >
              Next
            </a>
          ) : (
            <button disabled className="px-4 py-2 bg-zinc-900 text-zinc-600 text-sm rounded-lg cursor-not-allowed">
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}