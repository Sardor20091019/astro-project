import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function CinematicLandingPage() {
  const heroPhoto = {
    title: "A quiet Forest",
    location: "Finland Lapland",
    url: "/hero.jpg",
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col justify-between relative overflow-hidden selection:bg-(--accent) selection:text-(--bg)">
      
      {/* Cinematic Full-Screen Hero Section */}
      <section className="relative w-full h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        
        {/* Background Image with Deep Cinematic Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={heroPhoto.url}
            alt={heroPhoto.title}
            fill
            priority
            className="object-cover scale-105 filter brightness-90 contrast-110 transition-transform duration-1000 ease-out hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />
        </div>

        {/* Top Minimal Branding */}
        <div className="relative z-20 w-full flex justify-between items-center pt-2 font-mono text-[11px] tracking-[0.25em] uppercase text-white/60">
          <span>Sardor Sunatullayev</span>
          <span>{heroPhoto.location}</span>
        </div>

        {/* Hero Content & Action Bar */}
        <div className="relative z-20 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-6">
          
          {/* Left Side: Clean Title & Minimal Description */}
          <div className="flex flex-col gap-4 max-w-xl w-full">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light uppercase tracking-tight text-white font-serif">
              {heroPhoto.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 font-mono tracking-wider max-w-md leading-relaxed">
              A quiet, freezing forest under the northern lights. A look at starry skies, cold trees, and deep peace.
            </p>
          </div>

          {/* Right Side: Clean Action Button */}
          <div className="flex flex-col items-center sm:items-end shrink-0 w-full sm:w-auto">
            <Link
              href="/photos"
              className="group inline-flex items-center justify-center gap-4 px-8 py-4 rounded-xl bg-(--accent) text-(--bg) font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto"
            >
              <span>Enter Gallery</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
}