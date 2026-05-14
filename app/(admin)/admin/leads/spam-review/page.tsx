import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { ReviewRow } from './ReviewRow';
import { BlocklistTable } from './BlocklistTable';

export const metadata: Metadata = {
  title: 'תור סקירת ספאם · WeCcelerate',
};
export const dynamic = 'force-dynamic';

interface ReviewLead {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  site: string;
  spamScore: number;
  spamReasons: string[];
  spamCodes: string[];
}

async function getReviewQueue(): Promise<ReviewLead[]> {
  try {
    const rows = await prisma.activityLog.findMany({
      where: { action: 'lead.spam_review' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, createdAt: true, metadata: true },
    });
    return rows.map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = (r.metadata as any) ?? {};
      return {
        id: r.id,
        createdAt: r.createdAt,
        name: m.name ?? '—',
        email: m.email ?? '—',
        phone: m.phone ?? null,
        company: m.company ?? null,
        message: m.message ?? null,
        site: m.site ?? 'main',
        spamScore: typeof m.spamScore === 'number' ? m.spamScore : 0,
        spamReasons: Array.isArray(m.spamReasons) ? m.spamReasons : [],
        spamCodes: Array.isArray(m.spamCodes) ? m.spamCodes : [],
      };
    });
  } catch {
    return [];
  }
}

interface BlockedRow {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
  spamScore: number;
  spamReasons: string[];
}

async function getRecentDrops(): Promise<BlockedRow[]> {
  try {
    const rows = await prisma.activityLog.findMany({
      where: { action: { in: ['lead.spam_blocked', 'lead.rate_limited', 'lead.blocklist_hit'] } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, createdAt: true, metadata: true, action: true },
    });
    return rows.map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = (r.metadata as any) ?? {};
      return {
        id: r.id,
        createdAt: r.createdAt,
        name: m.name ?? '—',
        email: m.email ?? '—',
        spamScore: typeof m.spamScore === 'number' ? m.spamScore : 100,
        spamReasons: Array.isArray(m.spamReasons) ? m.spamReasons : (m.detail ? [m.detail] : []),
      };
    });
  } catch {
    return [];
  }
}

async function getBlocklist() {
  try {
    return await prisma.spamBlocklist.findMany({
      orderBy: { addedAt: 'desc' },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function SpamReviewPage() {
  const [queue, drops, blocklist] = await Promise.all([
    getReviewQueue(),
    getRecentDrops(),
    getBlocklist(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-8 py-4 sm:py-6 pt-14 lg:pt-6">
          <Link href="/admin/leads" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
            <ArrowRight className="w-4 h-4" />
            חזרה לרשימת לידים
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">תור סקירת ספאם</h1>
          <p className="text-sm text-slate-500 mt-1">
            לידים שזכו לציון 31-60 והמתינו לסקירה. אישור = ישלח ל-Zapier בדיעבד.
          </p>
        </div>
      </header>

      <main className="p-4 sm:p-8 space-y-8">
        {/* QUEUE */}
        <section>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-lg font-bold text-slate-900">בתור לסקירה</h2>
            <span className="text-xs text-slate-500">{queue.length} ממתינים</span>
          </div>
          {queue.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-500">אין לידים בהמתנה. הכול נכנס דרך ה-filter רגיל.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((lead) => (
                <ReviewRow key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </section>

        {/* RECENT DROPS — full audit */}
        <section>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-lg font-bold text-slate-900">לידים שנחסמו אוטומטית</h2>
            <span className="text-xs text-slate-500">30 אחרונים</span>
          </div>
          {drops.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
              <p className="text-sm text-slate-500">אין דחיות אוטומטיות לאחרונה.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">זמן</th>
                    <th className="px-3 py-2 font-medium">שם</th>
                    <th className="px-3 py-2 font-medium">אימייל</th>
                    <th className="px-3 py-2 font-medium">Score</th>
                    <th className="px-3 py-2 font-medium">סיבות</th>
                  </tr>
                </thead>
                <tbody>
                  {drops.map((d) => (
                    <tr key={d.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-500">
                        {new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d.createdAt)}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{d.name}</td>
                      <td className="px-3 py-2 text-slate-500 font-mono">{d.email}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">{d.spamScore}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {d.spamReasons.slice(0, 2).map((r, i) => (
                          <div key={i}>· {r}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* BLOCKLIST */}
        <section>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-lg font-bold text-slate-900">Blocklist קבוע</h2>
            <span className="text-xs text-slate-500">{blocklist.length} רשומים</span>
          </div>
          {blocklist.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
              <p className="text-sm text-slate-500">אין ברשומה. מסומן כספאם דרך "סמן כספאם" — יתווסף כאן.</p>
            </div>
          ) : (
            <BlocklistTable rows={blocklist.map((b) => ({
              id: b.id,
              email: b.email,
              ipHash: b.ipHash,
              reason: b.reason,
              addedAt: b.addedAt.toISOString(),
              expiresAt: b.expiresAt?.toISOString() ?? null,
            }))} />
          )}
        </section>
      </main>
    </div>
  );
}
