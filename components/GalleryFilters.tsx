import Link from "next/link";
import { Clock, Eye, Heart, MessageSquare, Star } from "lucide-react";
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
  return (
    <nav
      aria-label="Gallery sort order"
      className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:justify-start"
    >
      {FILTER_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentSort === tab.id;

        return (
          <Link
            key={tab.id}
            href={buildSortHref({ sortBy: tab.id, activeCategory, query })}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex min-h-[44px] min-w-[44px] items-center gap-2 border px-3.5 py-2.5 text-[10px] uppercase tracking-[0.14em] transition-colors",
              isActive
                ? "border-[#E8421A] bg-[#E8421A] text-white"
                : "border-white/[0.08] bg-[#080808] text-white/45 hover:border-white/20 hover:text-white/75",
            ].join(" ")}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
