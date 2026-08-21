import { prisma } from "@/lib/prisma";
import PhotosClientView from "@/components/PhotosClientView";

export const dynamic = "force-dynamic";

interface PhotosPageProps {
  searchParams: Promise<{ category?: string; sort?: string; page?: string }>;
}

export type CategoryOption = {
  label: string;
  value: string;
};

export type SortOption = {
  label: string;
  value: string;
};

const CATEGORIES: CategoryOption[] = [
  { label: "All", value: "ALL" },
  { label: "Astrophotography", value: "ASTROPHOTOGRAPHY" },
  { label: "Nature", value: "NATURE" },
  { label: "Sky", value: "SKY" },
  { label: "Moon", value: "MOON" },
  { label: "Warm", value: "WARM" },
  { label: "Street", value: "STREET" },
  { label: "Abstract", value: "ABSTRACT" },
  { label: "Other", value: "OTHER" },
];

const SORT_OPTIONS: SortOption[] = [
  { label: "Latest", value: "latest" },
  { label: "Earliest", value: "earliest" },
  { label: "Most Viewed", value: "views" },
  { label: "Most Liked", value: "likes" },
  { label: "Most Commented", value: "comments" },
  { label: "Highest Rated", value: "rating" },
];

export default async function PhotosPage({ searchParams }: PhotosPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category?.toUpperCase() || "ALL";
  const activeSort = resolvedParams.sort?.toLowerCase() || "latest";
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = 9; // Number of items per page to match your grid layout

  let photos: any[] = [];
  let totalPages = 1;

  try {
    // Fetch approved photos with related metrics
    const rawPhotos = await prisma.photo.findMany({
      where: {
        status: "APPROVED",
        ...(activeCategory !== "ALL"
          ? { category: { equals: activeCategory as any } }
          : {}),
      },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
        ratings: {
          select: { value: true },
        },
      },
    });

    // Map raw data into enriched photo objects with computed stats
    photos = rawPhotos.map((p) => {
      const ratingSum = p.ratings.reduce((acc, r) => acc + r.value, 0);
      const avgRating = p.ratings.length > 0 ? ratingSum / p.ratings.length : 0;
      
      return {
        ...p,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        viewCount: (p as any).views || 0,
        avgRating,
      };
    });

    // Sort in-memory for precise multi-metric ordering
    photos.sort((a, b) => {
      switch (activeSort) {
        case "earliest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "views":
          return (b.viewCount || 0) - (a.viewCount || 0);
        case "likes":
          return b.likeCount - a.likeCount;
        case "comments":
          return b.commentCount - a.commentCount;
        case "rating":
          return b.avgRating - a.avgRating;
        case "latest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Calculate total pages and slice current page slice
    totalPages = Math.ceil(photos.length / limit) || 1;
    const startIndex = (currentPage - 1) * limit;
    photos = photos.slice(startIndex, startIndex + limit);

  } catch (error) {
    console.error("Failed to load photos from database:", error);
  }

  return (
    <PhotosClientView 
      initialPhotos={photos} 
      activeCategory={activeCategory} 
      activeSort={activeSort}
      currentPage={currentPage}
      totalPages={totalPages}
      categories={CATEGORIES}
      sortOptions={SORT_OPTIONS}
    />
  );
}