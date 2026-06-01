import { Star } from "lucide-react";

export default function StarDisplay({ rating, total }: { rating: number; total: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= Math.round(rating) ? "fill-red-500 text-red-400" : "fill-transparent text-white/20"}
          />
        ))}
      </div>
      <span className="text-sm font-black text-white">{rating.toFixed(1)}</span>
      <span className="text-xs uppercase tracking-[0.16em] text-white/35">
        {total} rating{total === 1 ? "" : "s"}
      </span>
    </div>
  );
}
