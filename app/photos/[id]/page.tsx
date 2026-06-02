import PhotoViewer from "@/components/PhotoViewer";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) notFound();

  const [currentPhoto, allPhotos] = await Promise.all([
    prisma.photo.findUnique({ where: { id: photoId } }),
    prisma.photo.findMany({
      where: { status: "APPROVED" },
      orderBy: { id: "asc" },
    }),
  ]);

  if (!currentPhoto) notFound();

  const userId = session?.user?.id;
  const anonymousToken = cookieStore.get("astro_guest")?.value;
  const viewerWhere = userId
    ? { photoId_userId_unique: { photoId, userId } }
    : anonymousToken
      ? { photoId_anonymousToken_unique: { photoId, anonymousToken } }
      : null;

  const [ratingStats, likes, comments, viewerRating, viewerLike] = await Promise.all([
    prisma.rating.aggregate({
      where: { photoId },
      _avg: { value: true },
      _count: { id: true },
    }),
    prisma.like.count({ where: { photoId } }),
    prisma.comment.count({ where: { photoId } }),
    viewerWhere
      ? prisma.rating.findUnique({
          where: viewerWhere,
          select: { value: true },
        })
      : Promise.resolve(null),
    viewerWhere
      ? prisma.like.findUnique({
          where: viewerWhere,
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      <PhotoViewer
        photos={allPhotos}
        initialId={photoId}
        stats={{
          avg: ratingStats._avg.value ? Number(ratingStats._avg.value.toFixed(1)) : 0,
          total: ratingStats._count.id,
          likes,
          comments,
        }}
        initialEngagement={{
          ratingAverage: ratingStats._avg.value ? Number(ratingStats._avg.value.toFixed(1)) : 0,
          ratingCount: ratingStats._count.id,
          viewerRating: viewerRating?.value ?? null,
          likeCount: likes,
          viewerLiked: Boolean(viewerLike),
          commentCount: comments,
        }}
        session={session}
      />
    </div>
  );
}
