"use client";
import { useEffect, useRef } from "react";

interface ScrollState {
  y: number;
  velocity: number;
  direction: number;
}

type ScrollCallback = (state: ScrollState) => void;

// Global singleton so multiple hooks share one Lenis instance
let lenisInstance: import("lenis").default | null = null;
const subscribers = new Set<ScrollCallback>();
let rafId: number | null = null;

function startLoop() {
  if (rafId !== null) return;
  function tick(t: number) {
    lenisInstance?.raf(t);
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
}

export function useLenis(cb?: ScrollCallback) {
  const cbRef = useRef<ScrollCallback | undefined>(cb);
  cbRef.current = cb;

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!mounted) return;
      if (typeof window === "undefined") return;
      if (!window.matchMedia("(min-width: 768px) and (pointer: fine)").matches) return;

      if (!lenisInstance) {
        const { default: Lenis } = await import("lenis");
        lenisInstance = new Lenis({
          lerp: 0.068,
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.6,
          infinite: false,
        });

        lenisInstance.on("scroll", ({ scroll, velocity, direction }: { scroll: number; velocity: number; direction: number }) => {
          const state: ScrollState = { y: scroll, velocity, direction };
          subscribers.forEach(fn => fn(state));
        });
      }
      startLoop();
    }

    init();

    const localCb: ScrollCallback = (state) => cbRef.current?.(state);
    if (cb) subscribers.add(localCb);

    return () => {
      mounted = false;
      subscribers.delete(localCb);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function destroyLenis() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lenisInstance?.destroy();
  lenisInstance = null;
  subscribers.clear();
}
