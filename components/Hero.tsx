"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLenis } from "@/hooks/useLenis";

export default function Hero() {
  const bgRef   = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef  = useRef<HTMLParagraphElement>(null);

  // Parallax bg + title on scroll
  useLenis(({ y }) => {
    if (bgRef.current)    bgRef.current.style.transform    = `translateY(${y * 0.42}px)`;
    if (titleRef.current) titleRef.current.style.transform = `translateY(${y * 0.18}px)`;
    if (subRef.current)   subRef.current.style.transform   = `translateY(${y * 0.08}px)`;
  });

  // Character split-reveal on mount
  useEffect(() => {
    const h1 = titleRef.current;
    if (!h1) return;
    const text = h1.textContent ?? "";
    h1.innerHTML = "";
    // wrap each char in a span
    [...text].forEach((ch, i) => {
      const outer = document.createElement("span");
      outer.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;";
      const inner = document.createElement("span");
      inner.style.cssText = `display:inline-block;transform:translateY(110%);opacity:0;
        transition:transform 0.75s cubic-bezier(0.16,1,0.3,1) ${i * 28}ms,
                   opacity   0.4s ease ${i * 28}ms;`;
      inner.textContent = ch === " " ? "\u00A0" : ch;
      outer.appendChild(inner);
      h1.appendChild(outer);
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        h1.querySelectorAll<HTMLSpanElement>("span span").forEach(s => {
          s.style.transform = "translateY(0)";
          s.style.opacity   = "1";
        });
      })
    );
  }, []);

  return (
    <section
      style={{ position: "relative", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
    >
      {/* Parallax background */}
      <div
        ref={bgRef}
        style={{
          position: "absolute", inset: "-12% 0", backgroundImage: "url('/hero.jpg')",
          backgroundSize: "cover", backgroundPosition: "center",
          willChange: "transform",
        }}
      />
      {/* Gradient scrim */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, transparent 40%, #050505 100%)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 1.5rem", maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(240,235,225,0.35)", marginBottom: "1.5rem", fontFamily: "var(--font-mono, 'Courier New', monospace)" }}>
          Photography by Sardor Sunatullayev
        </p>

        <h1
          ref={titleRef}
          style={{
            fontFamily: "'Editorial New', 'Times New Roman', Georgia, serif",
            fontSize: "clamp(64px, 11vw, 148px)",
            fontWeight: 200,
            letterSpacing: "-0.045em",
            lineHeight: 0.92,
            color: "#F0EBE1",
            marginBottom: "2rem",
            willChange: "transform",
          }}
        >
          Astro<span style={{ color: "#E8421A", fontStyle: "italic" }}>spectrum</span>
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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <a
            href="#gallery"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px", borderRadius: "2px",
              background: "#F0EBE1", color: "#050505",
              fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase",
              fontFamily: "var(--font-mono, 'Courier New', monospace)",
              transition: "background .2s, color .2s, transform .2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#E8421A"; (e.currentTarget as HTMLAnchorElement).style.color = "#F0EBE1"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#F0EBE1"; (e.currentTarget as HTMLAnchorElement).style.color = "#050505"; }}
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
            View Frames
          </a>
          <Link
            href="/submit"
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "12px 28px", borderRadius: "2px",
              border: "1px solid rgba(240,235,225,0.18)", color: "rgba(240,235,225,0.6)",
              fontSize: "10px", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase",
              fontFamily: "var(--font-mono, 'Courier New', monospace)",
              transition: "border-color .2s, color .2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(240,235,225,0.5)"; (e.currentTarget as HTMLAnchorElement).style.color = "#F0EBE1"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(240,235,225,0.18)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,235,225,0.6)"; }}
          >
            Submit a Frame
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: 0.3 }}>
        <span style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-mono,'Courier New',monospace)", color: "#F0EBE1" }}>Scroll</span>
        <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, #F0EBE1, transparent)" }} />
      </div>
    </section>
  );
}
