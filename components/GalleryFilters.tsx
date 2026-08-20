"use client";

import { useState, useRef, useEffect } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTab = FILTER_TABS.find((t) => t.id === currentSort) || FILTER_TABS[0];
  const ActiveIcon = activeTab.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mb-8 flex justify-end" ref={dropdownRef}>
      {/* Single Unified Dropdown Trigger Container */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="group relative inline-flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-(--surface-1)/50 backdrop-blur-3xl border border-white/10 text-[11px] font-black uppercase tracking-[0.2em] text-(--text) hover:border-(--accent)/50 hover:bg-(--surface-2)/70 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.2)] active:scale-[0.98]"
      >
        <span className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-(--accent)/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={14} className="text-(--accent) transition-transform duration-300 group-hover:rotate-180" />
          <span className="text-(--text-muted) font-mono text-[9px] tracking-widest">SORT</span>
        </div>
        
        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
          <ActiveIcon size={13} className="text-(--accent)" />
          <span className="text-(--text)">{activeTab.label}</span>
          <ChevronDown 
            size={14} 
            className={`text-(--text-muted) transition-transform duration-300 ml-1 ${isOpen ? "rotate-180 text-(--accent)" : ""}`} 
          />
        </div>
      </button>

      {/* Magical Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-72 rounded-3xl bg-(--surface-1)/95 backdrop-blur-3xl border border-white/15 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="rounded-2xl bg-(--surface-2)/60 border border-white/5 overflow-hidden">
            <div className="px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-(--text) border-b border-white/10 bg-white/[0.02]">
              &nbsp;Sort Gallery By
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
                        ? "bg-(--accent) text-(--bg) shadow-md shadow-(--accent)/25"
                        : "text-(--text-muted) hover:text-(--text) hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={14} className={isActive ? "text-(--bg)" : "text-(--accent)"} />
                      <span>{tab.label}</span>
                    </div>
                    {isActive && <Check size={14} className="text-(--bg)" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}