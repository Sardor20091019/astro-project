import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // Specifically for UploadThing
      },
      {
        protocol: "https",
        hostname: "uploadthing.com", // Official UploadThing domain
      },
    ],
  },
};

export default nextConfig;