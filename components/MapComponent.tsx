"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Camera, Heart, Star, MapPin } from "lucide-react";
// @ts-ignore
import "leaflet/dist/leaflet.css";

type MapPhoto = {
  id: number;
  url: string;
  title: string;
  location: string | null;
  coordinates: string | null;
  camera: string | null;
  authorName: string | null;
  likesCount?: number;
  avgRating?: number;
};

// Component to dynamically adjust map center or bounds
function MapResizer({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

export default function MapComponent({ photos }: { photos: MapPhoto[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[50vh] rounded-4xl bg-white/2 border border-white/10 flex items-center justify-center text-zinc-500">
        <span className="text-xs uppercase tracking-widest font-black">Initializing Cartography...</span>
      </div>
    );
  }

  // Parse coordinates and filter photos that actually have valid geo positions
  const mappedPhotos = photos
    .map((photo) => {
      if (!photo.coordinates) return null;
      const parts = photo.coordinates.split(",").map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return {
          ...photo,
          position: [parts[0], parts[1]] as [number, number],
        };
      }
      return null;
    })
    .filter(Boolean) as (MapPhoto & { position: [number, number] })[];

  // Default center of map (Tashkent / Central Asia, or average of all pins)
  const defaultCenter: [number, number] =
    mappedPhotos.length > 0
      ? mappedPhotos[0].position
      : [41.2995, 69.2401];

  // Custom DivIcon marker generator
  const createCustomMarker = (url: string) => {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative w-12 h-12 rounded-full border-2 border-red-500 overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform duration-300 hover:scale-110">
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
        zoom={6}
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
            icon={createCustomMarker(photo.url)}
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
                
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-3">
                  <MapPin size={11} className="text-red-500" />
                  <span className="truncate">{photo.location || "Unknown"}</span>
                </div>

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
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-(--bg)/60 backdrop-blur-sm z-1000">
            <div className="world-card p-6 text-center max-w-xs">
              <span className="text-xl block mb-2">🗺️</span>
              <p className="world-text-bold mb-1 tracking-widest">No Geo-tagged Submissions</p>
              <p className="text-[10px] world-text-muted">Publish frames with coordinates to populate this map.</p>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
}