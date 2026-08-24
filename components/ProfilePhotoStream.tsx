/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Trash2 } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  title: string | null;
  location: string | null;
}

interface ProfilePhotoStreamProps {
  photos: Photo[];
  canDelete: boolean;
}

export default function ProfilePhotoStream({ photos, canDelete }: ProfilePhotoStreamProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localPhotos, setLocalPhotos] = useState(photos);

  // Keep local photos in sync if props change
  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  const pageSize = 9; // Exactly 9 images per page
  const totalPages = Math.ceil(localPhotos.length / pageSize);

  const paginatedPhotos = localPhotos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async (photoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this frame?")) return;

    setDeletingId(photoId);
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      if (res.ok) {
        setLocalPhotos((prev) => prev.filter((p) => p.id !== photoId));
        if (paginatedPhotos.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } else {
        alert("Failed to delete photo.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (localPhotos.length === 0) {
    return (
      <div className="w-full py-20 bg-[var(--surface)] border border-[var(--border)] rounded-3xl text-center flex flex-col items-center gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
          No images published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPhotos.map((photo) => (
          <Link
            key={photo.id}
            href={`/photo/${photo.id}`}
            className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-md hover:border-[var(--accent)] transition-all duration-300 flex flex-col"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--surface-2)] relative">
              <img
                src={photo.url}
                alt={photo.title || "Gallery Photo"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {canDelete && (
                <button
                  onClick={(e) => handleDelete(photo.id, e)}
                  disabled={deletingId === photo.id}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                  title="Delete frame"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="p-4 flex flex-col gap-1.5 bg-[var(--surface)]">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text)] truncate">
                {photo.title || "Untitled Frame"}
              </h3>
              {photo.location && (
                <p className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] truncate">
                  <MapPin size={12} className="text-[var(--accent)] shrink-0" />
                  {photo.location}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 w-full">
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.max(1, prev - 1));
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            disabled={currentPage === 1}
            style={{ borderRadius: "0.875rem" }}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-all shadow-sm ${
              currentPage === 1
                ? "bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
            }`}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-dim)] px-3">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => {
              setCurrentPage((prev) => Math.min(totalPages, prev + 1));
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            disabled={currentPage === totalPages}
            style={{ borderRadius: "0.875rem" }}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-all shadow-sm ${
              currentPage === totalPages
                ? "bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
            }`}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}