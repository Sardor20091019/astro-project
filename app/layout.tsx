/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Metadata } from "next";
import { DM_Mono, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
// @ts-ignore
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DesktopEffects from "@/components/DesktopEffects";
import GoogleOneTap from "@/components/GoogleOneTap";

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
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
        {/* Load Google Identity Services script asynchronously */}
        <Script src="https://accounts.google.com/gsi/client" async defer />

        <ThemeProvider>
          <AuthProvider>
            <GoogleOneTap />
            <DesktopEffects>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>        
              <Footer />
              <Toaster position="bottom-right" theme="system" />
            </DesktopEffects>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}