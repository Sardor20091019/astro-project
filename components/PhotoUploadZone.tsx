"use client";

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useRouter } from "next/navigation";

export default function PhotoUploadZone() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl border-gray-700 bg-zinc-900/50">
      <h3 className="mb-4 text-lg font-semibold text-white">Upload to Gallery</h3>
      
      <UploadButton<OurFileRouter>
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // This fires after the file is uploaded and saved to Neon
          alert("Upload Completed successfully!");
          router.refresh(); // Reloads the page data smoothly to show the new photo
        }}
        onUploadError={(error: Error) => {
          // If anything goes wrong, it catches it here
          alert(`ERROR! ${error.message}`);
        }}
        appearance={{
          button: "bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all",
          allowedContent: "text-zinc-400 text-sm mt-2"
        }}
      />
    </div>
  );
}