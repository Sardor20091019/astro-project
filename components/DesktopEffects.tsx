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

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const syncEffectsState = () => setDesktopEffectsEnabled(media.matches);

    syncEffectsState();
    media.addEventListener("change", syncEffectsState);

    return () => media.removeEventListener("change", syncEffectsState);
  }, []);

  if (!desktopEffectsEnabled) {
    return <>{children}</>;
  }

  return (
    <LenisProvider>
      <CursorFollower />
      {children}
    </LenisProvider>
  );
}
