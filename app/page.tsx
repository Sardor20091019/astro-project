/* eslint-disable @typescript-eslint/no-explicit-any */
import Hero from "@/components/Hero";
import { prisma } from "@/lib/prisma";
import GallerySection from "@/components/GallerySection";
import GalleryFilters from "@/components/GalleryFilters";
import SearchBar from "@/components/SearchBar";
import { getCurrentUser } from "@/lib/auth"; // Import the helper

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ 
    page?: string;
    sortBy?: string;
    q?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  // 1. Get the current user
  const user = await getCurrentUser();
  
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const sortBy = resolvedParams.sortBy || "latest";
  const query = resolvedParams.q || "";
  
  const pageSize = 9;
  const skipAmount = (currentPage - 1) * pageSize;

  // 2. Database sorting and filtering logic
  let orderByQuery: any = { createdAt: "desc" };
  if (sortBy === "earliest") orderByQuery = { createdAt: "asc" };
  else if (sortBy === "views") orderByQuery = { views: "desc" };
  else if (sortBy === "likes") orderByQuery = { likes: { _count: "desc" } };
  else if (sortBy === "comments") orderByQuery = { comments: { _count: "desc" } };

  const whereFilter = { 
    status: "APPROVED" as const,
    title: { contains: query, mode: "insensitive" as const } 
  };

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
    prisma.photo.count({ where: whereFilter }),
  ]);

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

  const totalPages = Math.ceil(totalPhotos / pageSize);

  const getPageLink = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("page", targetPage.toString());
    if (sortBy !== "latest") params.set("sortBy", sortBy);
    if (query) params.set("q", query);
    return `?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white justify-between">
      {/* --- User Status Bar --- */}
      <div className="bg-zinc-900 p-2 text-center text-xs text-zinc-400">
        {user ? (
          <div className="flex justify-center items-center gap-2">
            <span>hi, ur currently logged in as: <strong>{user.telegramUsername || user.name} from telegram</strong></span>
          </div>
        ) : (
          <p>hi</p>
        )}
      </div>

      <div className="grow w-full">
        <Hero />
        <div className="container mx-auto px-4 py-8">
          <SearchBar />
          <GalleryFilters />
          <GallerySection photos={photosWithRatings} />
        </div>

        {/* ... Keep your existing Pagination UI here ... */}
        {totalPages > 1 && (
           <div className="flex justify-center items-center space-x-4 py-12">
             {currentPage > 1 ? (
               <a href={getPageLink(currentPage - 1)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-800 transition">Previous</a>
             ) : <button disabled className="px-4 py-2 bg-zinc-950 text-zinc-700 border border-zinc-900 text-sm rounded-lg cursor-not-allowed">Previous</button>}
             
             <span className="text-sm text-zinc-500 font-medium font-mono">Page {currentPage} of {totalPages}</span>
             
             {currentPage < totalPages ? (
               <a href={getPageLink(currentPage + 1)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-800 transition">Next</a>
             ) : <button disabled className="px-4 py-2 bg-zinc-950 text-zinc-700 border border-zinc-900 text-sm rounded-lg cursor-not-allowed">Next</button>}
           </div>
        )}
      </div>

      <footer className="w-full py-6 text-center border-t border-zinc-900 bg-black text-zinc-600 mt-auto">
        <p>© {new Date().getFullYear()} Astrospectrum. All rights reserved.</p>
      </footer>
    </div>
  );
}