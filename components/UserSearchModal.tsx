"use client";

import { useState, useEffect, useRef } from "react";
import { searchUsers } from "@/app/actions/search";
import Link from "next/link";
import { Search, Loader2, User as UserIcon, X, ArrowRight } from "lucide-react";

interface SearchedUser {
  id: string;
  name: string | null;
  telegramUsername?: string | null;
  image?: string | null;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const users = await searchUsers(query);
          setResults(users);
        } catch (error) {
          console.error("Failed to search users:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div 
        style={{ borderRadius: "var(--radius)" }}
        className="relative w-full max-w-xl bg-black border border-(--border) shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-(--border) px-4 py-3 bg-black">
          <Search className="h-4 w-4 text-(--text-muted) shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search photographers by name or handle..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-(--text) text-xs uppercase tracking-[0.14em] focus:outline-none placeholder:text-(--text-muted)"
          />
          {isLoading && (
            <Loader2 className="h-4 w-4 text-(--accent) animate-spin shrink-0 ml-2" />
          )}
          <button 
            onClick={onClose}
            className="ml-3 p-1 rounded hover:bg-white/5 text-(--text-muted) hover:text-(--text) transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-2 divide-y divide-(--border)/40 flex-1 bg-black">
          {query.trim().length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-(--text-muted)">
                Type to find creators on Astrospectrum
              </p>
            </div>
          ) : isLoading && results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-(--text-muted)">
                Searching database...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-(--text-muted)">
                No photographers found for &quot;{query}&quot;
              </p>
            </div>
          ) : (
            results.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                onClick={onClose}
                style={{ borderRadius: "var(--radius-sm)" }}
                className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-white/5 border border-(--border) flex items-center justify-center overflow-hidden text-(--text-dim)">
                    {user.image ? (
                      <img src={user.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-(--text) truncate group-hover:text-(--accent) transition-colors">
                      {user.name || "Anonymous creator"}
                    </p>
                    {user.telegramUsername && (
                      <p className="text-[9px] uppercase tracking-[0.14em] text-(--text-muted) truncate">
                        @{user.telegramUsername}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
              </Link>
            ))
          )}
        </div>

        {/* Footer Shortcut Hint */}
        <div className="px-4 py-2 border-t border-(--border) bg-black flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-(--text-muted)">
          <span>Navigate with cursor</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}