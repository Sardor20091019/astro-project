"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import UserSearchModal from "./UserSearchModal";

export default function UserSearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  // Global hotkey listener: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ borderRadius: "var(--radius-sm)" }}
        className="flex items-center gap-3 bg-(--surface-1) border border-(--border) px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-(--text-muted) hover:border-(--border-hover) hover:text-(--text) transition-all shadow-xs group"
      >
        <Search className="h-3.5 w-3.5 text-(--text-muted) group-hover:text-(--accent) transition-colors" />
        <span className="hidden sm:inline">Search creators...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-mono bg-(--surface-2) border border-(--border) rounded text-(--text-dim)">
          ⌘K
        </kbd>
      </button>

      <UserSearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}