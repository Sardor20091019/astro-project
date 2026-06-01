"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";

export default function StarRating({
  value = 0,
  onSelect,
}: {
  value?: number;
  onSelect: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1" aria-label="Rate this photo">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={{ scale: 1.18, y: -2 }}
          whileTap={{ scale: 0.86, rotate: -8 }}
          onClick={() => onSelect(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="rounded-full p-1 text-white/20 outline-none transition focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          <Star
            size={25}
            className={`transition-all duration-200 ${
              star <= active
                ? "fill-red-500 text-red-400 drop-shadow-[0_0_14px_rgba(239,68,68,0.55)]"
                : "fill-transparent text-white/20"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}
