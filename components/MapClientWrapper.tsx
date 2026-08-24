"use client";

import dynamic from "next/dynamic";
import React from "react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[55vh] rounded-[2.5rem] bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500">
      <span className="text-xs uppercase tracking-widest font-black">Initializing Cartography...</span>
    </div>
  ),
});

export default function MapClientWrapper({ photos }: { photos: Array<Record<string, any>> }) {
  return <MapComponent photos={photos} />;
}