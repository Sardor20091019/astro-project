"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle2, MapPin, User, Camera, Tag } from "lucide-react";
import { CATEGORIES } from "@/data/photos";
// NEW IMPORTS FOR UPLOADTHING
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

export default function SubmitPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // REPLACED OLD FILE STATE WITH URL STATE
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    // We still use FormData, but now it will contain the text 'url' instead of a raw file
    const formData = new FormData(e.currentTarget);
    
    const res = await fetch("/api/photos/upload", { 
      method: "POST", 
      body: formData 
    });
    
    if (res.ok) setSubmitted(true);
    else alert("Upload failed. Please try again.");
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="text-center max-w-md w-full px-6 py-10 bg-zinc-950/40 border border-white/5 rounded-[2rem] backdrop-blur-md">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={28} className="text-green-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3">Frame Published!</h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">Your photo is now live in the gallery.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(false); setUploadedUrl(null); }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/15 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              Submit another
            </button>
            <a href="/" className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white text-center transition-all">
              View gallery
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    /* pt-24 ensures it clears your header safely on both phones and desktops */
    <div className="min-h-screen pt-24 md:pt-28 pb-16 px-4 md:px-6 bg-[#080808]">
      <div className="max-w-xl mx-auto">
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70 mb-2">Open Showcase</p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3">Submit a Frame</h1>
        <p className="text-zinc-500 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
          Your photo goes live immediately — no approval needed.{" "}
          {session?.user ? (
            <span className="text-zinc-400">It'll be credited to your profile.</span>
          ) : (
            <span>
              <button type="button" onClick={() => signIn("google")} className="text-red-400 hover:text-red-300 underline underline-offset-2">
                Sign in
              </button>{" "}
              to get credit and let others follow your work.
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* UPLOADTHING DROP ZONE */}
          <div className="w-full relative overflow-hidden rounded-[1.75rem] border-2 border-dashed border-white/10 bg-white/[0.02] p-4 flex flex-col items-center justify-center min-h-[220px] md:min-h-[250px]">
            {uploadedUrl ? (
              <div className="relative w-full">
                <img src={uploadedUrl} alt="Preview" className="w-full max-h-64 md:max-h-72 object-cover rounded-[1.5rem]" />
                <div className="absolute top-3 right-3 md:top-4 md:right-4">
                  <button 
                    type="button" 
                    onClick={() => setUploadedUrl(null)}
                    className="bg-black/70 backdrop-blur-md border border-white/25 text-white text-[9px] md:text-[10px] px-4 py-2 rounded-full uppercase font-bold hover:bg-red-500 transition-all"
                  >
                    Remove
                  </button>
                </div>
                {/* CRITICAL: This hidden input passes the URL to your database */}
                <input type="hidden" name="url" value={uploadedUrl} />
              </div>
            ) : (
              <UploadButton<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    setUploadedUrl(res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Upload Failed: ${error.message}`);
                }}
                appearance={{
                  button: "bg-white/10 hover:bg-white/20 text-white text-[11px] md:text-xs uppercase tracking-widest px-6 md:px-8 py-3.5 md:py-4 rounded-xl transition-all w-full sm:w-auto",
                  allowedContent: "text-zinc-500 text-[9px] md:text-[10px] mt-2"
                }}
              />
            )}
          </div>

          {/* Regular Inputs */}
          <div className="relative mt-4">
            <User size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input 
              name="authorName" 
              defaultValue={session?.user?.name ?? ""} 
              placeholder="Your name" 
              required
              className="w-full bg-zinc-900/80 border border-white/8 pl-10 pr-4 py-3.5 rounded-2xl text-base md:text-sm text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600 dynamic-text-fix" 
            />
          </div>

          <div className="relative">
            <Camera size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input 
              name="title" 
              placeholder="Photo title" 
              required
              className="w-full bg-zinc-900/80 border border-white/8 pl-10 pr-4 py-3.5 rounded-2xl text-base md:text-sm text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600 dynamic-text-fix" 
            />
          </div>

          {/* RESPONSIBLY SPLIT GRID: Stacks vertically on phone screen viewports, pairs up side-by-side on computers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
            <div className="relative">
              <MapPin size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input 
                name="location" 
                placeholder="Location"
                className="w-full bg-zinc-900/80 border border-white/8 pl-10 pr-4 py-3.5 rounded-2xl text-base md:text-sm text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600 dynamic-text-fix" 
              />
            </div>
            <div className="relative">
              <input 
                name="coordinates" 
                placeholder="Lat, Long (optional)"
                className="w-full bg-zinc-900/80 border border-white/8 px-4 py-3.5 rounded-2xl text-base md:text-sm text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600 dynamic-text-fix" 
              />
            </div>
          </div>

          <div className="relative">
            <Tag size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select 
              name="category" 
              defaultValue="OTHER"
              className="w-full appearance-none bg-zinc-900/80 border border-white/8 pl-10 pr-4 py-3.5 rounded-2xl text-base md:text-sm text-white outline-none focus:border-red-500/50 transition-all cursor-pointer dynamic-text-fix"
            >
              {CATEGORIES.filter(c => c.value !== "ALL").map(cat => (
                <option key={cat.value} value={cat.value} className="bg-zinc-900">
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || !uploadedUrl}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-black/30 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Publishing..." : "Publish Frame →"}
          </button>
        </form>
      </div>
    </div>
  );
}