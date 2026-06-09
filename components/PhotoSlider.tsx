/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PhotoSlider({ photos, initialId }: { photos: any[], initialId: number }) {
  const router = useRouter();
  const currentIndex = photos.findIndex(p => p.id === initialId);
  const [index, setIndex] = useState(currentIndex);

  const navigate = (dir: number) => {
    const newIdx = index + dir;
    if (newIdx >= 0 && newIdx < photos.length) {
      setIndex(newIdx);
   
      window.history.replaceState(null, "", `/photos/${photos[newIdx].id}`);
    }
  };

  return (
    <div 
      className="h-[80vh] w-full flex items-center justify-center relative cursor-zoom-out"
      onClick={() => router.push('/')} 
    >
      {/* X Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); router.push('/'); }}
        className="fixed top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition"
      >
        ✕
      </button>

      {/* Nav Arrows (Desktop) */}
      <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-4 z-40 p-4 text-4xl hidden md:block">‹</button>
      <button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-4 z-40 p-4 text-4xl hidden md:block">›</button>

      {/* Image with Swipe Logic */}
      <AnimatePresence mode="wait">
        <motion.img
          key={photos[index].id}
          src={photos[index].url}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 100) navigate(-1);
            else if (info.offset.x < -100) navigate(1);
          }}
          onClick={(e) => e.stopPropagation()} 
          className="max-h-full max-w-full object-contain shadow-2xl rounded-lg cursor-default"
        />
      </AnimatePresence>
    </div>
  );
}