"use client";

import { useTheme } from "./ThemeProvider";
import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { id: "void", label: "Void", desc: "Deep monochrome dark", color: "bg-zinc-950 border-zinc-700" },
    { id: "brutalist", label: "Brutalist", desc: "High contrast raw edge", color: "bg-amber-200 border-black text-black" },
    { id: "glass", label: "Glass", desc: "Translucent blur aesthetic", color: "bg-white/40 backdrop-blur-md border-white/60" },
  ];

  // Close dropdown on outside click or scroll
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
    <div className="relative flex items-center h-full perspective-[1400px]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderRadius: "var(--radius-sm)" }}
        className="group relative flex items-center gap-2.5 bg-(--surface-1) border-2 border-(--border) px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-(--text) hover:border-(--accent) hover:text-(--accent) transition-all duration-300 shadow-md hover:shadow-xl active:scale-95"
        title="Change theme aesthetic"
      >
        <Palette className="h-4 w-4 text-(--accent) transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110" />
        <span>STYLE</span>
      </button>

      {/* 3D Mechanical Unfolding Dropdown - Safe alignment for both mobile & desktop */}
      {isOpen && (
        <div 
          style={{ 
            borderRadius: "var(--radius)",
            transformOrigin: "top",
            animation: "unfoldDropdownSmooth 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
          className="absolute left-0 md:right-0 md:left-auto top-full mt-3 w-60 bg-(--surface-1) border-2 border-(--border) shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden backdrop-blur-2xl"
        >
          <div className="p-2 flex flex-col gap-1.5">
            <div className="px-3 py-2 text-[9px] uppercase tracking-[0.25em] text-(--text) font-black border-b-2 border-(--border)/60 mb-1">
              Select Aesthetic Engine
            </div>

            {themes.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  style={{ borderRadius: "var(--radius-sm)" }}
                  className={`w-full text-left px-3.5 py-3 transition-all duration-300 flex items-center justify-between group transform active:scale-[0.97] ${
                    isActive
                      ? "bg-(--accent) text-(--bg) font-bold shadow-lg shadow-(--accent)/30 translate-x-1.5 scale-[1.02]"
                      : "text-(--text-dim) hover:bg-(--surface-2) hover:text-(--text) hover:translate-x-1.5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Glowing 3D Orb Indicator */}
                    <span className={`h-3.5 w-3.5 rounded-full border-2 shadow-md transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 ${t.color} ${isActive ? "ring-2 ring-white/80 scale-125 shadow-white/50" : ""}`} />
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] uppercase tracking-[0.18em] font-black leading-tight truncate">
                        {t.label}
                      </span>
                      <span className={`text-[9px] tracking-wide font-normal lowercase opacity-80 truncate ${isActive ? "text-(--bg)" : "text-(--text-muted)"}`}>
                        {t.desc}
                      </span>
                    </div>
                  </div>

                  {isActive && <Check className="h-4 w-4 shrink-0 animate-in zoom-in spin-in-90 duration-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Slower, butter-smooth unfolding keyframe */}
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