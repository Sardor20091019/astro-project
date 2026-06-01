"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[55vh] rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center justify-center text-zinc-500 bg-black">
      <span className="text-xs uppercase tracking-widest font-black animate-pulse">
        Initializing Cartography...
      </span>
    </div>
  ),
});

export default MapComponent;
