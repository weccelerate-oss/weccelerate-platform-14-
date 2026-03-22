import { AdminSidebar } from './components/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporary: skip auth check for debugging
  const mockUser = {
    name: 'Admin',
    email: 'admin@weccelerate.co.il',
    role: 'ADMIN',
  };

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      <div className="flex">
        <AdminSidebar user={mockUser} />
        <main className="flex-1 mr-0 lg:mr-64">
          {children}
        </main>
      </div>
    </div>
  );
}