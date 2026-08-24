/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useRef } from "react";
import { searchUsers } from "@/app/actions/search";
import Link from "next/link";
import { Search, Loader2, User as UserIcon, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
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
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-3 px-3">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Top-Anchored Dropdown Panel */}
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden z-10 flex flex-col"
          >
            {/* Top Search Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
              <Search className="h-4 w-4 text-[var(--accent)] shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search creators..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-[var(--text)] text-xs uppercase tracking-[0.14em] focus:outline-none placeholder:text-[var(--text-muted)] font-medium"
              />
              {isLoading && (
                <Loader2 className="h-4 w-4 text-[var(--accent)] animate-spin shrink-0 ml-3" />
              )}
              <button 
                onClick={onClose}
                className="ml-3 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2 divide-y divide-[var(--border)]/30">
              {query.trim().length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">
                    Type a name or username to search
                  </p>
                </div>
              ) : isLoading && results.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Searching...
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    No results found
                  </p>
                </div>
              ) : (
                results.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--surface-3)] border border-[var(--border)] flex items-center justify-center overflow-hidden text-[var(--text-dim)] shadow-inner">
                        {user.image ? (
                          <img src={user.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">
                          {user.name || "NOT_AVAILABLE"}
                        </p>
                        {user.telegramUsername && (
                          <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)] truncate mt-0.5 font-mono">
                            @{user.telegramUsername}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded-md bg-[var(--surface-3)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-mono">
              <span>Astrospectrum</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-dim)]">ESC</kbd>
                to close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}