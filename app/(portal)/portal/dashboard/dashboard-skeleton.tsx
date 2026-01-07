/**
 * Dashboard Skeleton Component
 * 
 * Loading skeleton for the dashboard while data is being fetched.
 * Matches the layout of the actual dashboard for smooth transition.
 */

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      {/* Sidebar Skeleton */}
      <aside className="fixed right-0 top-0 h-screen w-[280px] bg-slate-900 z-40">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Nav items */}
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-[280px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
              <div className="w-32 h-10 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="w-4 h-4 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-20 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse" />
                        <div className="mt-2 h-3 w-10 bg-slate-100 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Files Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl mb-3 animate-pulse" />
                        <div className="h-4 w-full bg-slate-200 rounded mb-2 animate-pulse" />
                        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="h-6 w-32 bg-slate-200 rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="h-6 w-28 bg-slate-200 rounded mb-4 animate-pulse" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-slate-50 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardSkeleton;
