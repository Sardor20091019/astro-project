"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/photos";
import { Upload, CheckCircle2 } from "lucide-react";

export default function AdminUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/photos/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setPreview(null);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Something went wrong.");
    }
    setLoading(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const inputClass = "w-full bg-zinc-900 border border-white/8 p-3 rounded-xl text-sm text-white outline-none focus:border-red-500/60 focus:bg-zinc-800 transition-all placeholder:text-zinc-600";
  const labelClass = "block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* File Drop Zone */}
      <label className="block w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-red-500/40 transition-all overflow-hidden relative group">
        <input type="file" name="file" className="hidden" onChange={handleFileChange} accept="image/*" required />
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Change photo</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3">
            <Upload size={20} strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest">Drop image here</p>
              <p className="text-[9px] mt-1 text-zinc-700">or click to browse</p>
            </div>
          </div>
        )}
      </label>

      {/* Category */}
      <div>
        <label className={labelClass}>Category</label>
        <select
          name="category"
          defaultValue="OTHER"
          className={`${inputClass} appearance-none cursor-pointer`}
        >
          {CATEGORIES.filter(c => c.value !== "ALL").map(cat => (
            <option key={cat.value} value={cat.value} className="bg-zinc-900">
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input name="title" placeholder="e.g. Milky Way Over Tashkent" required className={inputClass} />
      </div>

      {/* Location + Coordinates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Location</label>
          <input name="location" placeholder="Yunusabad" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Coordinates</label>
          <input name="coordinates" placeholder="41.29, 69.24" className={inputClass} />
        </div>
      </div>

      {/* Camera Settings - collapsible-style grid */}
      <div>
        <p className={labelClass}>Camera Settings</p>
        <div className="grid grid-cols-2 gap-2.5">
          <input name="camera" placeholder="Camera body" defaultValue="Xiaomi 15T Pro" className={inputClass} />
          <input name="iso" type="number" placeholder="ISO" className={inputClass} />
          <input name="aperture" placeholder="Aperture (f/1.8)" className={inputClass} />
          <input name="shutter" placeholder="Shutter (1/1000s)" className={inputClass} />
          <input name="focalLength" placeholder="Focal length (23mm)" className={inputClass} />
          <input name="authorName" placeholder="Author (optional)" className={inputClass} />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="relative w-full overflow-hidden bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-30 cursor-pointer shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
      >
        {success ? (
          <>
            <CheckCircle2 size={14} />
            Published!
          </>
        ) : loading ? (
          <>
            <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Upload size={14} />
            Publish to Gallery
          </>
        )}
      </button>
    </form>
  );
}
