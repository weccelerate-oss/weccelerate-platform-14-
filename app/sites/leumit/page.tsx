import { Users, FileText, BarChart3 } from 'lucide-react';

export default function LeumitHomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome to Leumit Portal
        </h1>
        <p className="text-slate-600 mb-8">
          Access your partner dashboard, resources, and collaboration tools.
        </p>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-teal-200 hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 text-teal-600 mb-4" />
            <h3 className="font-semibold text-slate-900 mb-1">Team</h3>
            <p className="text-sm text-slate-600">Manage your team members</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-teal-200 hover:shadow-md transition-shadow">
            <FileText className="w-8 h-8 text-teal-600 mb-4" />
            <h3 className="font-semibold text-slate-900 mb-1">Documents</h3>
            <p className="text-sm text-slate-600">Access shared resources</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-teal-200 hover:shadow-md transition-shadow">
            <BarChart3 className="w-8 h-8 text-teal-600 mb-4" />
            <h3 className="font-semibold text-slate-900 mb-1">Reports</h3>
            <p className="text-sm text-slate-600">View analytics and reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}
