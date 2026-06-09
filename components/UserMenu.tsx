/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { updateUserProfile } from "@/lib/actions";
import { UploadButton } from "@uploadthing/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="rounded-full overflow-hidden border border-zinc-700 hover:opacity-80 transition-opacity">
        <img src={imageUrl || "/default-avatar.png"} className="w-8 h-8 object-cover" alt="Avatar" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg p-4 z-50 shadow-2xl">
          {!isEditing ? (
            <div className="flex flex-col gap-1">
              <button onClick={() => setIsEditing(true)} className="text-sm w-full text-left p-2 hover:bg-zinc-800 rounded">
                Edit Profile
              </button>
             <button 
  onClick={() => signOut({ callbackUrl: '/' })} 
  className="text-sm w-full text-left p-2 text-red-400 hover:bg-zinc-800 rounded"
>
  Logout
</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3"> 
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-zinc-800 p-2 rounded text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500" 
                placeholder="New Nickname" 
              />
              
              <UploadButton<OurFileRouter, "profileUploader">
                endpoint="profileUploader"
                onClientUploadComplete={(res) => {
                  setImageUrl(res[0].serverData.url);
                }}
                onUploadError={(err) => alert("Upload failed: " + err.message)}
              />
              
              <div className="flex gap-2">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 text-white p-2 rounded text-sm disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="flex-1 bg-zinc-700 text-white p-2 rounded text-sm"
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