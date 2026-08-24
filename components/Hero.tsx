"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import heroImage from "@/public/hero.jpg";

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Native Parallax Effect & Mount Trigger using requestAnimationFrame
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
    
    const timer = setTimeout(() => setIsLoaded(true), 50);

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
      }}
    >
      {/* Parallax Background Asset */}
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: "-12% 0",
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
          className="object-cover scale-105 transition-transform duration-1000 ease-out"
        />
      </div>

      {/* Ambient Gradient Scrim */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.2) 50%, #050505 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }} 
      />

      {/* Main Content Wrapper matching site container width */}
      <div 
        style={{ 
          position: "relative", 
          zIndex: 10, 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "space-between", 
          height: "100%",
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "clamp(2rem, 5vh, 3.5rem)",
          paddingBottom: "clamp(2rem, 5vh, 3.5rem)",
          paddingLeft: "clamp(1rem, 3vw, 2rem)",
          paddingRight: "clamp(1rem, 3vw, 2rem)",
          boxSizing: "border-box",
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
            transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s"
          }}
        >
          <span 
            style={{ 
              fontSize: "10px", 
              letterSpacing: "0.3em", 
              textTransform: "uppercase", 
              color: "rgba(240,235,225,0.5)", 
              fontFamily: "var(--font-mono, 'Courier New', monospace)",
            }}
          >
            Photography Archive
          </span>
          <span 
            style={{ 
              fontSize: "10px", 
              letterSpacing: "0.3em", 
              textTransform: "uppercase", 
              color: "rgba(240,235,225,0.5)", 
              fontFamily: "var(--font-mono, 'Courier New', monospace)",
            }}
          >
            Sardor Sunatullayev
          </span>
        </div>

        {/* Center Title Content */}
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
              fontSize: "clamp(42px, 12vw, 156px)",
              fontWeight: 200,
              letterSpacing: "-0.045em",
              lineHeight: 0.9,
              color: "#F0EBE1",
              marginBottom: "1.5rem",
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
                      transform: isLoaded ? "translateY(0)" : "translateY(110%)",
                      opacity: isLoaded ? 1 : 0,
                      transition: `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${200 + i * 25}ms, opacity 0.5s ease ${200 + i * 25}ms`,
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
                        transform: isLoaded ? "translateY(0)" : "translateY(110%)",
                        opacity: isLoaded ? 1 : 0,
                        transition: `transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${200 + globalIndex * 25}ms, opacity 0.5s ease ${200 + globalIndex * 25}ms`,
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
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(240,235,225,0.5)",
              maxWidth: "420px",
              marginLeft: "auto",
              marginRight: "auto",
              willChange: "transform",
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s"
            }}
          >
            Exploring light, form, and atmosphere through the lens
          </p>
        </div>

        {/* Bottom Bar with Enter Gallery on the Right */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-end",
            width: "100%",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-mono, 'Courier New', monospace)", color: "rgba(240,235,225,0.4)" }}>
              Scroll down
            </span>
            <div style={{ width: "35px", height: "1px", background: "rgba(240,235,225,0.3)" }} />
          </div>

          {/* Enter Gallery Button Forced to Right Side of Content Grid */}
          <div style={{ marginLeft: "auto" }}>
            <a
              href="#gallery"
              onClick={handleScrollToGallery}
              style={{
                display: "inline-flex", 
                alignItems: "center",
                gap: "12px",
                padding: "16px 32px", 
                borderRadius: "2px",
                background: "#F0EBE1", 
                color: "#050505",
                fontSize: "10px", 
                fontWeight: 900, 
                letterSpacing: "0.2em", 
                textTransform: "uppercase",
                fontFamily: "var(--font-mono, 'Courier New', monospace)",
                transition: "background .25s ease, color .25s ease, transform .25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow .25s ease",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                cursor: "pointer",
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = "#E8421A"; 
                e.currentTarget.style.color = "#F0EBE1";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = "#F0EBE1"; 
                e.currentTarget.style.color = "#050505";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span>Enter Gallery</span>
              <span style={{ fontSize: "12px" }}>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}