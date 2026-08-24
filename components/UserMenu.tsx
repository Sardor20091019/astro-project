/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { updateUserProfile } from "@/lib/actions";
import { UploadButton } from "@uploadthing/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Edit3, LogOut, X } from "lucide-react";

interface UserMenuProps {
  user: { id: string; name?: string | null; image?: string | null };
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(user.id, { name, image: imageUrl });
      router.refresh();
      setIsEditing(false);
      setIsOpen(false);
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="rounded-full overflow-hidden border-2 border-(--border) hover:border-(--accent) transition-all duration-300 w-9 h-9 flex items-center justify-center bg-(--surface) cursor-pointer"
        title="Account menu"
      >
        <img src={imageUrl || "/default-avatar.png"} className="w-full h-full object-cover" alt="Avatar" />
      </button>

      {isOpen && (
        <div 
          style={{ borderRadius: "var(--radius-md)" }}
          className="absolute right-0 mt-3 w-72 bg-(--surface) border border-(--border) p-4 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
        >
          {!isEditing ? (
            <div className="flex flex-col gap-1.5">
              <div className="px-3 py-2 border-b border-(--border) mb-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-(--text-muted)">Signed in as</p>
                <p className="text-xs font-bold text-(--text) truncate">{user.name || "User"}</p>
              </div>
              
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ borderRadius: "var(--radius-sm)" }}
                className="text-xs font-mono uppercase tracking-[0.15em] w-full text-left px-3 py-2.5 text-(--text-dim) hover:bg-(--surface-2) hover:text-(--text) transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-(--accent)" />
                Edit Profile
              </button>

              <button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                style={{ borderRadius: "var(--radius-sm)" }}
                className="text-xs font-mono uppercase tracking-[0.15em] w-full text-left px-3 py-2.5 text-red-400 hover:bg-(--surface-2) transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-(--border) pb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-(--text) font-bold">Edit Profile</span>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="text-(--text-muted) hover:text-(--text) cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-(--text-muted)">Display Name</label>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="input text-xs py-2" 
                  placeholder="Your Name" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-(--text-muted)">Avatar Image</label>
                <div className="py-1">
                  <UploadButton<OurFileRouter, "profileUploader">
                    endpoint="profileUploader"
                    appearance={{
                      button: "bg-[var(--text)] text-[var(--bg)] text-xs font-mono uppercase tracking-[0.12em] px-3 py-2 rounded-[var(--btn-radius)] hover:bg-[var(--accent)] transition-all cursor-pointer",
                      allowedContent: "text-[var(--text-muted)] text-[10px] font-mono mt-1",
                      container: "w-full border border-dashed border-[var(--border)] rounded-[var(--radius-md)] p-3 bg-[var(--surface-2)] flex flex-col items-center justify-center gap-1"
                    }}
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        const finalUrl = res[0].serverData?.url || res[0].ufsUrl || res[0].url;
                        setImageUrl(finalUrl);
                      }
                    }}
                    onUploadError={(err) => alert("Upload failed: " + err.message)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  style={{ borderRadius: "var(--radius-sm)" }}
                  className="flex-1 btn-primary py-2 text-[10px] justify-center cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  style={{ borderRadius: "var(--radius-sm)" }}
                  className="flex-1 btn-ghost py-2 text-[10px] justify-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}