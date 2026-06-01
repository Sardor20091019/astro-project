"use client";
import { useEffect, useRef } from "react";

export default function CursorFollower() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only on pointer devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Get handles on the two inner twin dots
    const innerDots = dot.children as HTMLCollectionOf<HTMLDivElement>;
    const leftDot = innerDots[0];
    const rightDot = innerDots[1];

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let rafId = 0;

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      // Snap center anchor position immediately
      dot!.style.transform = `translate(${mx}px,${my}px)`;
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      ring!.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      rafId = requestAnimationFrame(tick);
    }

    function onEnterInteractive() {
      // 1. Keep your original outer ring scaling behavior
      ring!.style.width  = "56px";
      ring!.style.height = "56px";
      ring!.style.borderColor = "rgba(240,235,225,0.7)";
      ring!.style.mixBlendMode = "difference";

      // 2. FIX: Slide the twin dots out to the left and right sides of the center
      if (leftDot && rightDot) {
        leftDot.style.transform = "translate(calc(-50% - 6px), -50%)";
        rightDot.style.transform = "translate(calc(-50% + 6px), -50%)";
      }
    }

    function onLeaveInteractive() {
      // 1. Restore your original outer ring dimensions
      ring!.style.width  = "36px";
      ring!.style.height = "36px";
      ring!.style.borderColor = "rgba(240,235,225,0.35)";
      ring!.style.mixBlendMode = "normal";

      // 2. FIX: Merge the twin dots back together seamlessly in the absolute center
      if (leftDot && rightDot) {
        leftDot.style.transform = "translate(-50%, -50%)";
        rightDot.style.transform = "translate(-50%, -50%)";
      }
    }

    function attachMagnetic(el: Element) {
      el.addEventListener("mouseenter", onEnterInteractive);
      el.addEventListener("mouseleave", onLeaveInteractive);
    }

    // Observe newly added interactive elements too
    const observer = new MutationObserver(() => {
      document.querySelectorAll("a,button,[data-mag],.cursor-pointer").forEach(attachMagnetic);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll("a,button,[data-mag],.cursor-pointer").forEach(attachMagnetic);

    document.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);
    document.documentElement.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* Absolute global suppression of standard browser hand cursors */}
      <style jsx global>{`
        body, button, a, [role='button'], .cursor-pointer, * {
          cursor: none !important;
        }
      `}</style>

      {/* Primary Center Anchor (0x0 container tracking mouse coordinates) */}
      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 99999,
          width: "0px", height: "0px", pointerEvents: "none",
          willChange: "transform",
        }}
      >
        {/* Left Twin Dot */}
        <div
          style={{
            position: "absolute", width: "6px", height: "6px", borderRadius: "50%",
            background: "#E8421A", transition: "transform .2s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: "translate(-50%, -50%)", willChange: "transform",
          }}
        />
        {/* Right Twin Dot */}
        <div
          style={{
            position: "absolute", width: "6px", height: "6px", borderRadius: "50%",
            background: "#E8421A", transition: "transform .2s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: "translate(-50%, -50%)", willChange: "transform",
          }}
        />
      </div>

      {/* Ambient Trailing Physics Circle */}
      <div
        ref={ringRef}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 99998,
          width: "36px", height: "36px", borderRadius: "50%",
          border: "1px solid rgba(240,235,225,0.35)",
          pointerEvents: "none",
          transition: "width .25s ease, height .25s ease, border-color .25s ease",
          willChange: "transform",
        }}
      />
    </>
  );
}