/* eslint-disable @typescript-eslint/no-explicit-any */
import Hero from "@/components/Hero";
import { prisma } from "@/lib/prisma";
import GallerySection from "@/components/GallerySection";
import GalleryFilters from "@/components/GalleryFilters";
import SearchBar from "@/components/SearchBar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ 
    page?: string;
    sortBy?: string;
    q?: string;
    category?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const sortBy = resolvedParams.sortBy || "latest";
  const query = resolvedParams.q || "";
  const categoryFilter = resolvedParams.category || "ALL";
  
  const pageSize = 9;
  const skipAmount = (currentPage - 1) * pageSize;

  // 1. Core structural database rules mapping
  const whereFilter: any = { 
    status: "APPROVED" as const,
    title: { contains: query, mode: "insensitive" as const } 
  };

  if (categoryFilter !== "ALL") {
    whereFilter.category = categoryFilter;
  }

  const isSortingByRating = sortBy === "rated";

  let orderByQuery: any = { createdAt: "desc" };
  if (sortBy === "earliest") orderByQuery = { createdAt: "asc" };
  else if (sortBy === "views") orderByQuery = { views: "desc" };
  else if (sortBy === "likes") orderByQuery = { likes: { _count: "desc" } };
  else if (sortBy === "comments") orderByQuery = { comments: { _count: "desc" } };

  // 2. Multi-threaded pipeline handling records and global metrics
  const [photos, ratingRows, totalPhotos, allApprovedPhotos] = await Promise.all([
    prisma.photo.findMany({
      where: whereFilter,
      orderBy: isSortingByRating ? undefined : orderByQuery,
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
    prisma.photo.count({ where: whereFilter }),
    prisma.photo.findMany({
      where: { status: "APPROVED" },
      select: { category: true }
    })
  ]);

  // 3. Compute dynamic real-time catalog matrix numbers
  const countsMap: Record<string, number> = { ALL: allApprovedPhotos.length };
  allApprovedPhotos.forEach(p => {
    const cat = p.category || "OTHER";
    countsMap[cat] = (countsMap[cat] || 0) + 1;
  });

  const ratingMap = new Map(
    ratingRows.map(r => [r.photoId, Number((r._avg.value ?? 0).toFixed(1))])
  );

  let photosWithRatings = photos.map(p => ({
    ...p,
    avgRating: ratingMap.get(p.id) ?? 0,
  }));

  if (isSortingByRating) {
    photosWithRatings = photosWithRatings
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(skipAmount, skipAmount + pageSize);
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white justify-between">
      <div className="bg-zinc-900 p-2 text-center text-xs text-zinc-400">
        {user ? (
          <p>hi, ur currently logged in as: <strong>{user.name}</strong></p>
        ) : (
          <p>hi</p>
        )}
      </div>

      <div className="grow w-full">
        <Hero />
        <div className="container mx-auto px-4 py-8">
          <SearchBar />
          <GalleryFilters />
          <GallerySection 
            photos={photosWithRatings} 
            totalPhotos={totalPhotos}
            categoryCounts={countsMap}
          />
        </div>
      </div>

      <footer className="w-full py-6 text-center border-t border-zinc-900 bg-black text-zinc-600 mt-auto">
        <p>© {new Date().getFullYear()} Astrospectrum. All rights reserved.</p>
      </footer>
    </div>
  );
}