"use client";

import dynamic from "next/dynamic";

const LenisController = dynamic(() => import("@/components/LenisProvider"), {
  ssr: false,
});

export default function DesktopEffects({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LenisController />
      {children}
    </>
  );
}