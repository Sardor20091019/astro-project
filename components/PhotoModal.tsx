"use client";

import { useState } from "react";
import { Camera, Share2, Heart, Check } from "lucide-react";
import Link from "next/link";

interface PhotoDetailsProps {
  photoUrl: string;
  title: string;
  ownerId: string;
  ownerName: string;
  cameraSettings?: string;
}

export default function PhotoDetailsSidePanel({ 
  title, 
  ownerId, 
  ownerName, 
  cameraSettings = "ISO 100 • 50mm • f/1.8 • 1/250s" 
}: PhotoDetailsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full lg:w-85 h-full p-6 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-900 flex flex-col justify-between">
      
      {/* Top Section: Metadata Properties */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Exhibition Frame</span>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight mt-1">{title || "Untitled Exposure"}</h2>
          <Link 
            href={`/profile/${ownerId}`}
            className="inline-block text-xs text-zinc-400 mt-1 hover:text-white transition-colors"
          >
            by <span className="font-semibold text-zinc-200">{ownerName || "NOT_AVAILABLE Photographer"}</span>
          </Link>
        </div>

        {/* Camera Spec Block */}
        <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-lg flex items-start gap-3">
          <Camera size={14} className="text-zinc-500 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Capture Parameters</p>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">{cameraSettings}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: System Relational CTAs */}
      <div className="space-y-3 pt-6 border-t border-zinc-900/60">
        <div className="flex gap-2">
          <button className="flex-1 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
            <Heart size={14} /> Like
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />} 
            {copied ? "Copied" : "Share"}
          </button>
        </div>
        
        {/* Photographer Profile Link */}
        <Link
          href={`/profile/${ownerId}`}
          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition duration-200"
        >
          View Photographer Portfolio
        </Link>
      </div>

    </div>
  );
}