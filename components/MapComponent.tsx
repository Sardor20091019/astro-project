/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Camera, MapPin } from "lucide-react";
// @ts-ignore
import "leaflet/dist/leaflet.css";

const LOCATION_FALLBACKS: Record<string, [number, number]> = {
  uzbekistan: [41.2995, 69.2401],
  tashkent: [41.2995, 69.2401],
  japan: [36.2048, 138.2529],
  tokyo: [35.6762, 139.6503],
  nigeria: [9.0820, 8.6753],
  angola: [-11.2027, 17.8739],
  usa: [37.0902, -95.7129],
  uk: [55.3781, -3.4360],
  germany: [51.1657, 10.4515],
  france: [46.6034, 1.8883],
};

function MapResizer({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

export default function MapComponent({ photos }: { photos: Array<Record<string, any>> }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(raf);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[55vh] rounded-[2.5rem] bg-white/2 border border-white/10 flex items-center justify-center text-zinc-500">
        <span className="text-xs uppercase tracking-widest font-black">Initializing Cartography...</span>
      </div>
    );
  }

  const mappedPhotos = (photos || [])
    .map((photo, index) => {
      let coords: [number, number] | null = null;
      let isApproximate = false;

      // 1. Try exact coordinates first if available
      if (photo.coordinates && typeof photo.coordinates === "string") {
        const parts = photo.coordinates.split(",").map((p: string) => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          coords = [parts[0], parts[1]];
        }
      }

      // 2. Fallback: If no coordinates, check location string and scatter randomly inside that region
      if (!coords && photo.location && typeof photo.location === "string") {
        const normalized = photo.location.toLowerCase().trim();
        for (const [key, baseCoords] of Object.entries(LOCATION_FALLBACKS)) {
          if (normalized.includes(key)) {
            // Use photo ID or index as a seed so the random spot stays consistent on re-renders
            const seed = Number(photo.id) || index + 1;
            const latOffset = Math.sin(seed * 99.1) * 1.8;
            const lngOffset = Math.cos(seed * 43.3) * 1.8;

            coords = [baseCoords[0] + latOffset, baseCoords[1] + lngOffset];
            isApproximate = true;
            break;
          }
        }
      }

      if (!coords || !photo.url) return null;

      return {
        ...photo,
        position: coords,
        isApproximate,
      };
    })
    .filter(Boolean) as Array<Record<string, any> & { position: [number, number]; isApproximate: boolean }>;

  const defaultCenter: [number, number] =
    mappedPhotos.length > 0
      ? mappedPhotos[0].position
      : [41.2995, 69.2401];

  const createCustomMarker = (url: string, isApproximate: boolean) => {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative w-12 h-12 rounded-full ${isApproximate ? 'border-2 border-dashed border-amber-400' : 'border-2 border-red-500'} overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform duration-300 hover:scale-110 bg-zinc-900">
          <img src="${url}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 border border-black/10 rounded-full"></div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -28],
    });
  };

  return (
    <div className="relative w-full h-[55vh] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <MapResizer center={defaultCenter} />
        
        {/* CartoDB Dark Matter Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {mappedPhotos.map((photo) => (
          <Marker
            key={photo.id}
            position={photo.position}
            icon={createCustomMarker(photo.url, photo.isApproximate)}
          >
            <Popup className="custom-popup">
              <div className="w-64 bg-zinc-950/95 text-white p-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-white/5 bg-black">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                  {photo.authorName && (
                    <span className="absolute left-2 top-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white/80 border border-white/5">
                      {photo.authorName}
                    </span>
                  )}
                </div>

                <h3 className="font-black uppercase tracking-tight text-sm mb-1 text-white truncate">
                  {photo.title}
                </h3>
                
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-2">
                  <MapPin size={11} className={photo.isApproximate ? "text-amber-400" : "text-red-500"} />
                  <span className="truncate">{photo.location || "Unknown"}</span>
                </div>

                {photo.isApproximate && (
                  <div className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 mb-3">
                    ⚠️ Approximate region placement (country-level)
                  </div>
                )}

                {photo.camera && (
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-4 border-t border-white/5 pt-2">
                    <Camera size={11} className="text-red-500" />
                    <span className="truncate">{photo.camera}</span>
                  </div>
                )}

                <Link
                  href={`/photos/${photo.id}`}
                  className="block text-center w-full bg-white text-black py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors duration-200"
                >
                  View cinematic frame
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {mappedPhotos.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-sm z-[1000]">
            <div className="p-6 text-center max-w-xs bg-zinc-900/90 rounded-2xl border border-white/10">
              <span className="text-xl block mb-2">🗺️</span>
              <p className="font-bold text-sm mb-1 tracking-widest text-white">No Submissions Found</p>
              <p className="text-[10px] text-zinc-400">Publish images with locations to populate this map.</p>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
}