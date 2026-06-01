"use client";

import Link from "next/link";
import { MessageSquare, Camera, Share2, Heart } from "lucide-react";

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
  return (
    <div className="w-full lg:w-85 h-full p-6 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-900 flex flex-col justify-between">
      
      {/* Top Section: Metadata Properties */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Exhibition Frame</span>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight mt-1">{title || "Untitled Exposure"}</h2>
          <p className="text-xs text-zinc-400 mt-1">
            by <span className="font-semibold text-zinc-200">{ownerName || "Anonymous Photographer"}</span>
          </p>
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
          <button className="flex-1 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5">
            <Heart size={12} /> Like
          </button>
          <button className="flex-1 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5">
            <Share2 size={12} /> Share
          </button>
        </div>

        {/* Action Link: Pushes parameters cleanly directly over into /messages dashboard handler */}
        <Link
          href={`/messages?userId=${ownerId}&userName=${encodeURIComponent(ownerName || "User")}`}
          className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition duration-200 shadow-lg"
        >
          <MessageSquare size={13} className="text-zinc-900 fill-zinc-900" />
          Contact Photographer
        </Link>
      </div>

    </div>
  );
}