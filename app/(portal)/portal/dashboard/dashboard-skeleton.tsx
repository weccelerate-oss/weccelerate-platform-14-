/**
 * Dashboard Skeleton Component
 *
 * Premium loading skeleton matching the dark theme dashboard layout.
 */

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#070b1e]" dir="rtl">
      {/* Sidebar Skeleton */}
      <aside className="fixed right-0 top-0 h-screen w-[272px] bg-gradient-to-b from-[#0a0e27] via-[#080c20] to-[#050810] z-40 hidden lg:flex flex-col border-l border-white/[0.06]">
        <div className="flex items-center gap-3 h-16 px-4 border-b border-white/[0.06]">
          <div className="w-8 h-8 bg-white/[0.06] rounded-lg animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
            <div className="h-2.5 w-14 bg-white/[0.04] rounded animate-pulse" />
          </div>
        </div>
        <div className="mx-4 mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex justify-between mb-2">
            <div className="h-3 w-20 bg-white/[0.06] rounded animate-pulse" />
            <div className="h-3 w-8 bg-white/[0.06] rounded animate-pulse" />
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full animate-pulse" />
        </div>
        <div className="px-3 mt-4 space-y-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="mt-auto px-3 pb-4 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-20 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-white/[0.04] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mr-[272px] pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 bg-[#0a0e27]/80 backdrop-blur-xl border-b border-white/[0.06] h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-40 bg-white/[0.06] rounded-lg animate-pulse" />
            <div className="h-3 w-56 bg-white/[0.04] rounded animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/[0.04] rounded-xl animate-pulse" />
            <div className="w-9 h-9 bg-white/[0.04] rounded-xl animate-pulse" />
            <div className="w-28 h-9 bg-[#c8a951]/20 rounded-sm animate-pulse" />
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="lg:hidden bg-white/[0.03] rounded-2xl p-4 h-20 animate-pulse border border-white/[0.06]" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/[0.03] rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-white/[0.06] rounded-xl animate-pulse" />
                </div>
                <div className="h-7 w-14 bg-white/[0.06] rounded mb-1 animate-pulse" />
                <div className="h-3.5 w-20 bg-white/[0.04] rounded animate-pulse" />
                {i < 2 && <div className="h-1 bg-white/[0.04] rounded-full mt-3 animate-pulse" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="h-4 w-36 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-6 w-16 bg-[#c8a951]/10 rounded-lg animate-pulse" />
                </div>
                <div className="p-5 h-32 animate-pulse" />
              </div>
              <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <div className="h-4 w-28 bg-white/[0.06] rounded animate-pulse" />
                </div>
                <div className="p-5 h-48 animate-pulse" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
                </div>
                <div className="p-3 space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5">
                      <div className="w-9 h-9 bg-white/[0.06] rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-20 bg-white/[0.06] rounded animate-pulse" />
                        <div className="h-2.5 w-28 bg-white/[0.04] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
                </div>
                <div className="p-5 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-2">
                      <div className="w-7 h-7 bg-white/[0.06] rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-full bg-white/[0.06] rounded animate-pulse" />
                        <div className="h-2.5 w-16 bg-white/[0.04] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0a0e27]/95 border-t border-white/[0.06] h-16 flex items-center justify-around px-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 bg-white/[0.06] rounded animate-pulse" />
            <div className="w-8 h-2 bg-white/[0.04] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
