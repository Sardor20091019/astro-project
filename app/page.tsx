import Hero from "@/components/Hero";
import { prisma } from "@/lib/prisma";
import GallerySection from "@/components/GallerySection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Single query with counts + avg ratings via groupBy
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
      <GallerySection photos={photosWithRatings} />
    </main>
  );
}
