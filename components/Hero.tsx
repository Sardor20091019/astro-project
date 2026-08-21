/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import heroImage from "@/public/hero.jpg";

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  
  const [animate, setAnimate] = useState(false);

  // Native Parallax Effect using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      const y = window.scrollY;
      if (bgRef.current)    bgRef.current.style.transform = `translateY(${y * 0.42}px)`;
      if (titleRef.current) titleRef.current.style.transform = `translateY(${y * 0.18}px)`;
      if (subRef.current)   subRef.current.style.transform = `translateY(${y * 0.08}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    setAnimate(true);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleScrollToGallery = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#gallery");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth" });
  };

  const part1 = "Astro";
  const part2 = "spectrum";

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Parallax Background Asset */}
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: "-12% 0",
          willChange: "transform",
        }}
      >
        <Image
          src={heroImage}
          alt="Cinematic background space and light"
          fill
          priority
          fetchPriority="high"
          placeholder="blur"
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Ambient Gradient Scrim */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, transparent 40%, #050505 100%)",
          pointerEvents: "none"
        }} 
      />

      {/* Main Content Container */}
      <div 
        style={{ 
          position: "relative", 
          zIndex: 10, 
          textAlign: "center", 
          padding: "0 1.5rem", 
          maxWidth: "100%", 
          margin: "0 auto" 
        }}
      >
        <p 
          style={{ 
            fontSize: "11px", 
            letterSpacing: "0.4em", 
            textTransform: "uppercase", 
            color: "rgba(240,235,225,0.35)", 
            marginBottom: "1.5rem", 
            fontFamily: "var(--font-mono, 'Courier New', monospace)" 
          }}
        >
          Photography by Sardor Sunatullayev
        </p>

        {/* Unified Non-Breaking Header with Original Colors */}
        <h1
          ref={titleRef}
          style={{
            fontFamily: "'Editorial New', 'Times New Roman', Georgia, serif",
            fontSize: "clamp(38px, 11vw, 148px)",
            fontWeight: 200,
            letterSpacing: "-0.045em",
            lineHeight: 0.92,
            color: "#F0EBE1",
            marginBottom: "2rem",
            willChange: "transform",
            whiteSpace: "nowrap",
          }}
        >
          <span>
            {part1.split("").map((char, i) => (
              <span key={`p1-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
                <span
                  style={{
                    display: "inline-block",
                    transform: animate ? "translateY(0)" : "translateY(110%)",
                    opacity: animate ? 1 : 0,
                    transition: `transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${i * 28}ms, opacity 0.4s ease ${i * 28}ms`,
                  }}
                >
                  {char}
                </span>
              </span>
            ))}
          </span>
          
          <span style={{ color: "#E8421A", fontStyle: "italic" }}>
            {part2.split("").map((char, i) => {
              const globalIndex = part1.length + i;
              return (
                <span key={`p2-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
                  <span
                    style={{
                      display: "inline-block",
                      transform: animate ? "translateY(0)" : "translateY(110%)",
                      opacity: animate ? 1 : 0,
                      transition: `transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${globalIndex * 28}ms, opacity 0.4s ease ${globalIndex * 28}ms`,
                    }}
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </span>
        </h1>

        <p
          ref={subRef}
          style={{
            fontFamily: "var(--font-mono, 'Courier New', monospace)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(240,235,225,0.35)",
            marginBottom: "3rem",
            maxWidth: "380px",
            marginLeft: "auto",
            marginRight: "auto",
            willChange: "transform",
          }}
        >
          Exploring light, color, and the world through photography
        </p>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <a
            href="#gallery"
            onClick={handleScrollToGallery}
            className="min-h-11 min-w-11 cursor-pointer"
            style={{
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "13px 28px", 
              borderRadius: "2px",
              background: "#F0EBE1", 
              color: "#050505",
              fontSize: "10px", 
              fontWeight: 900, 
              letterSpacing: "0.18em", 
              textTransform: "uppercase",
              fontFamily: "var(--font-mono, 'Courier New', monospace)",
              transition: "background .2s, color .2s, transform .2s",
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = "#E8421A"; 
              e.currentTarget.style.color = "#F0EBE1"; 
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = "#F0EBE1"; 
              e.currentTarget.style.color = "#050505"; 
            }}
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
            View Frames
          </a>
        </div>
      </div>

      {/* Animated Scroll Down indicator */}
      <div 
        style={{ 
          position: "absolute", 
          bottom: "2.5rem", 
          left: "50%", 
          transform: "translateX(-50%)", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "8px", 
          opacity: 0.3,
          pointerEvents: "none"
        }}
      >
        <span style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-mono,'Courier New',monospace)", color: "#F0EBE1" }}>
          Scroll
        </span>
        <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, #F0EBE1, transparent)" }} />
      </div>
    </section>
  );
}