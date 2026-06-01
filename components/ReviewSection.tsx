"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import StarRating from "./StarRating";

export default function ReviewSection({ photoId, onSuccess }: { photoId: number, onSuccess: () => void }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session) return alert("Please login to leave a review!");
    if (!comment.trim()) return alert("Write something first!");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, rating, comment }),
      });

      if (res.ok) {
        setComment("");
        setRating(5);
        onSuccess();
      } else {
        const err = await res.json();
        alert(err.error || "Submission failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
      <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Rate this shot</h4>
      
      <StarRating onSelect={(val) => setRating(val)} />
      
      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-black/40 mt-4 p-4 rounded-xl text-sm text-white border border-white/10 focus:border-red-500 transition-colors outline-none"
        placeholder="Share your thoughts on the composition..."
        rows={3}
      />
      
      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-4 w-full bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50"
      >
        {isSubmitting ? "Uploading..." : "Submit Review"}
      </button>
    </div>
  );
}