/* app/loading.tsx */
export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-(--bg) py-12 flex justify-center">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col">
        {/* Shimmer Animation Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes explicitShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer-sweep {
            animation: explicitShimmer 1.4s infinite linear;
            background: linear-gradient(
              90deg, 
              transparent 0%, 
              rgba(255, 255, 255, 0.25) 50%, 
              transparent 100%
            );
          }
        `}} />

        {/* Header Skeleton */}
        <div className="border-y border-white/10 py-8 mb-8 flex justify-between items-end">
          <div className="space-y-3">
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-64 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 flex flex-col shadow-2xl">
              <div className="relative aspect-4/3 w-full bg-white/10 overflow-hidden">
                <div className="absolute inset-0 animate-shimmer-sweep pointer-events-none" />
              </div>
              <div className="p-5 flex flex-col gap-4 bg-black/40">
                <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-white/15 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}