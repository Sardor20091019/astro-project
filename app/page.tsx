import Hero from "@/components/Hero";
import { prisma } from "@/lib/prisma";
import GallerySection from "@/components/GallerySection";
import PhotoUploadZone from "@/components/PhotoUploadZone";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [photos, ratingRows] = await Promise.all([
    prisma.photo.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { likes: true, comments: true, ratings: true } },
      },
    }),
    prisma.rating.groupBy({
      by: ["photoId"],
      _avg: { value: true },
    }),
  ]);

  const ratingMap = new Map(ratingRows.map(r => [r.photoId, Number((r._avg.value ?? 0).toFixed(1))]));

  const photosWithRatings = photos.map(p => ({
    ...p,
    avgRating: ratingMap.get(p.id) ?? 0,
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <div className="max-w-xl mx-auto my-10 px-4">
        <PhotoUploadZone />
      </div>
      
      <GallerySection photos={photosWithRatings} />
    </main>
  );
}