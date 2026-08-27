// app/photos/page.tsx
import { getApprovedPhotos } from "@/lib/api/photos";
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
  let photos: Awaited<ReturnType<typeof getApprovedPhotos>> = [];

  try {
    // Fetch photos directly from your NestJS backend API
    photos = await getApprovedPhotos();
  } catch (error) {
    console.error("Failed to load photos from NestJS backend:", error);
  }

  return (
    <PhotosClientView 
      initialPhotos={photos} 
      categories={CATEGORIES}
      sortOptions={SORT_OPTIONS}
    />
  );
}