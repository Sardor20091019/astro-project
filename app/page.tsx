/* eslint-disable @typescript-eslint/no-explicit-any */
import Hero from "@/components/Hero";
import { prisma } from "@/lib/prisma";
import GallerySection from "@/components/GallerySection";
import GalleryFilters from "@/components/GalleryFilters";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ 
    page?: string;
    sortBy?: string;
    q?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const sortBy = resolvedParams.sortBy || "latest";
  const query = resolvedParams.q || ""; // Captures search term
  
  const pageSize = 9;
  const skipAmount = (currentPage - 1) * pageSize;

  // 1. Build the dynamic database sort query
  let orderByQuery: any = { createdAt: "desc" };

  if (sortBy === "earliest") {
    orderByQuery = { createdAt: "asc" };
  } else if (sortBy === "views") {
    orderByQuery = { views: "desc" };
  } else if (sortBy === "likes") {
    orderByQuery = { likes: { _count: "desc" } };
  } else if (sortBy === "comments") {
    orderByQuery = { comments: { _count: "desc" } };
  }

  // Define Filter
  const whereFilter = { 
    status: "APPROVED" as const,
    title: { contains: query, mode: "insensitive" as const } 
  };

  // 2. Execute database queries
  const isSortingByRating = sortBy === "rated";

  const [photos, ratingRows, totalPhotos] = await Promise.all([
    prisma.photo.findMany({
      where: whereFilter,
      orderBy: orderByQuery,
      skip: isSortingByRating ? undefined : skipAmount,
      take: isSortingByRating ? undefined : pageSize,
      include: {
        _count: { select: { likes: true, comments: true, ratings: true } },
      },
    }),
    prisma.rating.groupBy({
      by: ["photoId"],
      _avg: { value: true },
    }),
    prisma.photo.count({
      where: whereFilter,
    }),
  ]);

  // 3. Assemble ratings mapper
  const ratingMap = new Map(
    ratingRows.map(r => [r.photoId, Number((r._avg.value ?? 0).toFixed(1))])
  );

  let photosWithRatings = photos.map(p => ({
    ...p,
    avgRating: ratingMap.get(p.id) ?? 0,
  }));

  // 4. Handle "Highest Rated" in-memory sorting
  if (isSortingByRating) {
    photosWithRatings = photosWithRatings
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(skipAmount, skipAmount + pageSize);
  }

  const totalPages = Math.ceil(totalPhotos / pageSize);

  // Helper to keep existing filters (sort + search) during pagination
  const getPageLink = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("page", targetPage.toString());
    if (sortBy !== "latest") params.set("sortBy", sortBy);
    if (query) params.set("q", query);
    return `?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white justify-between">
      <div className="grow w-full">
        <Hero />
        
        <div className="container mx-auto px-4 py-8">
          <SearchBar />
          <GalleryFilters />
          <GallerySection photos={photosWithRatings} />
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 py-12">
            {currentPage > 1 ? (
              <a href={getPageLink(currentPage - 1)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-800 transition">Previous</a>
            ) : (
              <button disabled className="px-4 py-2 bg-zinc-950 text-zinc-700 border border-zinc-900 text-sm rounded-lg cursor-not-allowed">Previous</button>
            )}

            <span className="text-sm text-zinc-500 font-medium font-mono">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <a href={getPageLink(currentPage + 1)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-800 transition">Next</a>
            ) : (
              <button disabled className="px-4 py-2 bg-zinc-950 text-zinc-700 border border-zinc-900 text-sm rounded-lg cursor-not-allowed">Next</button>
            )}
          </div>
        )}
      </div>

      <footer className="w-full py-6 text-center border-t border-zinc-900 bg-black text-zinc-600 mt-auto">
        <p>© {new Date().getFullYear()} Astrospectrum. All rights reserved.</p>
      </footer>
    </div>
  );
}