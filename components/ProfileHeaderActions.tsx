"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import SubmitPhotoModal from "@/components/SubmitPhotoModal";

interface ProfileHeaderActionsProps {
  isSelf: boolean;
  userId: string;
}

export default function ProfileHeaderActions({ isSelf }: ProfileHeaderActionsProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  if (!isSelf) return null;

  return (
    <>
      <button 
        onClick={() => setIsUploadOpen(true)} 
        className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[var(--text)] text-[var(--bg)] text-xs font-mono font-bold uppercase tracking-widest hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.02]"
      >
        <Camera size={15} /> Add New Frame
      </button>

      <SubmitPhotoModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </>
  );
}