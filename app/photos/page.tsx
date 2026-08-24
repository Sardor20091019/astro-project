import { prisma } from "@/lib/prisma";
import PhotosClientView from "@/components/PhotosClientView";

export const dynamic = "force-dynamic";

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

export default async function PhotosPage() {
  let photos: any[] = [];

  try {
    // Fetch all approved photos with related metrics
    const rawPhotos = await prisma.photo.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
        ratings: {
          select: { value: true },
        },
      },
      orderBy: {
        createdAt: "desc",
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

  } catch (error) {
    console.error("Failed to load photos from database:", error);
  }

  return (
    <PhotosClientView 
      initialPhotos={photos} 
      categories={CATEGORIES}
      sortOptions={SORT_OPTIONS}
    />
  );
}