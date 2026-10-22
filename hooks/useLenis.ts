/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/refs */
"use client";
import { useEffect, useRef } from "react";

interface ScrollState {
  y: number;
  velocity: number;
  direction: number;
}

type ScrollCallback = (state: ScrollState) => void;


let lenisInstance: import("lenis").default | null = null;
const subscribers = new Set<ScrollCallback>();
let rafId: number | null = null;

function startLoop() {
  if (rafId !== null) return;
  let idleFrames = 0;
  function tick(t: number) {
    if (lenisInstance) {
      lenisInstance.raf(t);
      if (Math.abs(lenisInstance.velocity || 0) < 0.01 && !lenisInstance.isScrolling) {
        idleFrames++;
        if (idleFrames > 60) {
          rafId = null;
          return;
        }
      } else {
        idleFrames = 0;
      }
    }
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
        window.addEventListener("wheel", startLoop, { passive: true });
        window.addEventListener("touchmove", startLoop, { passive: true });
        window.addEventListener("keydown", startLoop, { passive: true });
      }
      startLoop();
    }

    init();

    const localCb: ScrollCallback = (state) => cbRef.current?.(state);
    if (cb) subscribers.add(localCb);

    return () => {
      mounted = false;
      subscribers.delete(localCb);
      window.removeEventListener("wheel", startLoop);
      window.removeEventListener("touchmove", startLoop);
      window.removeEventListener("keydown", startLoop);
    };

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
