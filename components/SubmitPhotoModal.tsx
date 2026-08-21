/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle2, MapPin, User, Camera, Tag, X, ImagePlus, ShieldCheck, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/data/photos";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface SubmitPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitPhotoModal({ isOpen, onClose }: SubmitPhotoModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleClose = () => {
    setSubmitted(false);
    setUploadedUrl(null);
    onClose();
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/photos/upload", { 
      method: "POST", 
      body: formData 
    });
    
    if (res.ok) {
      setSubmitted(true);
      router.refresh();
    } else {
      const errorData = await res.json();
      console.error("API Error Details:", errorData);
      alert(`Upload failed: ${errorData.error || "Unknown error"}`);
    }
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative w-full max-w-2xl bg-(--surface) border border-(--border) rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden z-10 max-h-[94vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-12 sm:px-14 py-10 border-b border-(--border) bg-(--surface)/90 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-(--surface-2) border border-(--border) flex items-center justify-center text-(--accent)">
                <Camera size={22} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-(--text)">
                Submit New Frame
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-12 h-12 rounded-full bg-(--surface-2) hover:bg-(--surface-3) text-(--text-dim) hover:text-(--text) transition-colors cursor-pointer border border-(--border) flex items-center justify-center shrink-0"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-10 sm:p-16 overflow-y-auto flex-1">
            {submitted ? (
              <div className="text-center py-24 flex flex-col items-center">
                <div className="w-24 h-24 bg-(--accent)/10 border border-(--accent)/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <CheckCircle2 size={38} className="text-(--accent)" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-(--text)">
                  Frame Published
                </h3>
                <p className="text-(--text-dim) font-mono text-xs uppercase tracking-[0.15em] mb-10 max-w-md leading-relaxed">
                  Your capture is now indexed and live in the gallery archive.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={() => { setSubmitted(false); setUploadedUrl(null); }}
                    className="flex-1 px-8 py-5 rounded-2xl border border-(--border) font-mono text-xs font-bold uppercase tracking-[0.15em] text-(--text-dim) hover:text-(--text) hover:border-(--border-hover) transition-all cursor-pointer bg-(--surface-2)"
                  >
                    Submit Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-8 py-5 rounded-2xl bg-(--text) text-(--bg) font-mono text-xs font-bold uppercase tracking-[0.15em] hover:bg-(--accent) hover:text-(--bg) transition-all cursor-pointer shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center justify-between bg-(--surface-2) border border-(--border) px-9 py-7 rounded-2xl backdrop-blur-md">
                  <p className="text-(--text-dim) font-mono text-xs uppercase tracking-[0.1em]">
                    {session?.user ? (
                      <span className="text-(--accent)">Credited to: {session.user.name}</span>
                    ) : (
                      <span>
                        <button type="button" onClick={() => signIn("google")} className="text-(--accent) hover:underline underline-offset-4 font-bold">
                          Sign in
                        </button>{" "}
                        for author attribution.
                      </span>
                    )}
                  </p>
                  <ShieldCheck size={20} className="text-(--accent)" />
                </div>

                {/* Upload Zone */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-(--border) bg-(--surface-2) p-14 sm:p-20 flex flex-col items-center justify-center min-h-[300px] transition-all hover:border-(--border-hover) group">
                  {uploadedUrl ? (
                    <div className="relative w-full">
                      <img src={uploadedUrl} alt="Preview" className="w-full max-h-80 object-cover rounded-2xl border border-(--border) shadow-xl" />
                      <input type="hidden" name="photoUrl" value={uploadedUrl} />
                      <div className="absolute top-4 right-4">
                        <button 
                          type="button" 
                          onClick={() => setUploadedUrl(null)}
                          className="bg-(--surface) backdrop-blur-md border border-(--border) text-(--text) font-mono text-xs px-5 py-2.5 rounded-full uppercase tracking-wider font-bold hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-xl"
                        >
                          Replace File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-5 text-center">
                      <div className="w-18 h-18 rounded-2xl bg-(--surface-3) border border-(--border) flex items-center justify-center text-(--accent) group-hover:scale-110 transition-transform">
                        <ImagePlus size={30} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="font-mono text-xs uppercase tracking-[0.15em] text-(--text) font-bold">
                          Drop image or upload file
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-muted)">
                          Supports high-res RAW, JPG, PNG
                        </span>
                      </div>
                      <div className="mt-4">
                        <UploadButton<OurFileRouter, "imageUploader">
                          endpoint="imageUploader"
                          onUploadBegin={() => setLoading(true)}
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              const serverData = res[0].serverData as { isSafe: boolean; error: string | null } | undefined;
                              if (serverData && serverData.isSafe === false) {
                                alert("Upload rejected: Content does not meet safety guidelines.");
                                setUploadedUrl(null);
                              } else {
                                setUploadedUrl(res[0].ufsUrl || res[0].url);
                              }
                            }
                            setLoading(false);
                          }}
                          onUploadError={(error: Error) => {
                            alert(`Upload Failed: ${error.message}`);
                            setLoading(false);
                          }}
                          appearance={{
                            button: "bg-(--text) text-(--bg) font-mono text-xs uppercase tracking-[0.15em] font-bold px-9 py-4.5 rounded-2xl hover:bg-(--accent) hover:text-(--bg) transition-all cursor-pointer shadow-md",
                            allowedContent: "hidden"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Metadata Inputs */}
                {uploadedUrl && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-500">
                    <input name="camera" placeholder="Camera (Sony)" className="bg-(--surface-2) border border-(--border) px-8 py-7 rounded-2xl font-mono text-xs text-(--text) placeholder:text-(--text-muted) outline-none focus:border-(--accent) transition-all" />
                    <input name="iso" placeholder="ISO (800)" type="number" className="bg-(--surface-2) border border-(--border) px-8 py-7 rounded-2xl font-mono text-xs text-(--text) placeholder:text-(--text-muted) outline-none focus:border-(--accent) transition-all" />
                    <input name="aperture" placeholder="Aperture (f/2.8)" className="bg-(--surface-2) border border-(--border) px-8 py-7 rounded-2xl font-mono text-xs text-(--text) placeholder:text-(--text-muted) outline-none focus:border-(--accent) transition-all" />
                    <input name="shutter" placeholder="Shutter (1/500s)" className="bg-(--surface-2) border border-(--border) px-8 py-7 rounded-2xl font-mono text-xs text-(--text) placeholder:text-(--text-muted) outline-none focus:border-(--accent) transition-all" />
                  </div>
                )}

                {/* Author Name */}
                <div className="flex items-center bg-(--surface-2) border border-(--border) px-9 py-7 rounded-2xl focus-within:border-(--accent) transition-all">
                  <User size={18} className="text-(--text-muted) shrink-0 mr-4 pointer-events-none" />
                  <input name="authorName" defaultValue={session?.user?.name ?? ""} placeholder="Artist / Creator Name" required className="w-full bg-transparent font-mono text-xs uppercase tracking-[0.1em] text-(--text) outline-none placeholder:text-(--text-muted)" />
                </div>

                {/* Title */}
                <div className="flex items-center bg-(--surface-2) border border-(--border) px-9 py-7 rounded-2xl focus-within:border-(--accent) transition-all">
                  <Camera size={18} className="text-(--text-muted) shrink-0 mr-4 pointer-events-none" />
                  <input name="title" placeholder="Frame Title" required className="w-full bg-transparent font-mono text-xs uppercase tracking-[0.1em] text-(--text) outline-none placeholder:text-(--text-muted)" />
                </div>

                {/* Location & Coordinates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center bg-(--surface-2) border border-(--border) px-9 py-7 rounded-2xl focus-within:border-(--accent) transition-all">
                    <MapPin size={18} className="text-(--text-muted) shrink-0 mr-4 pointer-events-none" />
                    <input name="location" placeholder="Location (Tien Shan)" className="w-full bg-transparent font-mono text-xs uppercase tracking-[0.1em] text-(--text) outline-none placeholder:text-(--text-muted)" />
                  </div>
                  <div className="flex items-center bg-(--surface-2) border border-(--border) px-9 py-7 rounded-2xl focus-within:border-(--accent) transition-all">
                    <input name="coordinates" placeholder="Coordinates (Optional)" className="w-full bg-transparent font-mono text-xs uppercase tracking-[0.1em] text-(--text) outline-none placeholder:text-(--text-muted)" />
                  </div>
                </div>

                {/* Category Select */}
                <div className="flex items-center bg-(--surface-2) border border-(--border) px-9 py-7 rounded-2xl focus-within:border-(--accent) transition-all">
                  <Tag size={18} className="text-(--text-muted) shrink-0 mr-4 pointer-events-none" />
                  <select name="category" defaultValue="OTHER" className="w-full appearance-none bg-transparent font-mono text-xs uppercase tracking-[0.1em] text-(--text) outline-none cursor-pointer">
                    {CATEGORIES.filter(c => c.value !== "ALL").map(cat => (
                      <option key={cat.value} value={cat.value} className="bg-(--surface) text-(--text) font-mono">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !uploadedUrl} 
                  className="w-full bg-(--text) text-(--bg) py-7 rounded-2xl font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-(--accent) hover:text-(--bg) transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed mt-8 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  {loading ? "POSTING THE PHOTO..." : "POST THE PHOTO"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}