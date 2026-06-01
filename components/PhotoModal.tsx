"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PhotoModal({ photos, currentIndex }: { photos: any[], currentIndex: number }) {
  const router = useRouter();
  const [index, setIndex] = useState(currentIndex);

  const goNext = (e?: any) => {
    e?.stopPropagation();
    if (index < photos.length - 1) setIndex(index + 1);
  };

  const goPrev = (e?: any) => {
    e?.stopPropagation();
    if (index > 0) setIndex(index - 1);
  };

  const close = () => router.back();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={close} // Click "anywhere" to go back
    >
      {/* X Close Button */}
      <button 
        onClick={close}
        className="fixed top-5 right-5 z-[60] text-white text-4xl hover:scale-110 transition"
      >
        ✕
      </button>

      {/* Navigation Buttons (Desktop) */}
      <button onClick={goPrev} className="fixed left-5 z-[60] text-white text-5xl hidden md:block">‹</button>
      <button onClick={goNext} className="fixed right-5 z-[60] text-white text-5xl hidden md:block">›</button>

      {/* The Image with Swipe Logic */}
      <motion.div
        key={index}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        drag="x" // Enable swipe
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, { offset, velocity }) => {
          if (offset.x > 100) goPrev();
          else if (offset.x < -100) goNext();
        }}
        className="relative max-w-[90vw] max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking the photo itself
      >
        <img 
          src={photos[index].url} 
          alt="Gallery" 
          className="rounded-lg object-contain shadow-2xl"
        />
        
        {/* Rating Stars (Shown at the bottom of modal) */}
        <div className="absolute -bottom-12 left-0 right-0 text-center text-white">
          <p className="text-lg">Rating: {photos[index].avgRating || "No reviews"}</p>
        </div>
      </motion.div>
    </div>
  );
}