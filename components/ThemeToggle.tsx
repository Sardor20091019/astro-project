"use client";

import { useTheme } from "./ThemeProvider";
import { useState, useRef, useEffect } from "react";
import { Palette, Check, Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { baseTheme, setBaseTheme, mode, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { id: "void", label: "Void", desc: "Deep monochrome aesthetic" },
    { id: "brutalist", label: "Brutalist", desc: "High contrast raw edge" },
    { id: "glass", label: "Glass", desc: "Translucent blur aesthetic" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 relative h-full perspective-[1400px]" ref={dropdownRef}>
      {/* STYLE DROPDOWN BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderRadius: "var(--radius-sm)" }}
        className="group relative flex items-center gap-2.5 bg-(--surface) border-2 border-(--border) px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-(--text) hover:border-(--accent) hover:text-(--accent) transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 cursor-pointer"
        title="Change theme style"
      >
        <Palette className="h-4 w-4 text-(--accent) transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110" />
        <span>STYLE</span>
      </button>

      {/* SUN / MOON MODE TOGGLE BUTTON */}
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

      {/* 3D MECHANICAL UNFOLDING DROPDOWN */}
      {isOpen && (
        <div 
          style={{ 
            borderRadius: "var(--radius)",
            transformOrigin: "top",
            animation: "unfoldDropdownSmooth 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
          className="absolute left-0 md:right-0 md:left-auto top-full mt-3 w-60 bg-(--surface) border-2 border-(--border) shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden backdrop-blur-2xl"
        >
          <div className="p-2 flex flex-col gap-1.5">
            <div className="px-3 py-2 text-[9px] uppercase tracking-[0.25em] text-(--text) font-black border-b-2 border-(--border)/60 mb-1">
              Select Aesthetic Engine
            </div>

            {themes.map((t) => {
              const isActive = baseTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setBaseTheme(t.id);
                    setIsOpen(false);
                  }}
                  style={{ borderRadius: "var(--radius-sm)" }}
                  className={`w-full text-left px-3.5 py-3 transition-all duration-300 flex items-center justify-between group transform active:scale-[0.97] cursor-pointer ${
                    isActive
                      ? "bg-(--accent) text-(--bg) font-bold shadow-lg shadow-(--accent)/30 translate-x-1.5 scale-[1.02]"
                      : "text-(--text-dim) hover:bg-(--surface-2) hover:text-(--text) hover:translate-x-1.5"
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] uppercase tracking-[0.18em] font-black leading-tight truncate">
                      {t.label}
                    </span>
                    <span className={`text-[9px] tracking-wide font-normal lowercase opacity-80 truncate ${isActive ? "text-(--bg)" : "text-(--text-muted)"}`}>
                      {t.desc}
                    </span>
                  </div>

                  {isActive && <Check className="h-4 w-4 shrink-0 animate-in zoom-in spin-in-90 duration-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes unfoldDropdownSmooth {
          0% {
            opacity: 0;
            transform: perspective(1400px) rotateX(-30deg) translateY(-16px) scale(0.90);
          }
          100% {
            opacity: 1;
            transform: perspective(1400px) rotateX(0deg) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}