export default function PhotosLoading() {
  return (
    <section 
      style={{ paddingBottom: 'var(--footer-padding)' }} 
      className="py-12 sm:py-16 lg:py-20 w-full flex justify-center bg-(--bg) min-h-screen text-(--text)"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col">
        {/* Adaptive Premium Fluid Wave Shimmer Animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes premiumWave {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-premium-wave {
            background: linear-gradient(
              90deg, 
              transparent 0%, 
              color-mix(in srgb, var(--text) 5%, transparent) 25%, 
              color-mix(in srgb, var(--text) 18%, transparent) 50%, 
              color-mix(in srgb, var(--text) 5%, transparent) 75%, 
              transparent 100%
            );
            background-size: 200% 100%;
            animation: premiumWave 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}} />

        {/* Header Skeleton */}
        <div className="border-y border-(--border) py-8 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-(--surface-2) rounded animate-pulse" />
            <div className="h-10 sm:h-12 w-64 bg-(--surface-2) rounded animate-pulse" />
          </div>
          <div className="h-4 w-32 bg-(--surface-2) rounded animate-pulse" />
        </div>

        {/* Categories Filter Tabs Skeleton */}
        <div className="border-b border-(--border) py-4 mb-8 overflow-hidden">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 min-w-[280px] bg-(--surface-2) rounded-2xl animate-pulse shrink-0" />
            ))}
          </div>
        </div>

        {/* Count Bar Skeleton */}
        <div className="flex items-center justify-between pb-6">
          <div className="h-3 w-48 bg-(--surface-2) rounded animate-pulse" />
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface) flex flex-col shadow-xl">
              <div className="relative aspect-4/3 w-full bg-(--surface-2) overflow-hidden">
                <div className="absolute inset-0 animate-premium-wave pointer-events-none" />
              </div>
              <div className="p-5 flex flex-col gap-4 bg-(--surface)">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-(--surface-2) rounded animate-pulse" />
                  <div className="h-3 w-16 bg-(--surface-2) rounded animate-pulse" />
                </div>
                <div className="h-5 w-3/4 bg-(--surface-2) rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-(--surface-2) rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}