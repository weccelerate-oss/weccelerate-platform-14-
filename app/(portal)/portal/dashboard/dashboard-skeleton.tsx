/**
 * Dashboard Skeleton — loading state (no sidebar, navbar handled by layout)
 */

export function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Greeting */}
      <div className="space-y-2 pt-2">
        <div className="h-6 w-48 bg-white/[0.06] rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-white/[0.04] rounded animate-pulse" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/[0.03] rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
            <div className="w-10 h-10 bg-white/[0.06] rounded-xl mb-3 animate-pulse" />
            <div className="h-7 w-14 bg-white/[0.06] rounded mb-1 animate-pulse" />
            <div className="h-3.5 w-20 bg-white/[0.04] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] h-64 animate-pulse" />
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] h-48 animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] h-48 animate-pulse" />
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] h-40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
