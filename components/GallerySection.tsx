"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MapPin, MessageCircle, Star, X, MessageSquare } from "lucide-react";
import { CATEGORIES } from "@/data/photos";
import { useLenis } from "@/hooks/useLenis";
import WebGLImage from "@/components/webgl/WebGLImage";

type Photo = {
  id: number;
  url: string;
  title: string;
  location?: string | null;
  category?: string | null;
  authorName?: string | null;
  userId?: string | null;
  avgRating: number;
  _count: { likes: number; comments: number; ratings: number };
};

const PARALLAX_SPEEDS = [0.09, 0.16, 0.07, 0.13, 0.19, 0.11, 0.08, 0.15, 0.06, 0.12];
const PAGE_SIZE = 20;

function ParallaxCard({ photo, index, speed }: { photo: Photo; index: number; speed: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useLenis(({ y, velocity }) => {
    if (!cardRef.current) return;
    offsetRef.current = y * speed;
    cardRef.current.style.transform = `translateY(${offsetRef.current}px)`;
  });

  const isWide = index % 5 === 0;

  return (
    <div
      ref={cardRef}
      style={{ 
        willChange: "transform",
        height: "auto"
      }}
      className={`group relative overflow-hidden border border-white/[0.07] bg-[#0A0A0A] transition-all duration-500
        hover:border-[rgba(232,66,26,0.28)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.65)]
        ${isWide ? "lg:row-span-2" : ""}
      `}
    >
      {/* Photo viewport link container */}
      <div className={`relative overflow-hidden bg-zinc-950 ${isWide ? "aspect-[4/5] lg:aspect-[4/6]" : "aspect-[4/5]"}`}>
        
        {/* Clickable Image Layer linking directly to full view details */}
        <Link href={`/photos/${photo.id}`} className="absolute inset-0 z-0 block w-full h-full">
          <WebGLImage
            src={photo.url}
            alt={photo.title}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={{ 
              transform: "scaleY(-1)", 
              transformOrigin: "center" 
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.1) 50%, transparent 100%)",
          }} />
        </Link>

        {/* Top Floating Row - Houses Badges (Kept on higher z-index stacking layer) */}
        <div style={{ position: "absolute", top: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 10 }}>
          {photo.userId ? (
            <Link
              href={`/profile/${photo.userId}`}
              style={{
                fontFamily: "var(--font-mono,'Courier New',monospace)",
                fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase",
                color: "rgba(240,235,225,0.5)", background: "rgba(5,5,5,0.55)",
                backdropFilter: "blur(12px)", border: "1px solid rgba(240,235,225,0.07)",
                padding: "5px 10px", transition: "color .2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F0EBE1")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.5)")}
            >
              {photo.authorName || "—"}
            </Link>
          ) : (
            <span style={{
              fontFamily: "var(--font-mono,'Courier New',monospace)",
              fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(240,235,225,0.35)", background: "rgba(5,5,5,0.55)",
              backdropFilter: "blur(12px)", border: "1px solid rgba(240,235,225,0.07)",
              padding: "5px 10px",
            }}>
              {photo.authorName || "—"}
            </span>
          )}

          <span style={{
            fontFamily: "var(--font-mono,'Courier New',monospace)",
            fontSize: "9px", letterSpacing: "0.12em",
            color: "rgba(240,235,225,0.25)",
          }}>
            {String(index + 1).padStart(3, "0")}
          </span>
        </div>

        {/* Bottom Info View Overlay Overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", zIndex: 10 }}>
          <h3 style={{
            fontFamily: "'Editorial New','Times New Roman',Georgia,serif",
            fontSize: "clamp(16px, 2.2vw, 22px)", fontWeight: 200,
            letterSpacing: "-0.02em", color: "#F0EBE1", lineHeight: 1.1,
            marginBottom: "10px",
          }}>
            {photo.title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            {photo.location && (
              <span style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontFamily: "var(--font-mono,'Courier New',monospace)",
                fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#E8421A",
              }}>
                <MapPin size={9} />{photo.location}
              </span>
            )}

            {/* Metrics Cluster & Chat Trigger Link */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {[
                { icon: Heart, val: photo._count.likes },
                { icon: Star, val: photo.avgRating.toFixed(1) },
                { icon: MessageCircle, val: photo._count.comments },
              ].map(({ icon: Icon, val }) => (
                <span key={String(val)} style={{
                  display: "flex", alignItems: "center", gap: "3px",
                  fontFamily: "var(--font-mono,'Courier New',monospace)",
                  fontSize: "9px", letterSpacing: "0.1em",
                  color: "rgba(240,235,225,0.35)",
                }}>
                  <Icon size={9} />{val}
                </span>
              ))}

              {/* ========================================================== */}
              {/* BRAND-NEW: DIRECT MESSAGE TRIGER BUTTON                    */}
              {/* ========================================================== */}
              {photo.userId && (
                <Link
                  href={`/chat?id=${photo.userId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "var(--font-mono,'Courier New',monospace)",
                    fontSize: "9px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#F0EBE1",
                    background: "rgba(232,66,26,0.15)",
                    border: "1px solid rgba(232,66,26,0.3)",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#E8421A";
                    e.currentTarget.style.borderColor = "#E8421A";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(232,66,26,0.15)";
                    e.currentTarget.style.borderColor = "rgba(232,66,26,0.3)";
                  }}
                  title="Message Artist"
                >
                  <MessageSquare size={8} />
                  <span>Chat</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GallerySection({ photos }: { photos: Photo[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const gridRef = useRef<HTMLDivElement>(null);
  const skewRef = useRef<HTMLDivElement>(null);

  useLenis(({ velocity }) => {
    if (!skewRef.current) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      skewRef.current.style.transform = `skewY(0deg)`;
      return;
    }
    const skew = Math.max(-2.2, Math.min(2.2, velocity * -0.14));
    skewRef.current.style.transform = `skewY(${skew}deg)`;
  });

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return photos;
    return photos.filter(p => (p.category || "OTHER") === activeCategory);
  }, [photos, activeCategory]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section id="gallery" style={{ padding: "80px 0 120px" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 56px)" }}>
        <div style={{ marginBottom: "48px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{
            fontFamily: "var(--font-mono,'Courier New',monospace)",
            fontSize: "10px", letterSpacing: "0.32em", textTransform: "uppercase",
            color: "rgba(232,66,26,0.7)",
          }}>
            Open gallery · {photos.length} frames
          </span>
          <h2 style={{
            fontFamily: "'Editorial New','Times New Roman',Georgia,serif",
            fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 200,
            letterSpacing: "-0.04em", color: "#F0EBE1", lineHeight: 0.95,
          }}>
            Recent frames
          </h2>
        </div>

        <div style={{ marginBottom: "32px", overflowX: "auto", paddingBottom: "4px" }} className="scrollbar-none">
          <div style={{ display: "flex", gap: "6px", minWidth: "max-content" }}>
            {CATEGORIES.map(cat => {
              const count = cat.value === "ALL" ? photos.length : photos.filter(p => (p.category || "OTHER") === cat.value).length;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    padding: "7px 14px",
                    border: `1px solid ${isActive ? "#E8421A" : "rgba(240,235,225,0.08)"}`,
                    background: isActive ? "#E8421A" : "transparent",
                    color: isActive ? "#F0EBE1" : "rgba(240,235,225,0.4)",
                    fontFamily: "var(--font-mono,'Courier New',monospace)",
                    fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase",
                    cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all .2s",
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.color = "#F0EBE1"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,235,225,0.25)"; }}}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,235,225,0.4)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,235,225,0.08)"; }}}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span style={{
                    background: isActive ? "rgba(240,235,225,0.2)" : "rgba(240,235,225,0.06)",
                    padding: "2px 6px", fontSize: "8px",
                  }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", marginBottom: "20px" }}>
          <span style={{
            fontFamily: "var(--font-mono,'Courier New',monospace)",
            fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(240,235,225,0.2)",
          }}>
            {Math.min(visibleCount, filtered.length)} / {filtered.length} frames
          </span>
          {activeCategory !== "ALL" && (
            <button
              onClick={() => handleCategoryChange("ALL")}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                fontFamily: "var(--font-mono,'Courier New',monospace)",
                fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(240,235,225,0.3)", background: "none", border: "none", cursor: "pointer",
                transition: "color .2s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#F0EBE1")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(240,235,225,0.3)")}
            >
              <X size={9} /> Clear
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{
            border: "1px dashed rgba(240,235,225,0.08)",
            padding: "80px 24px", textAlign: "center",
            fontFamily: "var(--font-mono,'Courier New',monospace)",
            fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(240,235,225,0.2)",
          }}>
            No frames in this category
          </div>
        ) : (
          <>
            <div ref={skewRef} style={{ willChange: "transform", transition: "transform 0.1s linear" }}>
              <motion.div
                ref={gridRef}
                layout
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}
                className="grid-gallery"
              >
                <AnimatePresence mode="popLayout">
                  {visible.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: i % PAGE_SIZE < 6 ? (i % 6) * 0.07 : 0, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ParallaxCard
                        photo={photo}
                        index={i}
                        speed={PARALLAX_SPEEDS[i % PARALLAX_SPEEDS.length]}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {hasMore && (
              <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                  style={{
                    padding: "14px 40px",
                    border: "1px solid rgba(240,235,225,0.12)",
                    background: "transparent", color: "rgba(240,235,225,0.5)",
                    fontFamily: "var(--font-mono,'Courier New',monospace)",
                    fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all .25s",
                  }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(240,235,225,0.4)"; b.style.color = "#F0EBE1"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(240,235,225,0.12)"; b.style.color = "rgba(240,235,225,0.5)"; }}
                >
                  Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more · {filtered.length - visibleCount} remaining
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}