/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Metadata } from "next";
import { Toaster } from "sonner";
// @ts-ignore
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LenisProvider from "@/components/LenisProvider";
import CursorFollower from "@/components/CursorFollower";
import Leaderboard from "@/components/Leaderboard";

export const metadata: Metadata = {
  title: "ASTROSPECTRUM | Photography by Sardor Sunatullayev",
  description: "A cinematic photography gallery — exploring light, color, and the world through a lens.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LenisProvider>
            <CursorFollower />
            <div className="relative min-h-screen flex flex-col">
              <Navbar />
              
              {/* THE LAYOUT STRATEGY:
                1. 'max-w-[1200px] mx-auto': Centers the entire block.
                2. 'px-4 lg:px-0': Adds breathing room on mobile, clean edges on desktop.
                3. 'grid-cols-[1fr,300px]': Keeps main content fluid and sidebar fixed.
                4. 'gap-12': Creates the necessary space between content and sidebar.
              */}
              <div className="flex-grow w-full max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-12">
                
                <main className="min-w-0">
                  {children}
                </main>
                
                <aside className="hidden lg:block">
                  <div className="sticky top-24">
                    <Leaderboard />
                  </div>
                </aside>
                
              </div>
              
              <Footer />
            </div>
            <Toaster position="bottom-right" theme="dark" />
          </LenisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}