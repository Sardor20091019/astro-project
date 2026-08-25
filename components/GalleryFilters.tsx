"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Clock, Eye, Heart, MessageSquare, Star, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import type { PhotoCategory } from "@/data/photos";

interface GalleryFiltersProps {
  currentSort: string;
  activeCategory: PhotoCategory | "ALL";
  query: string;
}

const FILTER_TABS = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "earliest", label: "Earliest", icon: Clock },
  { id: "views", label: "Most Viewed", icon: Eye },
  { id: "likes", label: "Most Liked", icon: Heart },
  { id: "comments", label: "Most Commented", icon: MessageSquare },
  { id: "rated", label: "Highest Rated", icon: Star },
];

function buildSortHref({
  sortBy,
  activeCategory,
  query,
}: {
  sortBy: string;
  activeCategory: PhotoCategory | "ALL";
  query: string;
}) {
  const params = new URLSearchParams();
  if (sortBy !== "latest") params.set("sortBy", sortBy);
  if (activeCategory !== "ALL") params.set("category", activeCategory);
  if (query.trim()) params.set("q", query.trim());

  const queryString = params.toString();
  return queryString ? `/?${queryString}#gallery` : "/#gallery";
}

export default function GalleryFilters({
  currentSort,
  activeCategory,
  query,
}: GalleryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTab = FILTER_TABS.find((t) => t.id === currentSort) || FILTER_TABS[0];
  const ActiveIcon = activeTab.icon;

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Using viewport-relative coordinates (no scrollY needed)
      setCoords({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-6 flex justify-end">
      {/* Dropdown Trigger Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="group relative inline-flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-[var(--surface)] backdrop-blur-3xl border border-[var(--border)] text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] transition-all duration-300 shadow-md active:scale-[0.98] cursor-pointer"
      >
        <span className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={14} className="text-[var(--accent)] transition-transform duration-300 group-hover:rotate-180" />
          <span className="text-[var(--text-muted)] font-mono text-[9px] tracking-widest">SORT</span>
        </div>
        
        <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)]">
          <ActiveIcon size={13} className="text-[var(--accent)]" />
          <span className="text-[var(--text)]">{activeTab.label}</span>
          <ChevronDown 
            size={14} 
            className={`text-[var(--text-muted)] transition-transform duration-300 ml-1 ${isOpen ? "rotate-180 text-[var(--accent)]" : ""}`} 
          />
        </div>
      </button>

      {/* Rendered via Portal with fixed positioning to ignore page scroll offsets */}
      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            right: `${coords.right}px`,
          }}
          className="w-72 rounded-3xl bg-[var(--surface)] backdrop-blur-3xl border border-[var(--border)] p-2 shadow-2xl z-[99999] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden">
            <div className="px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text)] border-b border-[var(--border)] bg-[var(--surface)]">
              Sort Gallery By
            </div>

            <div className="p-1.5 space-y-1">
              {FILTER_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentSort === tab.id;

                return (
                  <Link
                    key={tab.id}
                    href={buildSortHref({ sortBy: tab.id, activeCategory, query })}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/25"
                        : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={14} className={isActive ? "text-white" : "text-[var(--accent)]"} />
                      <span>{tab.label}</span>
                    </div>
                    {isActive && <Check size={14} className="text-white" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}