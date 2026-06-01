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
    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPhotos(p => p.filter(x => x.id !== id));
    } else {
      alert("Failed to delete.");
    }
    setDeleting(d => { const n = new Set(d); n.delete(id); return n; });
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/8 py-20 text-center text-zinc-600 text-sm">
        No photos published yet.
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
              <button
                onClick={e => { e.preventDefault(); deletePhoto(photo.id); }}
                disabled={isDeleting}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-zinc-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
              >
                {isDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
