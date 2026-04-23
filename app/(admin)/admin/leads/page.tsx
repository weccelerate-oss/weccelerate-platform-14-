import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mail, Phone, Building2, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'לידים | מערכת ניהול WeCcelerate',
  description: 'כל הלידים מטפסי יצירת קשר באתר',
};

export const dynamic = 'force-dynamic';

const SITE_LABELS: Record<string, string> = {
  main: 'אתר ראשי',
  leumit: 'Leumit MedTech',
  biz: 'Business',
  landing: 'קמפיין',
};

const SITE_STYLES: Record<string, string> = {
  main: 'bg-blue-50 text-blue-700 border-blue-200',
  leumit: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  biz: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  landing: 'bg-amber-50 text-amber-700 border-amber-200',
};

interface Lead {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  site: string;
  page: string;
  action: string;
}

async function getLeads(): Promise<Lead[]> {
  try {
    const { prisma } = await import('@/lib/db');

    const logs = await prisma.activityLog.findMany({
      where: {
        action: { in: ['form.contact_submit', 'lead.contact_fallback', 'form.contact'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: { id: true, action: true, createdAt: true, metadata: true },
    });

    return logs.map((log) => {
      const meta = (log.metadata as Record<string, unknown>) || {};
      return {
        id: log.id,
        createdAt: log.createdAt,
        name: (meta.name as string) || '—',
        email: (meta.email as string) || '—',
        phone: (meta.phone as string) || null,
        company: (meta.company as string) || null,
        message: (meta.message as string) || null,
        site: (meta.site as string) || 'main',
        page: (meta.page as string) || '/',
        action: log.action,
      };
    });
  } catch (error) {
    console.error('[Admin Leads]', error);
    return [];
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-8 py-4 sm:py-6 pt-14 lg:pt-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin"
              className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה לדשבורד
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            לידים מהאתר
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            כל פניות טפסי יצירת הקשר מכל תתי-האתרים ({leads.length})
          </p>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        {leads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">אין עדיין לידים. פניות מטפסי יצירת קשר באתר יופיעו כאן.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">שם</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">אימייל</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">טלפון</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">חברה</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">מקור</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">דף</th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 uppercase">תאריך</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => {
                    const siteLabel = SITE_LABELS[lead.site] || lead.site;
                    const siteStyle = SITE_STYLES[lead.site] || 'bg-slate-50 text-slate-700 border-slate-200';
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                          {lead.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.email !== '—' ? (
                            <a href={`mailto:${lead.email}`} className="hover:text-blue-600 inline-flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {lead.email}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.phone ? (
                            <a href={`tel:${lead.phone}`} className="hover:text-blue-600 inline-flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {lead.phone}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.company ? (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {lead.company}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded ${siteStyle}`}>
                            <Globe className="w-3 h-3" />
                            {siteLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono text-xs">
                          {lead.page}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
