import GalleryFilters from "@/components/GalleryFilters";
import GallerySection, { type GalleryPhoto } from "@/components/GallerySection";
import SearchBar from "@/components/SearchBar";
import { CATEGORIES, type PhotoCategory } from "@/data/photos";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 9;
const SORT_OPTIONS = ["latest", "earliest", "views", "likes", "comments", "rated"] as const;
type GallerySort = (typeof SORT_OPTIONS)[number];

interface HomeGalleryProps {
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    q?: string;
    category?: string;
  }>;
}

function parsePositivePage(value: string | undefined) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parseSort(value: string | undefined): GallerySort {
  return SORT_OPTIONS.find((option) => option === value) ?? "latest";
}

function parseCategory(value: string | undefined): PhotoCategory | "ALL" {
  const category = CATEGORIES.find((item) => item.value === value);
  return category?.value ?? "ALL";
}

function createCategoryCounts() {
  return CATEGORIES.reduce<Record<PhotoCategory | "ALL", number>>((counts, category) => {
    counts[category.value] = 0;
    return counts;
  }, {
    ALL: 0,
    ASTROPHOTOGRAPHY: 0,
    NATURE: 0,
    SKY: 0,
    MOON: 0,
    WARM: 0,
    STREET: 0,
    ABSTRACT: 0,
    OTHER: 0,
  });
}

export function HomeGallerySkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto my-6 h-12 w-full max-w-md border border-white/[0.08] bg-[#080808]" />
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-11 w-28 border border-white/[0.08] bg-[#080808]" />
        ))}
      </div>
      <section className="bg-[#080808] py-10 text-[#F0EBE1] sm:py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="border-y border-white/[0.07] px-4 py-6 sm:px-0 sm:py-8">
            <div className="h-3 w-48 bg-white/[0.08]" />
            <div className="mt-4 h-14 w-64 bg-white/[0.08]" />
          </div>
          <div className="grid grid-cols-1 gap-px bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <div key={index} className="aspect-[4/5] bg-[#0D0D0D] sm:aspect-[3/4] lg:aspect-[4/3]" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default async function HomeGallery({ searchParams }: HomeGalleryProps) {
  const resolvedParams = await searchParams;
  const currentPage = parsePositivePage(resolvedParams.page);
  const sortBy = parseSort(resolvedParams.sortBy);
  const query = resolvedParams.q?.trim() || "";
  const categoryFilter = parseCategory(resolvedParams.category);
  const skipAmount = (currentPage - 1) * PAGE_SIZE;

  const whereFilter: Prisma.PhotoWhereInput = {
    status: "APPROVED",
    NOT: [{ url: "" }, { url: "undefined" }, { url: "null" }],
    ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
  };

  if (categoryFilter !== "ALL") {
    whereFilter.category = categoryFilter;
  }

  const isSortingByRating = sortBy === "rated";

  let orderByQuery: Prisma.PhotoOrderByWithRelationInput = { createdAt: "desc" };
  if (sortBy === "earliest") orderByQuery = { createdAt: "asc" };
  else if (sortBy === "views") orderByQuery = { views: "desc" };
  else if (sortBy === "likes") orderByQuery = { likes: { _count: "desc" } };
  else if (sortBy === "comments") orderByQuery = { comments: { _count: "desc" } };

  const [photos, totalPhotos, categoryRows] = await Promise.all([
    prisma.photo.findMany({
      where: whereFilter,
      orderBy: isSortingByRating ? undefined : orderByQuery,
      skip: isSortingByRating ? undefined : skipAmount,
      take: isSortingByRating ? undefined : PAGE_SIZE,
      include: {
        _count: { select: { likes: true, comments: true, ratings: true } },
      },
    }),
    prisma.photo.count({ where: whereFilter }),
    prisma.photo.groupBy({
      by: ["category"],
      where: {
        status: "APPROVED",
        NOT: [{ url: "" }, { url: "undefined" }, { url: "null" }],
        ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
      },
      _count: { category: true },
    }),
  ]);

  const currentPhotoIds = photos.map((photo) => photo.id);
  const ratingRows = currentPhotoIds.length
    ? await prisma.rating.groupBy({
        by: ["photoId"],
        where: { photoId: { in: currentPhotoIds } },
        _avg: { value: true },
      })
    : [];

  const countsMap = createCategoryCounts();
  countsMap.ALL = categoryRows.reduce((total, row) => total + row._count.category, 0);
  categoryRows.forEach((row) => {
    countsMap[row.category] = row._count.category;
  });

  const ratingMap = new Map(
    ratingRows.map((row) => [row.photoId, Number((row._avg.value ?? 0).toFixed(1))])
  );

  let photosWithRatings: GalleryPhoto[] = photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    title: photo.title,
    location: photo.location,
    category: photo.category,
    authorName: photo.authorName,
    userId: photo.userId,
    camera: photo.camera,
    iso: photo.iso,
    aperture: photo.aperture,
    shutter: photo.shutter,
    focalLength: photo.focalLength,
    avgRating: ratingMap.get(photo.id) ?? 0,
    likeCount: photo._count.likes,
    commentCount: photo._count.comments,
    ratingCount: photo._count.ratings,
  }));

  if (isSortingByRating) {
    photosWithRatings = photosWithRatings
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(skipAmount, skipAmount + PAGE_SIZE);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar />
      <GalleryFilters currentSort={sortBy} activeCategory={categoryFilter} query={query} />
      <GallerySection
        photos={photosWithRatings}
        totalPhotos={totalPhotos}
        categoryCounts={countsMap}
        activeCategory={categoryFilter}
        currentPage={currentPage}
        sortBy={sortBy}
        query={query}
      />
    </div>
  );
}