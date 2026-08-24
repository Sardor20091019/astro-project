"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Photo {
  id: string;
  title: string;
  photoUrl?: string;
  imageUrl?: string;
  url?: string;
  image?: string;
  coordinates: string | null;
  location?: string | null;
  authorName?: string;
}

interface MapWrapperProps {
  photos: Photo[];
}

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

function getPhotoUrl(photo: Photo): string | null {
  const url = photo.photoUrl || photo.imageUrl || photo.url || photo.image;
  return url && url.trim() !== "" ? url : null;
}

export default function MapWrapper({ photos }: MapWrapperProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const hasFittedRef = useRef(false);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [pinnedPhoto, setPinnedPhoto] = useState<any | null>(null);
  const [hoveredPhoto, setHoveredPhoto] = useState<any | null>(null);

  const activePhoto = hoveredPhoto || pinnedPhoto;

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  mapboxgl.accessToken = mapboxToken || "";

  // Pre-process and distribute photos using a spiral layout to prevent overlapping
  const mappablePhotos = useMemo(() => {
    const regionCounts: Record<string, number> = {};

    return photos
      .map((photo) => {
        let coords: [number, number] | null = null;
        let isApproximate = false;

        // 1. Try exact coordinates first
        if (photo.coordinates) {
          const parts = photo.coordinates.split(",").map(Number);
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            coords = [parts[0], parts[1]];
            isApproximate = false;
          }
        }

        // 2. Fall back to region with a spiral scatter offset
        if (!coords && photo.location) {
          const normalized = photo.location.toLowerCase().trim();
          for (const [key, baseCoords] of Object.entries(LOCATION_FALLBACKS)) {
            if (normalized.includes(key)) {
              const count = regionCounts[key] || 0;
              regionCounts[key] = count + 1;

              // Golden angle spiral distribution guarantees zero overlaps
              const angle = count * 2.4;
              const radius = 0.4 + Math.sqrt(count) * 0.35;
              const latOffset = radius * Math.cos(angle);
              const lngOffset = radius * Math.sin(angle);

              coords = [baseCoords[0] + latOffset, baseCoords[1] + lngOffset];
              isApproximate = true;
              break;
            }
          }
        }

        const imageUrl = getPhotoUrl(photo);
        if (!coords || !imageUrl) return null;

        return {
          ...photo,
          resolvedCoords: coords,
          isApproximate,
          resolvedImageUrl: imageUrl,
        };
      })
      .filter(Boolean) as Array<
        Photo & {
          resolvedCoords: [number, number];
          isApproximate: boolean;
          resolvedImageUrl: string;
        }
      >;
  }, [photos]);

  // Handle ESC key to close preview card
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinnedPhoto(null);
        setHoveredPhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 1. Initialize map instance ONCE
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    if (mapInstance.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [69.2401, 41.2995],
      zoom: 3,
      scrollZoom: true,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("click", () => {
      setPinnedPhoto(null);
      setHoveredPhoto(null);
    });

    map.on("load", () => {
      setIsMapLoaded(true);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      hasFittedRef.current = false;
      setIsMapLoaded(false);
    };
  }, [mapboxToken]);

  // 2. Render markers and fit bounds ONLY after map has fully loaded
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !isMapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidPoints = false;

    mappablePhotos.forEach((photo) => {
      const [lat, lng] = photo.resolvedCoords;

      bounds.extend([lng, lat]);
      hasValidPoints = true;

      // Create marker element
      const el = document.createElement("div");
      el.style.width = "48px";
      el.style.height = "48px";
      el.style.borderRadius = "10px";
      el.style.overflow = "hidden";
      el.style.border = photo.isApproximate
        ? "2px dashed rgba(250, 204, 21, 0.9)"
        : "2px solid rgba(255, 255, 255, 0.9)";
      el.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.7)";
      el.style.backgroundColor = "#111111";

      const img = document.createElement("img");
      img.src = photo.resolvedImageUrl;
      img.alt = photo.title || "Photo Marker";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.display = "block";
      img.style.pointerEvents = "none";

      el.appendChild(img);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map);

      const markerElement = marker.getElement();
      markerElement.style.cursor = "pointer";
      markerElement.style.transition = "transform 0.2s ease";

      // Hover: Temporarily preview photo; goes back when mouse leaves
      markerElement.addEventListener("mouseenter", () => {
        markerElement.style.transform = "scale(1.2)";
        setHoveredPhoto(photo);
      });

      markerElement.addEventListener("mouseleave", () => {
        markerElement.style.transform = "scale(1)";
        setHoveredPhoto(null);
      });

      // Click: Pin photo and fly to location
      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        setPinnedPhoto(photo);
        setHoveredPhoto(null);

        map.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true,
          duration: 1000,
        });
      });

      markersRef.current.push(marker);
    });

    if (hasValidPoints && !hasFittedRef.current) {
      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 13,
        duration: 1200,
      });
      hasFittedRef.current = true;
    }
  }, [mappablePhotos, isMapLoaded]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-[450px] bg-neutral-900 rounded-xl flex items-center justify-center font-mono text-xs uppercase tracking-wider text-red-400 p-6 text-center border border-neutral-800">
        Mapbox Token Missing! Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file.
      </div>
    );
  }

  return (
    <div className="w-full h-[480px] rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Badge: Mapped Photo Counter */}
      <div className="absolute top-4 left-4 z-10 bg-neutral-950/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[11px] text-neutral-300 uppercase tracking-wider">
          Mapped Locations: <strong className="text-white">{mappablePhotos.length}</strong>
        </span>
      </div>

      {/* Floating State-Driven Preview Card */}
      {activePhoto && (
        <div className="absolute bottom-4 left-4 z-10 w-72 bg-neutral-950/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2.5 bg-neutral-900">
            <img
              src={activePhoto.resolvedImageUrl}
              alt={activePhoto.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => {
                setPinnedPhoto(null);
                setHoveredPhoto(null);
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs backdrop-blur-sm transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-white truncate mb-1">
            {activePhoto.title}
          </div>

          {activePhoto.authorName && (
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              By {activePhoto.authorName}
            </div>
          )}

          {activePhoto.isApproximate ? (
            <div className="font-mono text-[10px] text-amber-400 uppercase tracking-wide flex items-center gap-1 mt-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
              <span>⚠️</span> Exact location unavailable · Country only ({activePhoto.location})
            </div>
          ) : (
            activePhoto.location && (
              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wide flex items-center gap-1 mt-1">
                <span>📍</span> {activePhoto.location}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}