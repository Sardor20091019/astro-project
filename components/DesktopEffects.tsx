"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LenisProvider = dynamic(() => import("@/components/LenisProvider"), {
  ssr: false,
});
const CursorFollower = dynamic(() => import("@/components/CursorFollower"), {
  ssr: false,
});

export default function DesktopEffects({ children }: { children: React.ReactNode }) {
  const [desktopEffectsEnabled, setDesktopEffectsEnabled] = useState(false);
  const [cursorEnabled, setCursorEnabled] = useState(false); // Default to false (normal cursor)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const syncEffectsState = () => setDesktopEffectsEnabled(media.matches);

    syncEffectsState();
    media.addEventListener("change", syncEffectsState);

    // Optional: Load saved preference from localStorage
    const savedCursorPref = localStorage.getItem("astrospectrum_cursor");
    if (savedCursorPref === "true") {
      setCursorEnabled(true);
    }

    return () => media.removeEventListener("change", syncEffectsState);
  }, []);

  const toggleCursor = () => {
    const nextState = !cursorEnabled;
    setCursorEnabled(nextState);
    localStorage.setItem("astrospectrum_cursor", String(nextState));
  };

  if (!desktopEffectsEnabled) {
    return <>{children}</>;
  }

  return (
    <LenisProvider>
      {cursorEnabled && <CursorFollower />}
      
      {/* Your site content */}
      {children}

      {/* A subtle toggle button fixed in the corner (e.g., bottom-right) */}
      <button
        onClick={toggleCursor}
        style={{ borderRadius: "var(--radius-sm)" }}
        className="fixed bottom-6 right-6 z-50 border border-(--border) bg-(--surface-1)/80 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-(--text-dim) backdrop-blur-md transition-all hover:border-(--border-hover) hover:text-(--text) shadow-lg"
        title="Toggle custom cursor follower"
      >
        Cursor: <span className={cursorEnabled ? "text-(--accent)" : "text-(--text-muted)"}>{cursorEnabled ? "Custom" : "Default"}</span>
      </button>
    </LenisProvider>
  );
}