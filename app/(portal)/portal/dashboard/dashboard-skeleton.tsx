/**
 * Dashboard Skeleton Component
 *
 * Premium loading skeleton matching the redesigned dashboard layout.
 */

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-slate-50/50" dir="rtl">
      {/* Sidebar Skeleton */}
      <aside className="fixed right-0 top-0 h-screen w-[272px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 z-40 hidden lg:flex flex-col border-l border-slate-800/50">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-800/60">
          <div className="w-8 h-8 bg-slate-800 rounded-lg animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
            <div className="h-2.5 w-14 bg-slate-800/60 rounded animate-pulse" />
          </div>
        </div>

        {/* Progress card */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex justify-between mb-2">
            <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-8 bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full animate-pulse" />
          <div className="h-2.5 w-28 bg-slate-700/60 rounded mt-1.5 animate-pulse" />
        </div>

        {/* Nav items */}
        <div className="px-3 mt-4 space-y-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* User section */}
        <div className="mt-auto px-3 pb-4 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-20 bg-slate-800 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-slate-800/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mr-[272px] pb-20 lg:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-40 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-3 w-56 bg-slate-100 rounded animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-100 rounded-xl animate-pulse" />
            <div className="w-9 h-9 bg-slate-100 rounded-xl animate-pulse" />
            <div className="w-28 h-9 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mobile project summary */}
          <div className="lg:hidden bg-slate-900 rounded-2xl p-4 h-20 animate-pulse" />

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="h-7 w-14 bg-slate-200 rounded mb-1 animate-pulse" />
                <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
                {i < 2 && <div className="h-1 bg-slate-100 rounded-full mt-3 animate-pulse" />}
                <div className="h-2.5 w-16 bg-slate-50 rounded mt-2 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-slate-100 rounded-lg animate-pulse" />
                </div>
                <div className="p-5">
                  <div className="flex justify-between mb-8">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                        <div className="mt-2.5 h-2.5 w-8 bg-slate-100 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                </div>
              </div>

              {/* Files Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-14 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse" />
                </div>
                <div className="p-5">
                  <div className="flex gap-3 mb-4">
                    <div className="h-9 flex-1 max-w-xs bg-slate-50 rounded-xl animate-pulse" />
                    <div className="h-9 w-48 bg-slate-50 rounded-xl animate-pulse" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-4">
                        <div className="w-11 h-11 bg-slate-100 rounded-xl mb-3 animate-pulse" />
                        <div className="h-3.5 w-full bg-slate-100 rounded mb-1 animate-pulse" />
                        <div className="h-2.5 w-20 bg-slate-50 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse" />
                </div>
                <div className="p-3 space-y-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
                        <div className="h-2.5 w-28 bg-slate-50 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="p-5 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-full bg-slate-100 rounded animate-pulse" />
                        <div className="h-2.5 w-16 bg-slate-50 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Teaser */}
              <div className="bg-slate-900 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-4 w-12 bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-5 w-28 bg-slate-800 rounded mb-1.5 animate-pulse" />
                <div className="h-3.5 w-full bg-slate-800 rounded mb-4 animate-pulse" />
                <div className="h-10 w-full bg-slate-800 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-slate-200 h-16 flex items-center justify-around px-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 bg-slate-100 rounded animate-pulse" />
            <div className="w-8 h-2 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
