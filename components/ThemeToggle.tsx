"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <button
      onClick={toggleMode}
      style={{ borderRadius: "var(--radius-sm)" }}
      className="flex items-center justify-center h-9 w-9 bg-(--surface) border-2 border-(--border) text-(--text) hover:border-(--accent) hover:text-(--accent) transition-all duration-300 shadow-md active:scale-95 cursor-pointer"
      title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
    >
      {mode === "dark" ? (
        <Moon className="h-4 w-4 text-(--accent) transition-transform duration-500 hover:-rotate-12" />
      ) : (
        <Sun className="h-4 w-4 text-(--accent) transition-transform duration-500 hover:rotate-90" />
      )}
    </button>
  );
}