"use client";
import { useRouter } from "next/navigation";

export default function PhotoNav() {
  const router = useRouter();

  return (
    <>
      {/* X Button - Top Right */}
      <button 
        onClick={() => router.push('/')}
        className="fixed top-6 right-6 z-[100] bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all"
      >
        ✕
      </button>

      {/* Navigation Arrows */}
      <div className="fixed inset-y-0 left-4 flex items-center z-[100] md:flex hidden">
        <button onClick={() => window.history.back()} className="text-white/50 hover:text-white text-6xl">‹</button>
      </div>
      <div className="fixed inset-y-0 right-4 flex items-center z-[100] md:flex hidden">
        <button onClick={() => window.history.forward()} className="text-white/50 hover:text-white text-6xl">›</button>
      </div>
    </>
  );
}