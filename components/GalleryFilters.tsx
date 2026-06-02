"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Heart, MessageSquare, Clock, Star } from "lucide-react";

export default function GalleryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sortBy") || "latest";

  const filterTabs = [
    { id: "latest", label: "Latest", icon: Clock },
    { id: "views", label: "Most Viewed", icon: Eye },
    { id: "likes", label: "Most Liked", icon: Heart },
    { id: "comments", label: "Most Commented", icon: MessageSquare },
    { id: "rated", label: "Highest Rated", icon: Star },
  ];

  const applySortFilter = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", id);
    params.set("page", "1"); // Force reset to page one on filter change
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8 justify-center sm:justify-start">
      {filterTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentSort === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => applySortFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase border transition-all duration-200 ${
              isActive
                ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/25"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Icon size={13} className={isActive ? "text-white" : "text-zinc-500"} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}