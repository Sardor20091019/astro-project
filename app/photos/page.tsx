import {
  getApprovedPhotos,
  type PaginatedPhotosResult,
} from "@/server/photos.service";
import PhotosClientView from "@/components/PhotosClientView";

export const revalidate = 60;

export type CategoryOption = {
  label: string;
  value: string;
};

const CATEGORIES: CategoryOption[] = [
  { label: "Astrophotography", value: "ASTROPHOTOGRAPHY" },
  { label: "Nature", value: "NATURE" },
  { label: "Sky", value: "SKY" },
  { label: "Moon", value: "MOON" },
  { label: "Warm", value: "WARM" },
  { label: "Street", value: "STREET" },
  { label: "Abstract", value: "ABSTRACT" },
  { label: "Other", value: "OTHER" },
];

export default async function PhotosPage() {
  const initialSeed = Math.floor(Math.random() * 1000000);
  let initialData: PaginatedPhotosResult = {
    photos: [],
    nextCursor: null,
    seed: initialSeed,
  };

  try {
    initialData = await getApprovedPhotos({ seed: initialSeed, limit: 16 });
  } catch (error) {
    console.error("Failed to load photos:", error);
  }

  return (
    <PhotosClientView
      initialPhotos={initialData.photos}
      initialCursor={initialData.nextCursor}
      initialSeed={initialData.seed}
      categories={CATEGORIES}
    />
  );
}
