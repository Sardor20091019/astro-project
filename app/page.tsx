import { Suspense } from "react";
import Hero from "@/components/Hero";
import HomeGallery, { HomeGallerySkeleton } from "@/components/HomeGallery";
import HomeUserGreeting from "@/components/HomeUserGreeting";
import user from "pusher-js/types/src/core/user";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    q?: string;
    category?: string;
  }>;
}

function UserGreetingSkeleton() {
  return (
    <div className="world-card p-2 text-center text-xs world-text-muted">
      <p>hi</p>
    </div>
  );
}

export default function HomePage({ searchParams }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-black text-white">
      <Suspense fallback={<UserGreetingSkeleton />}>
        <HomeUserGreeting />
      </Suspense>

      <div className="w-full grow px-4 sm:px-6 md:px-8">
        <Hero />
        <Suspense fallback={<HomeGallerySkeleton />}>
          <HomeGallery searchParams={searchParams} />
        </Suspense>
      </div>

      <footer className="mt-auto w-full border-t border-zinc-900 bg-black py-6 text-center text-zinc-600 px-4">
        <p>&copy; {new Date().getFullYear()} Astrospectrum. All rights reserved.</p>
      </footer>
    </div>
  );
}