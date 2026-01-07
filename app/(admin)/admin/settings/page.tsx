/**
 * Site Settings Management Page
 * 
 * Admin interface for managing site-wide settings.
 */

import { Metadata } from 'next';
import { Settings, Globe, Bell, Shield, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'הגדרות | Admin',
  description: 'הגדרות מערכת',
};

async function getSettings() {
  try {
    const { prisma } = await import('@/lib/db');
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
    return settings;
  } catch (error) {
    console.warn('[Admin Settings] Database error:', error);
    return [];
  }
}

export default async function SettingsPage() {
  const settings = await getSettings();

  // Group settings by category
  const maintenanceMode = settings.find(s => s.key === 'site.maintenance_mode');
  const registrationOpen = settings.find(s => s.key === 'site.registration_open');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">הגדרות מערכת</h1>
          <p className="text-slate-500 mt-1">
            ניהול הגדרות האתר והמערכת
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-600" />
              <h2 className="font-semibold text-slate-900">הגדרות כלליות</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">מצב תחזוקה</h3>
                <p className="text-sm text-slate-500">כשמופעל, האתר מציג הודעת תחזוקה למבקרים</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                maintenanceMode?.value === 'true' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {maintenanceMode?.value === 'true' ? 'מופעל' : 'כבוי'}
              </div>
            </div>

            {/* Registration */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">הרשמת משתמשים</h3>
                <p className="text-sm text-slate-500">האם לאפשר הרשמה חדשה לאתר</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                registrationOpen?.value === 'true' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {registrationOpen?.value === 'true' ? 'פתוח' : 'סגור'}
              </div>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-600" />
              <h2 className="font-semibold text-slate-900">מידע על המערכת</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{settings.length}</p>
                <p className="text-sm text-slate-500">הגדרות</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">תקין</p>
                <p className="text-sm text-slate-500">חיבור DB</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">Prisma 7</p>
                <p className="text-sm text-slate-500">גרסת ORM</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">Next.js 16</p>
                <p className="text-sm text-slate-500">גרסת Framework</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Settings Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-600" />
              <h2 className="font-semibold text-slate-900">כל ההגדרות ({settings.length})</h2>
            </div>
          </div>
          {settings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">מפתח</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">ערך</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">תיאור</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settings.map((setting) => {
                    // Handle JSON values
                    const displayValue = typeof setting.value === 'object' 
                      ? JSON.stringify(setting.value, null, 2)
                      : String(setting.value);
                    
                    return (
                      <tr key={setting.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <code className="text-sm bg-slate-100 px-2 py-1 rounded">{setting.key}</code>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-900 whitespace-pre-wrap">{displayValue}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">{setting.description || '-'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">אין הגדרות</h3>
              <p className="text-slate-500">הרץ את seed script כדי ליצור הגדרות ברירת מחדל</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
