"use client";

import React, { memo } from "react";
import { Film } from "lucide-react";

export const FILM_STOCKS = [
  { id: "normal", label: "Original", filter: "none" },
  { id: "portra", label: "Portra 400 (Warm)", filter: "sepia(0.15) saturate(1.2) contrast(1.05)" },
  { id: "cinestill", label: "CineStill 800T (Teal & Glow)", filter: "hue-rotate(15deg) saturate(1.3) brightness(0.95)" },
  { id: "monochrome", label: "Ilford HP5 (Noir)", filter: "grayscale(1) contrast(1.3) brightness(1.05)" },
  { id: "bleach", label: "Bleach Bypass", filter: "grayscale(0.4) contrast(1.4) brightness(0.9)" },
];

const FILM_FILTER_MAP = new Map(FILM_STOCKS.map((s) => [s.id, s.filter]));

export function getFilmFilterStyle(stockId: string): string {
  return FILM_FILTER_MAP.get(stockId) || "none";
}

interface FilmStockToolbarProps {
  activeStock: string;
  onSelectStock: (stockId: string) => void;
}

export const FilmStockToolbar = memo(function FilmStockToolbar({
  activeStock,
  onSelectStock,
}: FilmStockToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
      <Film className="h-3.5 w-3.5 text-amber-400 shrink-0" />
      {FILM_STOCKS.map((stock) => (
        <button
          key={stock.id}
          onClick={() => onSelectStock(stock.id)}
          className={`px-3 py-1 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
            activeStock === stock.id
              ? "bg-amber-500 text-black font-bold shadow-md"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {stock.label.split(" ")[0]}
        </button>
      ))}
    </div>
  );
});