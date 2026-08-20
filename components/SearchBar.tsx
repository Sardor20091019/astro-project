"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, CornerDownLeft } from "lucide-react";
import { useEffect, useState, useTransition } from "react"; 

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const currentUrlQuery = searchParams.get("q") || "";
    if (value !== currentUrlQuery && !value) {
      setValue(currentUrlQuery);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    
    params.set("page", "1"); 
    
    startTransition(() => {
      router.replace(`/?${params.toString()}#gallery`, { scroll: false });
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6 px-4 sm:px-0">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center rounded-2xl bg-black border border-white/10 p-2 shadow-sm focus-within:border-(--accent) transition-all">
          
          <div className="flex h-10 w-10 shrink-0 items-center justify-center text-(--text-muted) ml-1">
            <Search size={16} />
          </div>

          <input
            type="text"
            value={value}
            placeholder="Search by title..."
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-transparent border-none px-3 py-2 text-xs sm:text-sm text-(--text) placeholder:text-(--text-muted) focus:outline-none"
          />

          <div className="flex items-center gap-1.5 pr-1">
            {value && (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("q");
                  params.set("page", "1");
                  startTransition(() => {
                    router.replace(`/?${params.toString()}#gallery`, { scroll: false });
                  });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) hover:text-(--text) hover:bg-white/5 transition-colors"
                title="Clear query"
              >
                <X size={14} />
              </button>
            )}

            <button
              type="submit"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-(--text-muted) hover:text-(--text) hover:bg-white/5 transition-colors"
              title="Search"
            >
              <CornerDownLeft size={13} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}