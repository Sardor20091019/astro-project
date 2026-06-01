"use client";
import Link from "next/link";
import { useState } from "react";
import StarRating from "./StarRating";
import { useSession } from "next-auth/react";

export default function ReviewForm({ photoId }: { photoId: number }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!session) return (
    <p className="text-xs text-[#444] py-2">
      <Link href="/login" className="text-red-500 hover:underline">Sign in</Link> to leave a review.
    </p>
  );

  if (done) return <p className="text-xs text-[#666] py-2">Review submitted. Thanks!</p>;

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, rating, comment }),
    });
    if (res.ok) { setDone(true); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <StarRating onSelect={setRating} />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="input resize-none h-20 text-sm"
        placeholder="Share your thoughts..."
      />
      <button onClick={handleSubmit} disabled={submitting || !comment.trim()} className="btn-primary w-full justify-center py-2.5">
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
