import PhotoViewer from "@/components/PhotoViewer";
import {
  getApprovedPhotos,
  getPhotoById,
} from "@/server/photos.service";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId)) notFound();

  const userId = session?.user?.id;
  const anonymousToken = cookieStore.get("astro_guest")?.value;

  const [currentPhoto, recentPhotosRes] = await Promise.all([
    getPhotoById(photoId, userId, anonymousToken).catch(() => null),
    getApprovedPhotos(1, 20).catch(() => ({ photos: [] })),
  ]);

  if (!currentPhoto) notFound();

  const recentPhotos = Array.isArray(recentPhotosRes)
    ? recentPhotosRes
    : recentPhotosRes?.photos || [];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      <PhotoViewer
        photos={recentPhotos}
        initialId={photoId}
        stats={{
          avg: currentPhoto.ratingAverage ?? 0,
          total: currentPhoto.ratingCount ?? 0,
          likes: currentPhoto.likeCount ?? 0,
          comments: currentPhoto.commentCount ?? 0,
        }}
        initialEngagement={{
          ratingAverage: currentPhoto.ratingAverage ?? 0,
          ratingCount: currentPhoto.ratingCount ?? 0,
          viewerRating: currentPhoto.viewerRating ?? null,
          likeCount: currentPhoto.likeCount ?? 0,
          viewerLiked: Boolean(currentPhoto.viewerLiked),
          commentCount: currentPhoto.commentCount ?? 0,
        }}
        session={session}
      />
    </div>
  );
}
