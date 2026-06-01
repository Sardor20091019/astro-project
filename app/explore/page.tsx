import { prisma } from "@/lib/prisma";
import PhotoGrid from "@/components/PhotoGrid";
import MapComponent from "@/components/MapWrapper";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  // Query all approved photos from local Postgres DB
  const photos = await prisma.photo.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-24">
        
        {/* Header */}
        <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.34em] text-red-500">
              Interactive Cartography
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
              Geomapping
            </h1>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-white/45">
            Explore ASTROSPECTRUM photographic frames mapped in real-time. Hover over pins to see meta specifications and tap to load cinematic viewports.
          </p>
        </header>

        {/* Leaflet Dark Mode Map Component */}
        <div className="mb-14">
          <MapComponent photos={photos} />
        </div>

        {/* Photo Grid Section */}
        <div className="border-t border-white/10 pt-10">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-white/70">
            Tagged gallery items ({photos.length})
          </h2>
          {photos.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/15 px-6 py-20 text-center text-white/45">
              No photos have been uploaded and approved yet.
            </div>
          ) : (
            <PhotoGrid initialPhotos={photos} />
          )}
        </div>

      </div>
    </div>
  );
}