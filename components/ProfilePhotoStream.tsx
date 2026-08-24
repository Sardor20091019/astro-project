"use client";

import { useState } from "react";
import ProfilePhotoGrid from "@/components/ProfilePhotoGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProfilePhotoStreamProps {
  photos: any[];
  canDelete: boolean;
}

export default function ProfilePhotoStream({ photos, canDelete }: ProfilePhotoStreamProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(photos.length / itemsPerPage) || 1;
  const paginatedPhotos = photos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  if (photos.length === 0) {
    return (
      <div className="w-full border border-dashed border-(--border) rounded-2xl py-16 text-center bg-(--surface) backdrop-blur-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--text-muted)">
          No frames published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Ensure grid container takes full width */}
      <div className="w-full">
        <ProfilePhotoGrid photos={paginatedPhotos} canDelete={canDelete} />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 bg-(--surface) border border-(--border) px-4 py-3.5 rounded-2xl shadow-md backdrop-blur-md mx-auto">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] font-bold text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <span className="px-3 font-mono text-xs font-bold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-(--surface-2) border border-(--border) font-mono text-[10px] font-bold text-(--text) hover:bg-(--surface-3) transition-all cursor-pointer disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}