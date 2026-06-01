"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle2, Upload, MapPin, User, Camera, Tag } from "lucide-react";
import { CATEGORIES } from "@/data/photos";

export default function SubmitPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/photos/upload", { method: "POST", body: new FormData(e.currentTarget) });
    if (res.ok) setSubmitted(true);
    else alert("Upload failed. Please try again.");
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={28} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Frame Published!</h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">Your photo is now live in the gallery.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(false); setPreview(null); setFileName(null); }}
              className="px-6 py-3 rounded-full border border-white/15 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              Submit another
            </button>
            <a href="/" className="px-6 py-3 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              View gallery
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 bg-[#080808]">
      <div className="max-w-xl mx-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/70 mb-2">Open Showcase</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-3">Submit a Frame</h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8">
          Your photo goes live immediately — no approval needed.{" "}
          {session?.user ? (
            <span className="text-zinc-400">It'll be credited to your profile.</span>
          ) : (
            <span>
              <button onClick={() => signIn("google")} className="text-red-400 hover:text-red-300 underline underline-offset-2">
                Sign in
              </button>{" "}
              to get credit and let others follow your work.
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File drop zone */}
          <label className="relative block cursor-pointer group">
            <input
              type="file" name="file" required accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
            <div className={`relative overflow-hidden rounded-[1.75rem] border-2 border-dashed transition-all duration-300 ${
              preview ? "border-white/20" : "border-white/10 bg-white/[0.02] hover:border-red-500/50 hover:bg-white/[0.04]"
            }`}>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full max-h-72 object-cover rounded-[1.5rem]" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]">
                    <p className="text-xs font-black uppercase tracking-widest text-white">Change photo</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-red-500/30 transition-all">
                    <Upload size={22} className="text-white/30 group-hover:text-red-400 transition-colors" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">Select photo</p>
                  <p className="text-[10px] text-zinc-600 mt-1">JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
            {fileName && <p className="mt-2 text-[10px] text-zinc-500 text-center truncate">{fileName}</p>}
          </label>

          <div className="relative">
            <User size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input name="authorName" defaultValue={session?.user?.name ?? ""} placeholder="Your name" required
              className="w-full bg-zinc-900/80 border border-white/8 pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600" />
          </div>

          <div className="relative">
            <Camera size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input name="title" placeholder="Photo title" required
              className="w-full bg-zinc-900/80 border border-white/8 pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <MapPin size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input name="location" placeholder="Location"
                className="w-full bg-zinc-900/80 border border-white/8 pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600" />
            </div>
            <input name="coordinates" placeholder="Lat, Long (optional)"
              className="w-full bg-zinc-900/80 border border-white/8 px-4 py-3.5 rounded-2xl text-sm text-white outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600" />
          </div>

          <div className="relative">
            <Tag size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select name="category" defaultValue="OTHER"
              className="w-full appearance-none bg-zinc-900/80 border border-white/8 pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none focus:border-red-500/50 transition-all cursor-pointer">
              {CATEGORIES.filter(c => c.value !== "ALL").map(cat => (
                <option key={cat.value} value={cat.value} className="bg-zinc-900">
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-black/30 disabled:opacity-40 disabled:cursor-not-allowed mt-2">
            {loading ? "Publishing..." : "Publish Frame →"}
          </button>
        </form>
      </div>
    </div>
  );
}
