"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default Leaflet marker icon paths in Next.js bundlers
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Photo {
  id: string;
  title: string;
  photoUrl: string;
  coordinates: string | null;
  location?: string | null;
  authorName?: string;
}

interface MapWrapperProps {
  photos: Photo[];
}

export default function MapWrapper({ photos }: MapWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent server-side rendering errors with Leaflet by mounting only on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[450px] bg-(--surface-2) rounded-xl flex items-center justify-center font-mono text-xs uppercase tracking-wider text-(--text-muted)">
        Initializing Cartography...
      </div>
    );
  }

  // Filter photos with valid coordinates and determine initial center
  const validPhotos = photos.filter((p) => p.coordinates);
  let defaultCenter: [number, number] = [41.2995, 69.2401]; // Default fallback coordinates

  if (validPhotos.length > 0 && validPhotos[0].coordinates) {
    const parts = validPhotos[0].coordinates.split(",").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      defaultCenter = [parts[0], parts[1]];
    }
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      scrollWheelZoom={true} // Enables smooth zoom-in and zoom-out on mouse scroll
      className="w-full h-[450px] rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {validPhotos.map((photo) => {
        if (!photo.coordinates) return null;
        const coords = photo.coordinates.split(",").map(Number);
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return null;

        return (
          <Marker key={photo.id} position={[coords[0], coords[1]]} icon={customIcon}>
            <Popup>
              <div className="p-2 max-w-[210px] flex flex-col gap-2.5">
                <img 
                  src={photo.photoUrl} 
                  alt={photo.title} 
                  className="w-full h-28 object-cover rounded-lg border border-(--border)" 
                />
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-mono text-xs font-bold uppercase text-(--text) truncate">
                    {photo.title}
                  </h3>
                  {photo.location && (
                    <p className="font-mono text-[10px] text-(--text-dim) uppercase tracking-wider truncate">
                      {photo.location}
                    </p>
                  )}
                  {photo.authorName && (
                    <p className="font-mono text-[9px] text-(--accent) uppercase tracking-wider">
                      By {photo.authorName}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}