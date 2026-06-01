"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle2, MapPin, User, Camera, Tag } from "lucide-react";
import { CATEGORIES } from "@/data/photos";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { moderateImageUrl } from "@/app/actions/moderation";

export default function SubmitPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
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
    <div className="min-h-screen pt-24 md:pt-28 pb-16 px-4 md:px-6 bg-[#080808]">
      <div className="max-w-xl mx-auto">
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70 mb-2">Open Showcase</p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3">Submit a Frame</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                {/* RENAMED FROM 'url' TO 'photoUrl' TO FIX DEPRECATION */}
                <input type="hidden" name="photoUrl" value={uploadedUrl} />
              </div>
            ) : (
              <UploadButton<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                onClientUploadComplete={async (res) => {
                  if (res && res[0]) {
                    setLoading(true);
                    const result = await moderateImageUrl(res[0].url);
                    
                    const isSafe = result.nudity.safe > 0.8 && result.gore.prob < 0.2;

                    if (isSafe) {
                      setUploadedUrl(res[0].url);
                    } else {
                      alert("Upload rejected: Content does not meet safety guidelines.");
                      setUploadedUrl(null);
                    }
                    setLoading(false);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Upload Failed: ${error.message}`);
                }}
              />
            )}
          </div>
          {/* ... rest of your form inputs ... */}
          <button type="submit" disabled={loading || !uploadedUrl}>Publish</button>
        </form>
      </div>
    </div>
  );
}