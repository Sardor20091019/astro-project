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

const PARALLAX_SPEEDS = [0.02, 0.04, 0.01, 0.03, 0.05, 0.02, 0.03, 0.01, 0.04];
const PAGE_SIZE = 9; // Exactly 9 images per page view context

function ParallaxCard({ photo, index, speed }: { photo: Photo; index: number; speed: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useLenis(({ y }) => {
    if (!cardRef.current) return;
    offsetRef.current = y * speed * 0.15;
    cardRef.current.style.transform = `translateY(${offsetRef.current}px)`;
  });

  return (
    <div
      ref={cardRef}
      style={{ 
        willChange: "transform",
        height: "auto"
      }}
      className="group relative overflow-hidden border border-white/[0.07] bg-[#0A0A0A] transition-all duration-500 hover:border-[rgba(232,66,26,0.28)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.65)] rounded-xl"
    >
      {/* Aspect ratio bounding box completely locks card size before loading */}
      <div className="relative overflow-hidden bg-zinc-950 aspect-[4/3] w-full">
        
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

        {/* Top Floating Badges */}
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

        {/* Bottom Metadata Layer */}
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

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {[
  { id: "likes", icon: Heart, val: photo._count.likes },
  { id: "rating", icon: Star, val: photo.avgRating.toFixed(1) },
  { id: "comments", icon: MessageCircle, val: photo._count.comments },
].map(({ id, icon: Icon, val }) => (
  <span 
    key={id} 
    style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: "var(--font-mono,'Courier New',monospace)", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(240,235,225,0.35)" }}
  >
    <Icon size={9} />{val}
  </span>
))}

              {photo.userId && (
                <Link
                  href={`/chat?id=${photo.userId}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    fontFamily: "var(--font-mono,'Courier New',monospace)",
                    fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase",
                    color: "#F0EBE1", background: "rgba(232,66,26,0.15)",
                    border: "1px solid rgba(232,66,26,0.3)", padding: "2px 6px",
                    borderRadius: "3px", transition: "all 0.2s ease",
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const skewRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // ==========================================================
  // DETECT "?page=" ON LOAD AND INTERACTIVE CLICKS
  // ==========================================================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get("page");

      // Scroll immediately if a page number is loaded or active in client state
      if ((pageParam || currentPage > 1) && sectionRef.current) {
        const topOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 60;
        
        setTimeout(() => {
          window.scrollTo({
            top: topOffset,
            behavior: "smooth"
          });
        }, 50); // Small delay allows the WebGL layout framework to settle calculations
      }
    }
  }, [currentPage]); // Re-runs perfectly when user clicks page changes or queries reload


  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return photos;
    return photos.filter(p => (p.category || "OTHER") === activeCategory);
  }, [photos, activeCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  
  const visible = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1); 
  };

  return (
    <section id="gallery" ref={sectionRef} style={{ padding: "40px 0 100px" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 56px)" }}>
        
        {/* Gallery Headers */}
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

        {/* Categories Navbar */}
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
                    display: "flex", alignItems: "center", gap: "7px", padding: "7px 14px",
                    border: `1px solid ${isActive ? "#E8421A" : "rgba(240,235,225,0.08)"}`,
                    background: isActive ? "#E8421A" : "transparent",
                    color: isActive ? "#F0EBE1" : "rgba(240,235,225,0.4)",
                    fontFamily: "var(--font-mono,'Courier New',monospace)",
                    fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase",
                    cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s",
                  }}
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

        {/* Framing Filter States */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <span style={{
            fontFamily: "var(--font-mono,'Courier New',monospace)",
            fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(240,235,225,0.2)",
          }}>
            Showing {visible.length} of {filtered.length} frames
          </span>
          {activeCategory !== "ALL" && (
            <button
              onClick={() => handleCategoryChange("ALL")}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                fontFamily: "var(--font-mono,'Courier New',monospace)",
                fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(240,235,225,0.3)", background: "none", border: "none", cursor: "pointer",
              }}
            >
              <X size={9} /> Clear
            </button>
          )}
        </div>

        {/* Grid Render Output */}
        {filtered.length === 0 ? (
          <div style={{
            border: "1px dashed rgba(240,235,225,0.08)", padding: "80px 24px", textAlign: "center",
            fontFamily: "var(--font-mono,'Courier New',monospace)", fontSize: "10px",
            letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(240,235,225,0.2)",
          }}>
            No frames in this category
          </div>
        ) : (
          <>
            <div ref={skewRef} style={{ willChange: "transform", transition: "transform 0.1s linear" }}>
              {/* Responsive columns: 1 column on mobile, 2 on tablet, 3 on desktop */}
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {visible.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
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

           {/* INTERACTIVE COMPONENT: CINEMATIC PAGINATION CONTROLS */}
{totalPages > 1 && (
  <div style={{ 
    marginTop: "64px", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    gap: "16px",
    background: "rgba(10, 10, 10, 0.4)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(240, 235, 225, 0.04)",
    padding: "12px 24px",
    borderRadius: "100px",
    width: "fit-content",
    margin: "64px auto 0"
  }}>
    
    {/* PREVIOUS BUTTON */}
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => p - 1)}
      style={{
        padding: "10px 20px",
        background: currentPage === 1 ? "transparent" : "rgba(240, 235, 225, 0.03)",
        border: `1px solid ${currentPage === 1 ? "rgba(240, 235, 225, 0.05)" : "rgba(240, 235, 225, 0.12)"}`,
        color: currentPage === 1 ? "rgba(240, 235, 225, 0.15)" : "#F0EBE1",
        fontFamily: "var(--font-mono, 'Courier New', monospace)",
        fontSize: "10px", 
        letterSpacing: "0.15em", 
        textTransform: "uppercase",
        borderRadius: "100px",
        cursor: currentPage === 1 ? "not-allowed" : "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={e => {
        if (currentPage !== 1) {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = "#E8421A";
          b.style.borderColor = "#E8421A";
          b.style.boxShadow = "0 0 20px rgba(232, 66, 26, 0.35)";
          b.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={e => {
        if (currentPage !== 1) {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = "rgba(240, 235, 225, 0.03)";
          b.style.borderColor = "rgba(240, 235, 225, 0.12)";
          b.style.boxShadow = "none";
          b.style.transform = "translateY(0)";
        }
      }}
    >
      ← Prev
    </button>

    {/* COUNTER SLOT */}
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "6px",
      padding: "0 8px"
    }}>
      <span style={{ 
        fontFamily: "var(--font-mono, 'Courier New', monospace)", 
        fontSize: "10px", 
        color: "#E8421A", // Your accent color highlight
        fontWeight: "600"
      }}>
        {String(currentPage).padStart(2, '0')}
      </span>
      <span style={{ 
        fontFamily: "var(--font-mono, 'Courier New', monospace)", 
        fontSize: "10px", 
        color: "rgba(240, 235, 225, 0.2)" 
      }}>
        /
      </span>
      <span style={{ 
        fontFamily: "var(--font-mono, 'Courier New', monospace)", 
        fontSize: "10px", 
        color: "rgba(240, 235, 225, 0.4)" 
      }}>
        {String(totalPages).padStart(2, '0')}
      </span>
    </div>

    {/* NEXT BUTTON */}
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(p => p + 1)}
      style={{
        padding: "10px 20px",
        background: currentPage === totalPages ? "transparent" : "rgba(240, 235, 225, 0.03)",
        border: `1px solid ${currentPage === totalPages ? "rgba(240, 235, 225, 0.05)" : "rgba(240, 235, 225, 0.12)"}`,
        color: currentPage === totalPages ? "rgba(240, 235, 225, 0.15)" : "#F0EBE1",
        fontFamily: "var(--font-mono, 'Courier New', monospace)",
        fontSize: "10px", 
        letterSpacing: "0.15em", 
        textTransform: "uppercase",
        borderRadius: "100px",
        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={e => {
        if (currentPage !== totalPages) {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = "#E8421A";
          b.style.borderColor = "#E8421A";
          b.style.boxShadow = "0 0 20px rgba(232, 66, 26, 0.35)";
          b.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={e => {
        if (currentPage !== totalPages) {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = "rgba(240, 235, 225, 0.03)";
          b.style.borderColor = "rgba(240, 235, 225, 0.12)";
          b.style.boxShadow = "none";
          b.style.transform = "translateY(0)";
        }
      }}
    >
      Next →
    </button>

  </div>
)}
          </>
        )}
      </div>
    </section>
  );
}