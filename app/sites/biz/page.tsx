import { LayoutDashboard, Wallet, Users2, Settings } from 'lucide-react';

export default function BizHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Welcome to your business operations center.</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">Revenue</span>
            <Wallet className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₪0</p>
          <span className="text-xs text-slate-500">This month</span>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">Clients</span>
            <Users2 className="w-5 h-5 text-royal-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <span className="text-xs text-slate-500">Active</span>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">Projects</span>
            <LayoutDashboard className="w-5 h-5 text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <span className="text-xs text-slate-500">In progress</span>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 text-sm">Tasks</span>
            <Settings className="w-5 h-5 text-gold-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <span className="text-xs text-slate-500">Pending</span>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Dashboard content will be implemented here.</p>
      </div>
    </div>
  );
}
