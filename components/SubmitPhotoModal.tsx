/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle2, MapPin, User, Camera, Tag, X, ImagePlus, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/data/photos";
import { useUploadThing } from "@/utils/uploadthing"; // Ensure this matches your project's helper path
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import exifr from "exifr";

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

  // Auto-extracted EXIF Form States
  const [camera, setCamera] = useState("");
  const [iso, setIso] = useState("");
  const [aperture, setAperture] = useState("");
  const [shutter, setShutter] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [rawExifCoords, setRawExifCoords] = useState("");
  const [shareLocation, setShareLocation] = useState(true);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
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
    },
    onUploadError: (error: Error) => {
      alert(`Upload Failed: ${error.message}`);
      setLoading(false);
    },
  });

  const handleClose = () => {
    setSubmitted(false);
    setUploadedUrl(null);
    setCamera("");
    setIso("");
    setAperture("");
    setShutter("");
    setCoordinates("");
    setRawExifCoords("");
    setShareLocation(true);
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

  // Handle local file selection, EXIF extraction, and instant upload
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // 1. Extract ALL EXIF metadata locally before uploading
      const exif = await exifr.parse(file, {
        gps: true,
        ifd0: true,
        exif: true,
      });

      if (exif) {
        // Camera Make & Model + Focal Length
        const make = exif.Make || "";
        const model = exif.Model || "";
        const focal = exif.FocalLength ? ` • ${exif.FocalLength}mm` : "";
        const cameraString = `${make} ${model}${focal}`.trim();
        if (cameraString) setCamera(cameraString);

        // ISO
        if (exif.ISO) setIso(String(exif.ISO));

        // Aperture (f-stop)
        if (exif.FNumber) setAperture(`f/${exif.FNumber}`);

        // Shutter Speed (Format nicely into fractions if less than 1s)
        if (exif.ExposureTime) {
          const exp = exif.ExposureTime;
          if (exp < 1) {
            const denom = Math.round(1 / exp);
            setShutter(`1/${denom}s`);
          } else {
            setShutter(`${exp}s`);
          }
        }

        // GPS Coordinates
        if (exif.latitude && exif.longitude) {
          const coordsStr = `${exif.latitude}, ${exif.longitude}`;
          setRawExifCoords(coordsStr);
          if (shareLocation) {
            setCoordinates(coordsStr);
          }
        }
      }
    } catch (err) {
      console.log("Could not parse EXIF metadata locally:", err);
    }

    // 2. Automatically trigger UploadThing upload
    await startUpload([file]);
  }

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
          className="relative w-full max-w-xl bg-(--surface) border border-(--border) rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--surface)/90 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-(--surface-2) border border-(--border) flex items-center justify-center text-(--accent) shadow-xs">
                <Camera size={18} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-tight text-(--text)">
                Submit New Frame
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-(--surface-2) hover:bg-(--surface-3) text-(--text-dim) hover:text-(--text) transition-colors cursor-pointer border border-(--border) flex items-center justify-center shrink-0"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {submitted ? (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-(--accent)/10 border border-(--accent)/30 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CheckCircle2 size={28} className="text-(--accent)" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight mb-2 text-(--text)">
                  Frame Published
                </h3>
                <p className="text-(--text-dim) font-mono text-[11px] uppercase tracking-[0.15em] mb-6 max-w-sm leading-relaxed">
                  Your capture is now indexed and live in the gallery archive.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <button
                    onClick={() => { 
                      setSubmitted(false); 
                      setUploadedUrl(null); 
                      setCamera(""); setIso(""); setAperture(""); setShutter("");
                      setCoordinates(""); setRawExifCoords(""); setShareLocation(true); 
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border border-(--border) font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-(--text-dim) hover:text-(--text) hover:border-(--border-hover) transition-all cursor-pointer bg-(--surface-2)"
                  >
                    Submit Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 rounded-xl bg-(--text) text-(--bg) font-mono text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-(--accent) hover:text-(--bg) transition-all cursor-pointer shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Session Notice */}
                <div className="flex items-center justify-between bg-(--surface-2) border border-(--border) px-4 py-3 rounded-xl backdrop-blur-md shadow-xs">
                  <p className="text-(--text-dim) font-mono text-[11px] uppercase tracking-[0.1em]">
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
                  <ShieldCheck size={16} className="text-(--accent)" />
                </div>

                {/* Upload Zone */}
                <div className="relative overflow-hidden rounded-xl border border-dashed border-(--border) bg-(--surface-2) p-6 flex flex-col items-center justify-center min-h-[170px] transition-all hover:border-(--border-hover) group">
                  {uploadedUrl ? (
                    <div className="relative w-full">
                      <img src={uploadedUrl} alt="Preview" className="w-full max-h-56 object-cover rounded-xl border border-(--border) shadow-md" />
                      <input type="hidden" name="photoUrl" value={uploadedUrl} />
                      <div className="absolute top-3 right-3">
                        <button 
                          type="button" 
                          onClick={() => { 
                            setUploadedUrl(null); 
                            setCamera(""); setIso(""); setAperture(""); setShutter("");
                            setCoordinates(""); setRawExifCoords(""); setShareLocation(true); 
                          }}
                          className="bg-(--surface) backdrop-blur-md border border-(--border) text-(--text) font-mono text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider font-bold hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-lg"
                        >
                          Replace File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-3 text-center w-full py-2 cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-(--surface-3) border border-(--border) flex items-center justify-center text-(--accent) group-hover:scale-105 transition-transform shadow-xs">
                        {isUploading || loading ? <Loader2 size={22} className="animate-spin text-(--accent)" /> : <ImagePlus size={22} />}
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-(--text) font-bold">
                          {isUploading || loading ? "Extracting EXIF & Uploading..." : "Drop image or click to browse"}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-muted)">
                          Auto-extracts Camera, ISO, Aperture, Shutter & GPS
                        </span>
                      </div>
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        disabled={isUploading || loading}
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                {/* Technical Metadata Inputs (Auto-filled from EXIF) */}
                {uploadedUrl && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-500">
                    <input 
                      name="camera" 
                      value={camera} 
                      onChange={(e) => setCamera(e.target.value)} 
                      placeholder="Camera" 
                      className="bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl font-mono text-[11px] text-(--text) placeholder:text-(--text-muted) outline-none focus:border-(--accent) transition-all" 
                    />
                    <input 
                      name="iso" 
                      value={iso} 
                      onChange={(e) => setIso(e.target.value)} 
                      placeholder="ISO" 
                      type="text" 
                      className="bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl font-mono text-[11px] text-(--text) placeholder:text-(--text-muted) outline-none focus:border-(--accent) transition-all" 
                    />
                    <input 
                      name="aperture" 
                      value={aperture} 
                      onChange={(e) => setAperture(e.target.value)} 
                      placeholder="Aperture (f/2.8)" 
                      className="bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl font-mono text-[11px] text-(--text) placeholder:text-(--text-muted) outline-none focus:border-(--accent) transition-all" 
                    />
                    <input 
                      name="shutter" 
                      value={shutter} 
                      onChange={(e) => setShutter(e.target.value)} 
                      placeholder="Shutter (1/500s)" 
                      className="bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl font-mono text-[11px] text-(--text) placeholder:text-(--text-muted) outline-none focus:border-(--accent) transition-all" 
                    />
                  </div>
                )}

                {/* Author Name */}
                <div className="flex items-center bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl focus-within:border-(--accent) transition-all">
                  <User size={16} className="text-(--text-muted) shrink-0 mr-3 pointer-events-none" />
                  <input name="authorName" defaultValue={session?.user?.name ?? ""} placeholder="Artist / Author Name" required className="w-full bg-transparent font-mono text-[11px] uppercase tracking-[0.1em] text-(--text) outline-none placeholder:text-(--text-muted)" />
                </div>

                {/* Title */}
                <div className="flex items-center bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl focus-within:border-(--accent) transition-all">
                  <Camera size={16} className="text-(--text-muted) shrink-0 mr-3 pointer-events-none" />
                  <input name="title" placeholder="Frame Title" required className="w-full bg-transparent font-mono text-[11px] uppercase tracking-[0.1em] text-(--text) outline-none placeholder:text-(--text-muted)" />
                </div>

                {/* Location & Coordinates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl focus-within:border-(--accent) transition-all">
                    <MapPin size={16} className="text-(--text-muted) shrink-0 mr-3 pointer-events-none" />
                    <input name="location" placeholder="Location Name (Optional)" className="w-full bg-transparent font-mono text-[11px] uppercase tracking-[0.1em] text-(--text) outline-none placeholder:text-(--text-muted)" />
                  </div>
                  <div className="flex items-center bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl focus-within:border-(--accent) transition-all">
                    <input 
                      name="coordinates" 
                      value={coordinates}
                      onChange={(e) => {
                        setCoordinates(e.target.value);
                        if (!rawExifCoords) setRawExifCoords(e.target.value);
                      }}
                      placeholder="Coordinates (Auto or Manual)" 
                      className="w-full bg-transparent font-mono text-[11px] uppercase tracking-[0.1em] text-(--text) outline-none placeholder:text-(--text-muted)" 
                    />
                  </div>
                </div>

                {/* EXIF Privacy Toggle Button */}
                {rawExifCoords && (
                  <div className="flex items-center justify-between px-4 py-2.5 bg-(--surface-2) border border-(--border) rounded-xl animate-in fade-in">
                    <span className="font-mono text-[10px] text-(--text-dim) uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={13} className="text-(--accent)" /> EXIF GPS Discovered
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !shareLocation;
                        setShareLocation(nextState);
                        setCoordinates(nextState ? rawExifCoords : "");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        shareLocation 
                          ? "bg-(--accent)/10 border-(--accent)/30 text-(--accent)" 
                          : "bg-(--surface-3) border-(--border) text-(--text-muted)"
                      }`}
                    >
                      {shareLocation ? <Eye size={13} /> : <EyeOff size={13} />}
                      {shareLocation ? "Sharing on Map" : "Hidden from Map"}
                    </button>
                  </div>
                )}

                {/* Category Select */}
                <div className="flex items-center bg-(--surface-2) border border-(--border) px-3.5 py-2.5 rounded-xl focus-within:border-(--accent) transition-all">
                  <Tag size={16} className="text-(--text-muted) shrink-0 mr-3 pointer-events-none" />
                  <select name="category" defaultValue="OTHER" className="w-full appearance-none bg-transparent font-mono text-[11px] uppercase tracking-[0.1em] text-(--text) outline-none cursor-pointer">
                    {CATEGORIES.filter(c => c.value !== "ALL").map(cat => (
                      <option key={cat.value} value={cat.value} className="bg-(--surface) text-(--text) font-mono">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !uploadedUrl || isUploading} 
                  className="w-full bg-(--text) text-(--bg) py-3 rounded-xl font-mono text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-(--accent) hover:text-(--bg) transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-1"
                >
                  {loading || isUploading ? "PROCESSING EXIF & UPLOADING..." : "POST THE PHOTO"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}