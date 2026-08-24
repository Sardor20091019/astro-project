import { Suspense } from "react";
import PhotoGrid from "@/components/PhotoGrid";
import { photos } from "@/data/photos";

export const dynamic = "force-dynamic";

export default function PhotosPage() {
  return (
    <div className="main-wrapper py-6 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-(--text)">
          Gallery Archive
        </h1>
        <p className="text-xs sm:text-sm text-(--text-dim) font-mono uppercase tracking-[0.15em]">
          Selected moments and captured atmospheres
        </p>
      </div>
      
      <Suspense fallback={<PhotosLoadingSkeleton />}>
        <PhotoGrid initialPhotos={photos} />
      </Suspense>
    </div>
  );
}

function PhotosLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div 
          key={n} 
          style={{ height: "320px" }}
          className="bg-(--surface-2) rounded-2xl border border-(--border) animate-pulse" 
        />
      ))}
    </div>
  );
}