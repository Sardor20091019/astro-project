import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function CinematicLandingPage() {
  // Updated for a Finland Lapland / Northern Lights theme
  const heroPhoto = {
    title: "Whisper of the North",
    location: "Finland Lapland",
    url: "/hero.jpg",
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col justify-between relative overflow-hidden">
      
      {/* Cinematic Full-Screen Hero Section */}
      <section className="relative w-full h-screen flex items-end p-6 sm:p-12 lg:p-16">
        
        {/* Background Image with Deep Cinematic Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={heroPhoto.url}
            alt={heroPhoto.title}
            fill
            priority
            unoptimized={true}
            className="object-cover scale-105 transition-transform duration-1000"
          />
          {/* Multi-stop dark overlay for dramatic contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        </div>

        {/* Hero Content & Right-Aligned Action */}
        <div className="relative z-20 max-w-7xl w-full mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8">
          
          {/* Left Side: Polished Typography & Story */}
          <div className="flex flex-col gap-5 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-(--accent)/20 border border-(--accent)/40 text-(--accent) font-mono text-[9px] uppercase tracking-[0.25em] font-bold">
                Featured Masterpiece // 01
              </span>
              <span className="h-px w-8 bg-white/30" />
              {heroPhoto.location && (
                <span className="text-white/70 font-mono text-[10px] tracking-[0.2em] uppercase font-medium">
                  {heroPhoto.location}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-2xl">
              {heroPhoto.title}
            </h1>

            <p className="text-xs sm:text-sm text-white/75 uppercase tracking-[0.18em] font-mono max-w-xl leading-relaxed">
              Sub-zero wilderness beneath the endless dance of the aurora borealis. A study in celestial light, frozen silhouetted pines, and arctic silence.
            </p>
          </div>

          {/* Right Side: Clean Pinned Action Button */}
          <div className="flex flex-col items-start md:items-end shrink-0 self-start md:self-end">
            <Link
              href="/photos"
              className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-(--accent) text-(--bg) font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(var(--accent-rgb),0.3)] hover:scale-105 transition-all duration-300"
            >
              Enter Gallery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
}