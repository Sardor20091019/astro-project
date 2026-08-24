"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import UserSearchModal from "./UserSearchModal";

export default function UserSearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev); // Toggle open/closed state globally
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2.5 bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/50 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] hover:text-[var(--text)] transition-all duration-300 shadow-sm cursor-pointer"
        title="Search creators (Cmd+K)"
      >
        <Search className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
        <span className="hidden xl:inline font-medium">Search</span>
        <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[8px] font-mono bg-[var(--surface-2)] border border-[var(--border)] rounded text-[var(--text-dim)] shadow-2xs">
          ⌘K
        </kbd>
      </button>

      <UserSearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}