import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/backend/src/uploadthing/uploadthing.router"; 

const backendUrl = "http://localhost:4000/api";

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: `${backendUrl}/api/uploadthing`,
});

export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  url: `${backendUrl}/api/uploadthing`,
});

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
  url: `${backendUrl}/api/uploadthing`,
});