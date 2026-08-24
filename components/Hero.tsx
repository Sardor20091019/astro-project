"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import heroImage from "@/public/hero.jpg";

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      const y = window.scrollY;
      if (bgRef.current)    bgRef.current.style.transform = `translateY(${y * 0.45}px) scale(1.05)`;
      if (titleRef.current) titleRef.current.style.transform = `translateY(${y * 0.22}px)`;
      if (subRef.current)   subRef.current.style.transform = `translateY(${y * 0.12}px)`;
      if (metaRef.current)  metaRef.current.style.transform = `translateY(${y * 0.08}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
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
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#050505",
      }}
    >
      {/* Parallax Background Asset */}
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: "-15% 0",
          willChange: "transform",
          zIndex: 0,
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
          className="object-cover brightness-90 contrast-105 transition-transform duration-1000 ease-out"
        />
      </div>

      {/* Cinematic Vignette & Ambient Gradient */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "radial-gradient(circle at center, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.85) 100%), linear-gradient(to bottom, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0.3) 40%, #050505 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }} 
      />

      {/* Architectural Corner Framing Crosshairs */}
      <div style={{ position: "absolute", top: "2rem", left: "2rem", color: "rgba(240,235,225,0.25)", fontSize: "12px", fontFamily: "monospace", zIndex: 12, pointerEvents: "none" }}>+</div>
      <div style={{ position: "absolute", top: "2rem", right: "2rem", color: "rgba(240,235,225,0.25)", fontSize: "12px", fontFamily: "monospace", zIndex: 12, pointerEvents: "none" }}>+</div>
      <div style={{ position: "absolute", bottom: "2rem", left: "2rem", color: "rgba(240,235,225,0.25)", fontSize: "12px", fontFamily: "monospace", zIndex: 12, pointerEvents: "none" }}>+</div>
      <div style={{ position: "absolute", bottom: "2rem", right: "2rem", color: "rgba(240,235,225,0.25)", fontSize: "12px", fontFamily: "monospace", zIndex: 12, pointerEvents: "none" }}>+</div>

      {/* Main Content Wrapper */}
      <div 
        ref={metaRef}
        style={{ 
          position: "relative", 
          zIndex: 10, 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "space-between", 
          height: "100%",
          width: "100%",
          maxWidth: "1360px",
          margin: "0 auto",
          paddingTop: "clamp(3rem, 7vh, 5rem)",
          paddingBottom: "clamp(2.5rem, 6vh, 4rem)",
          paddingLeft: "clamp(1.5rem, 4vw, 3.5rem)",
          paddingRight: "clamp(1.5rem, 4vw, 3.5rem)",
          boxSizing: "border-box",
          willChange: "transform",
        }}
      >
        {/* Top Header Metadata */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            width: "100%",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(-15px)",
            transition: "opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E8421A", display: "inline-block", boxShadow: "0 0 10px #E8421A" }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,235,225,0.7)", fontFamily: "var(--font-mono, monospace)" }}>
              Archive 01 // Curator Edition
            </span>
          </div>

          <span 
            style={{ 
              fontSize: "10px", 
              letterSpacing: "0.28em", 
              textTransform: "uppercase", 
              color: "rgba(240,235,225,0.7)", 
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            Sardor Sunatullayev
          </span>
        </div>

        {/* Center Title & Subtitle Content */}
        <div 
          style={{ 
            textAlign: "center", 
            width: "100%", 
            margin: "auto 0" 
          }}
        >
          <h1
            ref={titleRef}
            style={{
              fontFamily: "'Editorial New', 'Times New Roman', Georgia, serif",
              fontSize: "clamp(48px, 13vw, 168px)",
              fontWeight: 200,
              letterSpacing: "-0.045em",
              lineHeight: 0.88,
              color: "#F4F1EA",
              marginBottom: "1.75rem",
              willChange: "transform",
              whiteSpace: "nowrap",
              textShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <span>
              {part1.split("").map((char, i) => (
                <span key={`p1-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
                  <span
                    style={{
                      display: "inline-block",
                      transform: isLoaded ? "translateY(0)" : "translateY(120%)",
                      opacity: isLoaded ? 1 : 0,
                      transition: `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${250 + i * 28}ms, opacity 0.6s ease ${250 + i * 28}ms`,
                    }}
                  >
                    {char}
                  </span>
                </span>
              ))}
            </span>
            
            <span style={{ color: "#E8421A", fontStyle: "italic", marginLeft: "2px" }}>
              {part2.split("").map((char, i) => {
                const globalIndex = part1.length + i;
                return (
                  <span key={`p2-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
                    <span
                      style={{
                        display: "inline-block",
                        transform: isLoaded ? "translateY(0)" : "translateY(120%)",
                        opacity: isLoaded ? 1 : 0,
                        transition: `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${250 + globalIndex * 28}ms, opacity 0.6s ease ${250 + globalIndex * 28}ms`,
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
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(240,235,225,0.6)",
              maxWidth: "460px",
              marginLeft: "auto",
              marginRight: "auto",
              willChange: "transform",
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(25px)",
              transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.55s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.55s",
              lineHeight: 1.6,
            }}
          >
            A curated visual exploration of light, form, and atmospheric perspective
          </p>
        </div>

        {/* Bottom Bar: Scroll Indicator & Elite CTA */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-end",
            width: "100%",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.75s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.75s"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "var(--font-mono, monospace)", color: "rgba(240,235,225,0.4)" }}>
              Scroll to explore
            </span>
            <div style={{ width: "45px", height: "1px", background: "rgba(240,235,225,0.3)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "#E8421A", animation: "pulse 2s infinite" }} />
            </div>
          </div>

          <div>
            <a
              href="#gallery"
              onClick={handleScrollToGallery}
              style={{
                display: "inline-flex", 
                alignItems: "center",
                gap: "14px",
                padding: "18px 36px", 
                borderRadius: "4px",
                background: "#F4F1EA", 
                color: "#050505",
                fontSize: "10px", 
                fontWeight: 800, 
                letterSpacing: "0.22em", 
                textTransform: "uppercase",
                fontFamily: "var(--font-mono, monospace)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
                cursor: "pointer",
                textDecoration: "none",
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = "#E8421A"; 
                e.currentTarget.style.color = "#F4F1EA";
                e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 20px 45px rgba(232,66,26,0.35)";
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = "#F4F1EA"; 
                e.currentTarget.style.color = "#050505";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)";
              }}
            >
              <span>Enter Gallery</span>
              <span style={{ fontSize: "13px", transition: "transform 0.3s ease" }}>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}