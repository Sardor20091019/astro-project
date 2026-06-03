import type { Metadata } from "next";
import { DM_Mono, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`}>
      <body>
        <AuthProvider>
          <DesktopEffects>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />

              {/* Cleaned layout wrapper: Removed grid configurations and the sidebar column */}
              <div className="mx-auto w-full max-w-[1200px] flex-grow px-4 py-8 lg:px-0">
                <main className="min-w-0">
                  {children}
                </main>
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