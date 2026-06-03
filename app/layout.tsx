import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Mono, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import DesktopEffects from "@/components/DesktopEffects";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASTROSPECTRUM | Photography by Sardor Sunatullayev",
  description: "A cinematic photography gallery exploring light, color, and the world through a lens.",
};

function LeaderboardFallback() {
  return (
    <div className="rounded-2xl border border-white/6 bg-zinc-900/20 p-6">
      <div className="mb-6 h-3 w-28 bg-white/[0.08]" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="h-3 w-4 bg-white/[0.06]" />
            <div className="h-8 w-8 rounded-full bg-white/[0.06]" />
            <div>
              <div className="mb-2 h-3 w-24 bg-white/[0.06]" />
              <div className="h-2 w-16 bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`}>
      <body>
        <AuthProvider>
          <DesktopEffects>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />

              <div className="mx-auto grid w-full max-w-[1200px] flex-grow grid-cols-1 gap-12 px-4 py-8 lg:grid-cols-[1fr,300px] lg:px-0">
                <main className="min-w-0">{children}</main>

                <aside className="hidden lg:block">
                  <div className="sticky top-24">
                    <Suspense fallback={<LeaderboardFallback />}>
                      <Leaderboard />
                    </Suspense>
                  </div>
                </aside>
              </div>

              <Footer />
            </div>
            <Toaster position="bottom-right" theme="dark" />
          </DesktopEffects>
        </AuthProvider>
      </body>
    </html>
  );
}
