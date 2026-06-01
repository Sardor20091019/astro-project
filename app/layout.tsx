import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LenisProvider from "@/components/LenisProvider";
import CursorFollower from "@/components/CursorFollower";

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
              <div className="flex-grow">{children}</div>
              <Footer />
            </div>
          </LenisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
