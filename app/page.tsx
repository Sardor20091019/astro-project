import Hero from "@/components/Hero";
import { prisma } from "@/lib/prisma";
import GallerySection from "@/components/GallerySection";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const pageSize = 9;
  const skipAmount = (currentPage - 1) * pageSize;

  const [photos, ratingRows, totalPhotos] = await Promise.all([
    prisma.photo.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      skip: skipAmount,
      take: pageSize,
      include: {
        _count: { select: { likes: true, comments: true, ratings: true } },
      },
    }),
    prisma.rating.groupBy({
      by: ["photoId"],
      _avg: { value: true },
    }),
    prisma.photo.count({
      where: { status: "APPROVED" },
    }),
  ]);

  const ratingMap = new Map(
    ratingRows.map(r => [r.photoId, Number((r._avg.value ?? 0).toFixed(1))])
  );

  const photosWithRatings = photos.map(p => ({
    ...p,
    avgRating: ratingMap.get(p.id) ?? 0,
  }));

  const totalPages = Math.ceil(totalPhotos / pageSize);

  return (
    /* THIS CONTAINER FORCES FOOTER TO THE BOTTOM */
    <div className="flex flex-col min-h-screen bg-black text-white justify-between">
      
      {/* Content wrapper handles the main page scroll naturally */}
      <div className="flex-grow w-full">
        <Hero />
        
        {/* Gallery viewport constraint */}
        <div className="container mx-auto px-4 py-8">
          <GallerySection photos={photosWithRatings} />
        </div>

        {/* Safe Pagination Controls inside the main flow */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 py-12">
            {currentPage > 1 ? (
              <a 
                href={`?page=${currentPage - 1}`}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-800 transition select-none"
              >
                Previous
              </a>
            ) : (
              <button disabled className="px-4 py-2 bg-zinc-950 text-zinc-700 border border-zinc-900 text-sm rounded-lg cursor-not-allowed">
                Previous
              </button>
            )}

            <span className="text-sm text-zinc-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <a 
                href={`?page=${currentPage + 1}`}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-800 transition select-none"
              >
                Next
              </a>
            ) : (
              <button disabled className="px-4 py-2 bg-zinc-950 text-zinc-700 border border-zinc-900 text-sm rounded-lg cursor-not-allowed">
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* GLOBAL FOOTER: Forced structurally to stay beneath everything */}
      <footer className="w-full py-6 text-center border-t border-zinc-900 bg-black text-zinc-600 mt-auto">
        <p>© {new Date().getFullYear()} Astrospectrum. All rights reserved.</p>
      </footer>
    </div>
  );
}