// utils/uploadthing.ts (in your Next.js frontend)
import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/backend/src/uploadthing/uploadthing.router"; 

// Replace with your NestJS backend URL (e.g., from environment variables)
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: `${backendUrl}/uploadthing`,
});

export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  url: `${backendUrl}/uploadthing`,
});

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
  url: `${backendUrl}/uploadthing`,
});