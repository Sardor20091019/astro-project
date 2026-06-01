"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MapPin, MessageCircle, Star } from "lucide-react";
import { useLenis } from "@/hooks/useLenis";
import WebGLImage from "@/components/webgl/WebGLImage";

// Optimized constants
const PARALLAX_SPEEDS = [0.09, 0.16, 0.07, 0.13, 0.19, 0.11, 0.08, 0.15, 0.06, 0.12];
const PAGE_SIZE = 20;

function ParallaxCard({ photo, index, speed }: { photo: any; index: number; speed: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useLenis(({ y }) => {
    if (!cardRef.current) return;
    const isMobile = window.innerWidth < 768;
    cardRef.current.style.transform = isMobile ? `none` : `translateY(${y * speed}px)`;
  });

  const isWide = index % 5 === 0;

  return (
    <div ref={cardRef} style={{ willChange: "transform" }} className="group relative border border-white/[0.07] bg-[#0A0A0A] hover:border-[rgba(232,66,26,0.28)] transition-all duration-500">
      <Link href={`/photos/${photo.id}`} className="block">
        <div className={`relative overflow-hidden ${isWide ? "aspect-[4/5] lg:aspect-[4/6]" : "aspect-[4/5]"}`}>
          {/* Blur background for non-stretched fit */}
          <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-60" style={{ backgroundImage: `url(${photo.url})` }} />
          
          <WebGLImage
            src={photo.url}
            alt={photo.title}
            fill
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ imageOrientation: "from-image", transform: "scaleY(-1)", transformOrigin: "center" } as React.CSSProperties}
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,0.92) 0%, transparent 70%)" }} />

          <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "9px", color: "rgba(240,235,225,0.5)", background: "rgba(5,5,5,0.5)", padding: "4px 8px", border: "1px solid rgba(240,235,225,0.07)" }}>
              {photo.authorName || "—"}
            </span>
            <span style={{ fontSize: "9px", color: "rgba(240,235,225,0.25)" }}>{String(index + 1).padStart(3, "0")}</span>
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 200, color: "#F0EBE1", marginBottom: "8px" }}>{photo.title}</h3>
            <div style={{ display: "flex", gap: "12px", fontSize: "9px", color: "rgba(240,235,225,0.4)" }}>
              {photo.location && <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#E8421A" }}><MapPin size={9} />{photo.location}</span>}
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Heart size={9} />{photo._count.likes}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Star size={9} />{photo.avgRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function GallerySection({ photos }: { photos: any[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const skewRef = useRef<HTMLDivElement>(null);

  useLenis(({ velocity }) => {
    if (!skewRef.current) return;
    const isMobile = window.innerWidth < 768;
    skewRef.current.style.transform = isMobile ? `none` : `skewY(${Math.max(-2.2, Math.min(2.2, velocity * -0.14))}deg)`;
  });

  const visible = useMemo(() => photos.slice(0, visibleCount), [photos, visibleCount]);

  return (
    <section id="gallery" style={{ padding: "80px 0" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 56px", minHeight: "100vh" }}>
        <div ref={skewRef} style={{ willChange: "transform", transition: "transform 0.1s linear" }}>
          <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", paddingBottom: "120px" }}>
            <AnimatePresence mode="popLayout">
              {visible.map((photo, i) => (
                <motion.div key={photo.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ParallaxCard photo={photo} index={i} speed={PARALLAX_SPEEDS[i % PARALLAX_SPEEDS.length]} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}