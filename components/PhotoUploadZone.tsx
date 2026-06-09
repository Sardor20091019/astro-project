/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/photos";
import { CheckCircle2 } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

export default function AdminUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uploadedUrl) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      url: uploadedUrl,
      title: formData.get("title"),
      category: formData.get("category"),
      location: formData.get("location"),
      coordinates: formData.get("coordinates"),
      camera: formData.get("camera"),
      iso: formData.get("iso"),
      aperture: formData.get("aperture"),
      shutter: formData.get("shutter"),
      focalLength: formData.get("focalLength"),
      authorName: formData.get("authorName"),
    };

    const res = await fetch("/api/photos/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setUploadedUrl(null);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Something went wrong saving the metadata.");
    }
    setLoading(false);
  }

  const inputClass = "w-full bg-zinc-900 border border-white/8 p-3 rounded-xl text-sm text-white outline-none focus:border-red-500/60 focus:bg-zinc-800 transition-all placeholder:text-zinc-600";
  const labelClass = "block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cloud File Drop Zone */}
      <div className="w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-zinc-900/40 p-4 relative overflow-hidden">
        {uploadedUrl ? (
          <div className="text-center text-green-500 font-black uppercase tracking-widest text-xs">
            <CheckCircle2 size={32} className="mx-auto mb-2" /> Image Uploaded!
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
    alert(`ERROR! ${error.message}`);
  }}
  appearance={{
    button: "bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all",
  }}
/>
        )}
      </div>

      {/* Inputs */}
      <div>
        <label className={labelClass}>Category</label>
        <select name="category" defaultValue="OTHER" className={`${inputClass} appearance-none cursor-pointer`}>
          {CATEGORIES.filter((c) => c.value !== "ALL").map((cat) => (
            <option key={cat.value} value={cat.value} className="bg-zinc-900">{cat.icon} {cat.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Title *</label>
        <input name="title" placeholder="e.g. Milky Way Over Tashkent" required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Location</label><input name="location" className={inputClass} /></div>
        <div><label className={labelClass}>Coordinates</label><input name="coordinates" className={inputClass} /></div>
      </div>

      <div>
        <p className={labelClass}>Camera Settings</p>
        <div className="grid grid-cols-2 gap-2.5">
          <input name="camera" placeholder="Camera body" defaultValue="Xiaomi 15T Pro" className={inputClass} />
          <input name="iso" type="number" placeholder="ISO" className={inputClass} />
          <input name="aperture" placeholder="Aperture (f/1.8)" className={inputClass} />
          <input name="shutter" placeholder="Shutter (1/1000s)" className={inputClass} />
          <input name="focalLength" placeholder="Focal length (23mm)" className={inputClass} />
          <input name="authorName" placeholder="Author" className={inputClass} />
        </div>
      </div>

      <button type="submit" disabled={loading || !uploadedUrl} className="relative w-full bg-red-600 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-30 cursor-pointer shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2">
        {loading ? "Saving to Database..." : "Publish to Gallery"}
      </button>
    </form>
  );
}