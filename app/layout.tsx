import type { Metadata } from "next";
import { DM_Mono, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
// @ts-ignore
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider"; // Ensure this import is here
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
      <body className="bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <DesktopEffects>
              {/* Navbar stays full width (or custom width) */}
              <Navbar />
              
              {/* Children (Home/Pages) are rendered here */}
              <main className="min-h-screen">
                {children}
              </main>
              
              <Footer />
              <Toaster position="bottom-right" theme="dark" />
            </DesktopEffects>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}