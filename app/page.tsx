import { Suspense } from "react";
import Hero from "@/components/Hero";
import HomeGallery, { HomeGallerySkeleton } from "@/components/HomeGallery";
import HomeUserGreeting from "@/components/HomeUserGreeting";

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
    // Removed bg-black/text-white. Now it inherits from the layout/globals.
    <div className="flex min-h-screen flex-col justify-between">
      <Suspense fallback={<UserGreetingSkeleton />}>
        <HomeUserGreeting />
      </Suspense>

      <div className="w-full grow px-4 sm:px-6 md:px-8">
        <Hero />
        <Suspense fallback={<HomeGallerySkeleton />}>
          <HomeGallery searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Footer is now World-Aware */}
      <footer className="mt-auto w-full border-t border-(--border) bg-(--surface) py-6 text-center text-(--text-muted) px-4">
        <p>&copy; {new Date().getFullYear()} Astrospectrum. All rights reserved.</p>
      </footer>
    </div>
  );
}