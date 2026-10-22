import type { NextConfig } from "next";

<<<<<<< HEAD
const backendUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://astro-project-1213.onrender.com";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://telegram.org https://accounts.google.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*.ufs.sh https://ufs.sh https://utfs.io https://lh3.googleusercontent.com https://cdn4.telegram.org https://uploadthing.com https://placehold.co;
      font-src 'self' data:;
      connect-src 'self' https://challenges.cloudflare.com https://astro-project-1213.onrender.com https://api.stripe.com;
      frame-src https://challenges.cloudflare.com https://telegram.org https://accounts.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
];

=======
>>>>>>> 65a6b4c (fix: update)
const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    minimumCacheTTL: 31536000,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "t.me",
      },
      {
        protocol: "https",
        hostname: "cdn4.telegram.org",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
<<<<<<< HEAD
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/photos/:path*",
        destination: `${backendUrl}/api/photos/:path*`,
      },
      {
        source: "/api/payments/:path*",
        destination: `${backendUrl}/api/payments/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/api/admin/:path*`,
      },
    ];
  },
=======
>>>>>>> 65a6b4c (fix: update)
};

export default nextConfig;
