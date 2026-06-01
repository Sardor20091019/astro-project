"use client";
import { useEffect } from "react";
import { useLenis } from "@/hooks/useLenis";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useLenis(); // boot the singleton
  return <>{children}</>;
}
