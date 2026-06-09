"use client";
import { useEffect, useRef } from "react";

export default function CursorFollower() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const innerDots = dot.children as HTMLCollectionOf<HTMLDivElement>;
    const leftDot = innerDots[0];
    const rightDot = innerDots[1];

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let targetScale = 1;
    let currentScale = 1;
    let rafId = 0;

    function lerp(a: number, b: number, t: number) { 
      return a + (b - a) * t; 
    }

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
   
      dot!.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }

    function tick() {
      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      currentScale = lerp(currentScale, targetScale, 0.12);
      
    
      ring!.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${currentScale})`;
      rafId = requestAnimationFrame(tick);
    }
function onEnterInteractive() {
  targetScale = 1.5556;
  

  ring!.style.borderColor = "rgba(255, 255, 255, 0.8)";
  ring!.style.background = "rgba(255, 255, 255, 0.15)";
  ring!.style.boxShadow = "inset 0 0 20px rgba(255, 255, 255, 0.4), 0 12px 24px rgba(0,0,0,0.3)";
  

  ring!.style.mixBlendMode = "difference"; 

  if (leftDot && rightDot) {
    leftDot.style.transform = "translate3d(calc(-50% - 6px), -50%, 0)";
    rightDot.style.transform = "translate3d(calc(-50% + 6px), -50%, 0)";
  }
}

function onLeaveInteractive() {
  targetScale = 1;
  

  ring!.style.borderColor = "rgba(255, 255, 255, 0.4)";
  ring!.style.background = "rgba(255, 255, 255, 0.05)";
  ring!.style.boxShadow = "inset 0 0 12px rgba(255, 255, 255, 0.2), 0 8px 16px rgba(0,0,0,0.2)";
  
  ring!.style.mixBlendMode = "normal";

  if (leftDot && rightDot) {
    leftDot.style.transform = "translate3d(-50%, -50%, 0)";
    rightDot.style.transform = "translate3d(-50%, -50%, 0)";
  }
}


    function handleMouseOver(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a, button, [data-mag], .cursor-pointer");
      if (target) {
        onEnterInteractive();
      }
    }

    function handleMouseOut(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a, button, [data-mag], .cursor-pointer");
      if (target) {
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!relatedTarget || !relatedTarget.closest("a, button, [data-mag], .cursor-pointer")) {
          onLeaveInteractive();
        }
      }
    }


    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    
    rafId = requestAnimationFrame(tick);
    document.documentElement.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(rafId);
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        body, button, a, [role='button'], .cursor-pointer, * {
          cursor: none !important;
        }
      `}</style>


      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 99999,
          width: "0px", height: "0px", pointerEvents: "none",
          willChange: "transform",
        }}
      >

        <div
          style={{
            position: "absolute", width: "6px", height: "6px", borderRadius: "50%",
            background: "#E8421A", transition: "transform .2s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: "translate3d(-50%, -50%, 0)", willChange: "transform",
          }}
        />
 
        <div
          style={{
            position: "absolute", width: "6px", height: "6px", borderRadius: "50%",
            background: "#E8421A", transition: "transform .2s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: "translate3d(-50%, -50%, 0)", willChange: "transform",
          }}
        />
      </div>

<div
  ref={ringRef}
  style={{
    position: "fixed", top: 0, left: 0, zIndex: 99998,
    width: "40px", height: "40px", borderRadius: "50%",
    

    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    

    border: "1px solid rgba(255, 255, 255, 0.4)",
    boxShadow: `
      inset 0 0 12px rgba(255, 255, 255, 0.2), 
      0 8px 16px rgba(0, 0, 0, 0.2)
    `,
    

    pointerEvents: "none",
    transition: "transform 0.1s ease-out, border-color 0.3s ease, box-shadow 0.3s ease",
    willChange: "transform",
  }}
/>
    </>
  );
}