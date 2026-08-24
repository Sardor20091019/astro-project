import { prisma } from "@/lib/prisma";
import PhotoGrid from "@/components/PhotoGrid";
import MapClientWrapper from "@/components/MapClientWrapper";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const photos = await prisma.photo.findMany({
    where: { 
      status: "APPROVED",
      OR: [
        { 
          AND: [
            { coordinates: { not: null } },
            { coordinates: { not: "" } }
          ]
        },
        { 
          AND: [
            { location: { not: null } },
            { location: { not: "" } }
          ]
        }
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-(--bg) text-(--text) min-h-screen transition-colors duration-300 flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center">
        
        {/* Header Section */}
        <header className="mb-12 max-w-2xl flex flex-col items-center text-center mx-auto">
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-(--surface-2) border border-(--border) mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-(--accent) animate-pulse" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-(--accent)">
              Geotagged Archive
            </p>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl mb-4 text-(--text)">
            Geomapping
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-(--text-dim) font-mono uppercase tracking-wider max-w-lg mx-auto">
            Browse photographs mapped by their location coordinates and region names.
          </p>
        </header>

        {/* Map Component Container */}
        <div className="w-full max-w-5xl mb-16 bg-(--surface) border border-(--border) p-3 rounded-2xl shadow-xl backdrop-blur-md mx-auto">
          <div className="w-full rounded-xl overflow-hidden border border-(--border)">
            <MapClientWrapper photos={photos} />
          </div>
        </div>

        {/* Photo Grid Section */}
        <div className="w-full max-w-5xl border-t border-(--border) pt-12 flex flex-col items-center mx-auto">
          <div className="inline-flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-xl bg-(--surface-2) border border-(--border) mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent)" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-(--text-dim)">
              Tagged Gallery Items ({photos.length})
            </h2>
          </div>

          {photos.length === 0 ? (
            <div className="w-full max-w-md rounded-2xl border border-dashed border-(--border) bg-(--surface-2) px-6 py-16 text-center text-(--text-muted) font-mono text-xs uppercase tracking-wider mx-auto">
              No mapped frames have been approved yet.
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-full">
                <PhotoGrid initialPhotos={photos} />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}