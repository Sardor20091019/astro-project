"use client";

import dynamic from "next/dynamic";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-(--surface-2) rounded-xl flex items-center justify-center font-mono text-xs uppercase tracking-wider text-(--text-muted)">
      Loading Cartography...
    </div>
  ),
});

interface Photo {
  id: string;
  title: string;
  photoUrl: string;
  coordinates: string | null;
  location?: string | null;
  authorName?: string;
}

export default function MapClientWrapper({ photos }: { photos: Photo[] }) {
  return <MapWrapper photos={photos} />;
}