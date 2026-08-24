"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
// Import your theme hook or context here (e.g., next-themes or custom context)
// import { useTheme } from "next-themes"; 

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  // const { theme, setTheme } = useTheme();

  // Ensure component only renders theme-dependent UI on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a matching placeholder skeleton to prevent layout shift during SSR
    return (
      <div 
        className="flex items-center justify-center h-9 w-9 bg-(--surface) border-2 border-(--border)"
        style={{ borderRadius: "var(--radius, 0.5rem)" }}
      />
    );
  }

  // Determine current theme state (example logic)
  const isDark = true; // Replace with your actual theme check (e.g., theme === 'dark')

  return (
    <button
      onClick={() => {
        // Toggle theme logic here
      }}
      style={{ borderRadius: "var(--radius, 0.5rem)" }}
      className="flex items-center justify-center h-9 w-9 bg-(--surface) border-2 border-(--border) transition-colors hover:bg-(--surface-2)"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-(--accent) transition-transform duration-200" />
      ) : (
        <Moon className="h-4 w-4 text-(--accent) transition-transform duration-200" />
      )}
    </button>
  );
}