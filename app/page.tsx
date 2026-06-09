/* eslint-disable @typescript-eslint/no-unused-vars */
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
    <div className="flex flex-col">

      <Hero />


      <div className="main-wrapper py-8">
        <Suspense fallback={<HomeGallerySkeleton />}>
          <HomeGallery searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}