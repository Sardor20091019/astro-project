"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import heroImage from "@/public/hero.jpg";
import { Camera, Compass, ArrowUpRight } from "lucide-react";

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      const y = window.scrollY;
      if (bgRef.current) bgRef.current.style.transform = `translateY(${y * 0.38}px) scale(1.04)`;
      if (contentRef.current) contentRef.current.style.transform = `translateY(${y * 0.15}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(() => setIsLoaded(true), 120);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, []);

  const handleScrollToGallery = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.querySelector("#gallery")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        width: "100%",
        backgroundColor: "#030303",
        boxSizing: "border-box",
      }}
    >
      {/* Immersive Background Asset with Parallax */}
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: "-10% 0",
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
          className="object-cover brightness-75 contrast-110 transition-transform duration-1000 ease-out"
        />
      </div>

      {/* Cinematic Multi-Layer Scrim */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(135deg, rgba(3,3,3,0.9) 0%, rgba(3,3,3,0.3) 50%, rgba(3,3,3,0.85) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }} 
      />

      {/* Main Container */}
      <div 
        ref={contentRef}
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          maxWidth: "1440px",
          width: "100%",
          margin: "0 auto",
          padding: "clamp(2rem, 5vh, 4rem) clamp(1.5rem, 4vw, 4rem)",
          boxSizing: "border-box",
          willChange: "transform",
        }}
      >
        {/* Top Header Row */}
        <div 
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(-15px)",
            transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#E8421A", display: "inline-block", boxShadow: "0 0 12px #E8421A" }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,225,0.7)", fontFamily: "var(--font-mono, monospace)", fontWeight: 600 }}>
              Astrospectrum // 2026.Ed
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span className="hidden sm:inline-block" style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,235,225,0.5)", fontFamily: "var(--font-mono, monospace)" }}>
              Curated by Sardor Sunatullayev
            </span>
            <div style={{ padding: "6px 12px", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "10px", fontFamily: "var(--font-mono, monospace)", color: "#F4F1EA", letterSpacing: "0.15em" }}>
              LIVE ARCHIVE
            </div>
          </div>
        </div>

        {/* Center Editorial Split Content */}
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            alignItems: "flex-end",
            width: "100%",
            margin: "auto 0",
          }}
        >
          {/* Left Column: Massive Kinetic Typography */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <h1
              style={{
                fontFamily: "'Editorial New', 'Times New Roman', Georgia, serif",
                fontSize: "clamp(52px, 11vw, 150px)",
                fontWeight: 200,
                letterSpacing: "-0.04em",
                lineHeight: 0.88,
                color: "#F4F1EA",
                margin: 0,
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(30px)",
                transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
                textShadow: "0 20px 40px rgba(0,0,0,0.6)",
              }}
            >
              Visual <br />
              <span style={{ color: "#E8421A", fontStyle: "italic" }}>Spectra.</span>
            </h1>

            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(240,235,225,0.65)",
                maxWidth: "400px",
                lineHeight: 1.6,
                margin: 0,
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.45s",
              }}
            >
              An uncompromising exploration of structural geometry, natural light, and optical framing.
            </p>
          </div>

          {/* Right Column: Floating Spec Widget & Action CTA */}
          <div 
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(25px)",
              transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s",
            }}
          >
            {/* Glassmorphic Metadata Widget */}
            <div 
              style={{
                padding: "20px 24px",
                background: "rgba(15, 15, 15, 0.65)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "100%",
                maxWidth: "340px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontFamily: "var(--font-mono, monospace)", color: "rgba(240,235,225,0.5)", letterSpacing: "0.2em" }}>SYSTEM SENSOR</span>
                <Camera size={14} className="text-[#E8421A]" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#F4F1EA", letterSpacing: "0.1em" }}>FOCUS // DYNAMIC</span>
                <span style={{ fontSize: "10px", fontFamily: "var(--font-mono, monospace)", color: "#E8421A" }}>ACTIVE</span>
              </div>
            </div>

            {/* Elite Magnetic CTA Button */}
            <a
              href="#gallery"
              onClick={handleScrollToGallery}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "340px",
                padding: "20px 28px",
                borderRadius: "12px",
                background: "#F4F1EA",
                color: "#030303",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono, monospace)",
                transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)",
                cursor: "pointer",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#E8421A";
                e.currentTarget.style.color = "#F4F1EA";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 22px 50px rgba(232,66,26,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#F4F1EA";
                e.currentTarget.style.color = "#030303";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)";
              }}
            >
              <span>Explore Gallery</span>
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>

        {/* Bottom Status Footer */}
        <div 
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.75s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Compass size={14} className="text-[rgba(240,235,225,0.4)] animate-spin-slow" />
            <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,225,0.4)", fontFamily: "var(--font-mono, monospace)" }}>
              Scroll down to enter archive
            </span>
          </div>
          <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,225,0.4)", fontFamily: "var(--font-mono, monospace)" }}>
            EST. 2026
          </span>
        </div>
      </div>
    </section>
  );
}