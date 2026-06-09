"use client";
import { useTheme } from "./ThemeProvider"; 

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md w-max mx-auto my-6 z-50">
      {["void", "brutalist", "glass"].map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`px-4 py-2 text-xs uppercase tracking-widest font-mono rounded-full transition-all duration-300 ${
            theme === t 
              ? "bg-[var(--text)] text-[var(--bg)] shadow-md scale-105" 
              : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}