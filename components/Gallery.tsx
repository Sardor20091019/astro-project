import { prisma } from "@/lib/prisma";
import Image from "next/image";

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
    return <div className="text-zinc-500 text-center py-12">No photos found.</div>;
  }

  return (
    <div className="flex flex-col space-y-10 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="flex flex-col group">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
              <Image 
                src={photo.url} 
                alt={photo.title || "Gallery image"} 
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                priority={currentPage === 1}
              />
            </div>
            <p className="mt-2 text-sm text-zinc-400 font-medium truncate">
              {photo.title || "Untitled"}
            </p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
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