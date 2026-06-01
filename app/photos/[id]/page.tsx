import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PhotoViewer from "@/components/PhotoViewer";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
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

  const [ratingStats, likes, comments] = await Promise.all([
    prisma.rating.aggregate({
      where: { photoId },
      _avg: { value: true },
      _count: { id: true },
    }),
    prisma.like.count({ where: { photoId } }),
    prisma.comment.count({ where: { photoId } }),
  ]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      <PhotoViewer
        photos={allPhotos}
        initialId={photoId}
        stats={{
          avg: ratingStats._avg.value || 0,
          total: ratingStats._count.id,
          likes,
          comments,
        }}
        session={session}
      />
    </div>
  );
}
