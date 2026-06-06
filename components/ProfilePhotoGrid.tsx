"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, MapPin, Loader2 } from "lucide-react";

type Photo = {
  id: number;
  url: string;
  title: string;
  location?: string | null;
};

export default function ProfilePhotoGrid({ photos: initial, canDelete }: { photos: Photo[]; canDelete: boolean }) {
  const [photos, setPhotos] = useState(initial);
  const [deleting, setDeleting] = useState<Set<number>>(new Set());

  async function deletePhoto(id: number) {
    if (!confirm("Delete this photo permanently?")) return;
    setDeleting(d => new Set([...d, id]));
    
    try {
      const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhotos(p => p.filter(x => x.id !== id));
      } else {
        alert("Failed to delete. Please try again.");
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setDeleting(d => { const n = new Set(d); n.delete(id); return n; });
    }
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/8 py-20 text-center text-zinc-600 text-sm">
        No frames published yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map(photo => {
        const isDeleting = deleting.has(photo.id);
        return (
          <div
            key={photo.id}
            className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900 aspect-square transition-all ${
              isDeleting ? "opacity-40 pointer-events-none" : "hover:border-red-400/30"
            }`}
          >
            <Link href={`/photos/${photo.id}`}>
              <Image src={photo.url} alt={photo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-white truncate">{photo.title}</p>
                {photo.location && (
                  <p className="text-[9px] text-red-400 font-bold flex items-center gap-1 mt-0.5">
                    <MapPin size={8} />{photo.location}
                  </p>
                )}
              </div>
            </Link>

            {canDelete && (
  <button style={{ color: "white" }}
    onClick={e => { e.preventDefault(); deletePhoto(photo.id); }}
    disabled={isDeleting}
    className={`absolute top-2 right-2 w-9 h-9 rounded-lg bg-red-600 backdrop-blur-md border border-white/20 text-white transition-all flex items-center justify-center  opacity-100 md:opacity-0 md:group-hover:opacity-100 z-20`}
  >
    {isDeleting ? (
      <Loader2 size={16} className="animate-spin text-white" />
    ) : (
      <Trash2 size={16} className="text-white drop-shadow-md" />
    )}
  </button>
)}
          </div>
        );
      })}
    </div>
  );
}