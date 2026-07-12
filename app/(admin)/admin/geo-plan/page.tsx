/**
 * /admin/geo-plan
 *
 * The single page that explains the entire autonomous SEO/GEO/AEO system,
 * shows live status of every component, and tells the operator exactly
 * which env vars / one-time commands are still missing.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'תוכנית GEO/AEO | מערכת ניהול WeCcelerate',
  description: 'התוכנית האוטונומית לדומיננטיות ב-SEO + GEO + AEO',
};

export const dynamic = 'force-dynamic';

interface Health {
  geoProbeInstalled: boolean;
  contentGapsInstalled: boolean;
  generatedGuidesInstalled: boolean;
  totalProbes: number;
  totalGaps: number;
  openGaps: number;
  publishedGuides: number;
  recentRuns: Array<{ ts: string; event: string; detail: string }>;
}

interface GapPreview {
  detectedAt: Date;
  query: string;
  severity: number;
}

interface GuidePreview {
  publishedAt: Date | null;
  createdAt: Date;
  titleHe: string;
  slug: string;
}

async function getHealth(): Promise<Health> {
  // Each call is independently try/catch'd because the geo_probes,
  // content_gaps, generated_guides tables may not all exist yet (the user
  // hasn't run db:push for the new schema). We surface that to the UI
  // rather than 500-ing.
  const safeNum = async (p: Promise<number>): Promise<number> => {
    try { return await p; } catch { return -1; }
  };
  const safeGap = async (): Promise<GapPreview | null> => {
    try {
      const r = await prisma.contentGap.findFirst({ orderBy: { detectedAt: 'desc' } });
      return r ? { detectedAt: r.detectedAt, query: r.query, severity: r.severity } : null;
    } catch { return null; }
  };
  const safeGuide = async (): Promise<GuidePreview | null> => {
    try {
      const r = await prisma.generatedGuide.findFirst({ orderBy: { publishedAt: 'desc' } });
      return r ? {
        publishedAt: r.publishedAt,
        createdAt: r.createdAt,
        titleHe: r.titleHe,
        slug: r.slug,
      } : null;
    } catch { return null; }
  };

  const [totalProbes, totalGaps, openGaps, publishedGuides, recentGap, recentGuide] = await Promise.all([
    safeNum(prisma.geoProbe.count()),
    safeNum(prisma.contentGap.count()),
    safeNum(prisma.contentGap.count({ where: { status: 'open' } })),
    safeNum(prisma.generatedGuide.count({ where: { status: 'published' } })),
    safeGap(),
    safeGuide(),
  ]);

  const recentRuns: Array<{ ts: string; event: string; detail: string }> = [];
  if (recentGap) {
    recentRuns.push({
      ts: recentGap.detectedAt.toISOString(),
      event: 'gap-detected',
      detail: `${recentGap.query} (severity ${recentGap.severity})`,
    });
  }
  if (recentGuide) {
    recentRuns.push({
      ts: (recentGuide.publishedAt ?? recentGuide.createdAt).toISOString(),
      event: 'guide-published',
      detail: `${recentGuide.titleHe} → /guides/${recentGuide.slug}`,
    });
  }
  recentRuns.sort((a, b) => (a.ts < b.ts ? 1 : -1));

  return {
    geoProbeInstalled: totalProbes >= 0,
    contentGapsInstalled: totalGaps >= 0,
    generatedGuidesInstalled: publishedGuides >= 0,
    totalProbes: Math.max(0, totalProbes),
    totalGaps: Math.max(0, totalGaps),
    openGaps: Math.max(0, openGaps),
    publishedGuides: Math.max(0, publishedGuides),
    recentRuns,
  };
}

interface TrendPoint {
  date: string;
  geoScore: number;
  citedRate: number;
  mentionedRate: number;
  probesInWindow: number;
}

async function getGeoTrend(): Promise<TrendPoint[]> {
  // Safe against a not-yet-migrated table, like the health counters above.
  try {
    const rows = await prisma.geoDailySnapshot.findMany({
      orderBy: { date: 'asc' },
      take: 90,
      select: { date: true, geoScore: true, citedRate: true, mentionedRate: true, probesInWindow: true },
    });
    type SnapshotRow = { date: Date; geoScore: number; citedRate: number; mentionedRate: number; probesInWindow: number };
    return rows.map((r: SnapshotRow) => ({
      date: r.date.toISOString().slice(0, 10),
      geoScore: r.geoScore,
      citedRate: r.citedRate,
      mentionedRate: r.mentionedRate,
      probesInWindow: r.probesInWindow,
    }));
  } catch { return []; }
}

/**
 * Server-rendered SVG line chart — no client JS, no chart lib. GEO score is
 * the bold line; cited rate is the thin one under it.
 */
function GeoTrendChart({ points }: { points: TrendPoint[] }) {
  const W = 860;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 28, left: 34 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (i: number) =>
    PAD.left + (points.length === 1 ? innerW / 2 : (i * innerW) / (points.length - 1));
  const y = (v: number) => PAD.top + innerH - (v / 100) * innerH;
  const line = (get: (p: TrendPoint) => number) =>
    points.map((p, i) => `${x(i).toFixed(1)},${y(get(p)).toFixed(1)}`).join(' ');

  const last = points[points.length - 1];
  const gridLines = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="מדד GEO לאורך זמן">
      {gridLines.map((v) => (
        <g key={v}>
          <line x1={PAD.left} y1={y(v)} x2={W - PAD.right} y2={y(v)} stroke="#e2e8f0" strokeWidth={v === 0 ? 1.5 : 0.75} />
          <text x={PAD.left - 8} y={y(v) + 4} fontSize={11} fill="#94a3b8" textAnchor="end">{v}</text>
        </g>
      ))}
      <polyline fill="none" stroke="#c4b5fd" strokeWidth={1.5} strokeDasharray="4 3" points={line((p) => p.citedRate)} />
      <polyline fill="none" stroke="#7c3aed" strokeWidth={2.5} strokeLinecap="round" points={line((p) => p.geoScore)} />
      <circle cx={x(points.length - 1)} cy={y(last.geoScore)} r={4} fill="#7c3aed" />
      <text x={x(points.length - 1)} y={y(last.geoScore) - 10} fontSize={13} fontWeight="bold" fill="#7c3aed" textAnchor="middle">
        {last.geoScore}
      </text>
      <text x={PAD.left} y={H - 8} fontSize={11} fill="#94a3b8">{points[0].date}</text>
      <text x={W - PAD.right} y={H - 8} fontSize={11} fill="#94a3b8" textAnchor="end">{last.date}</text>
    </svg>
  );
}

const STATUS_PILL = {
  ok: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warn: 'bg-amber-100 text-amber-800 border-amber-200',
  bad: 'bg-rose-100 text-rose-800 border-rose-200',
} as const;

function Pill({ kind, children }: { kind: keyof typeof STATUS_PILL; children: React.ReactNode }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[kind]}`}>
      {children}
    </span>
  );
}

export default async function GeoPlanPage() {
  const [h, trend] = await Promise.all([getHealth(), getGeoTrend()]);
  const allTablesOk = h.geoProbeInstalled && h.contentGapsInstalled && h.generatedGuidesInstalled;

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">תוכנית GEO/AEO — אוטומציה מלאה</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          מערכת אוטונומית שמודדת איך ChatGPT/Perplexity/Claude תופסים את WeCcelerate, מזהה פערים ב-citations, וכותבת מאמרים יומיומיים שסוגרים אותם — בלי התערבות.
        </p>
      </header>

      {/* ============================================================== */}
      {/* LIVE HEALTH                                                     */}
      {/* ============================================================== */}
      <section className="mb-10 rounded-xl border-2 border-slate-300 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900">🩺 בריאות המערכת — חי</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HealthCard
            label="geo_probes"
            value={h.totalProbes}
            installed={h.geoProbeInstalled}
            sublabel="בדיקות LLM שבוצעו"
          />
          <HealthCard
            label="content_gaps"
            value={h.totalGaps}
            installed={h.contentGapsInstalled}
            sublabel={`פתוחים: ${h.openGaps}`}
          />
          <HealthCard
            label="published guides"
            value={h.publishedGuides}
            installed={h.generatedGuidesInstalled}
            sublabel="מאמרים שהאייג'נט פרסם"
          />
          <HealthCard
            label="DB schema"
            value={allTablesOk ? '✅' : '⚠️'}
            installed
            sublabel={allTablesOk ? 'כל 3 הטבלאות מותקנות' : 'הרץ npm run db:push'}
          />
        </div>

        {!allTablesOk && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            ⚠️ אחת או יותר מטבלאות ה-agent עדיין לא קיימות ב-DB. הרץ <code className="rounded bg-amber-100 px-1">npm run db:push</code> בטרמינל המקומי כדי להחיל את הסכמה.
          </div>
        )}

        {h.recentRuns.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">פעילות אחרונה</div>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50">
              {h.recentRuns.map((r, i) => (
                <li key={i} className="px-3 py-2 text-sm">
                  <code className="me-2 rounded bg-white px-1.5 py-0.5 text-xs text-slate-600">{r.event}</code>
                  <span className="text-slate-700">{r.detail}</span>
                  <span className="ms-2 text-xs text-slate-500">
                    {new Date(r.ts).toLocaleString('he-IL')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* GEO TREND — the day-over-day improvement graph                  */}
      {/* ============================================================== */}
      <section className="mb-10 rounded-xl border-2 border-slate-300 bg-white p-6">
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-slate-900">📈 מדד GEO — מגמה יומית</h2>
          {trend.length > 0 && (
            <span className="text-sm text-slate-500">
              היום: <strong className="text-violet-700">{trend[trend.length - 1].geoScore}</strong>/100
              {' · '}שיעור ציטוט {trend[trend.length - 1].citedRate}%
              {' · '}מדגם {trend[trend.length - 1].probesInWindow} בדיקות (14 יום)
            </span>
          )}
        </div>
        <p className="mb-4 text-xs text-slate-500">
          קו עבה = מדד GEO משוקלל (60% ציטוט · 25% אזכור · 15% מיקום) על חלון מגולגל של 14 יום. קו מקווקו = שיעור ציטוט. נקודה אחת נכתבת כל בוקר בריצת דוד.
        </p>
        {trend.length >= 2 ? (
          <GeoTrendChart points={trend} />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            עדיין אין מספיק נקודות מדידה — הגרף יתחיל להצטייר אחרי יומיים של ריצות בוקר (טבלת geo_daily_snapshots דורשת <code className="rounded bg-slate-100 px-1">npm run db:push</code>).
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 3. THE LOOP                                                     */}
      {/* ============================================================== */}
      <section className="mb-10 rounded-xl border-2 border-violet-200 bg-violet-50/40 p-6">
        <h2 className="mb-4 text-xl font-bold text-violet-900">🔄 הלולאה היומית האוטונומית</h2>
        <p className="mb-5 text-sm text-violet-900">
          כל בוקר רצים 3 cron jobs ב-Vercel ברצף. בלי התערבות ידנית. כל יום עוד מאמר אוטומטי שסוגר פער.
        </p>

        <ol className="space-y-3">
          {[
            {
              time: '06:00 UTC',
              path: '/api/cron/geo-probe',
              what: 'GEO Probe — שואל את 3 ה-LLMs (Anthropic + OpenAI + Perplexity לפי מה שמוגדר) 8 שאילתות אסטרטגיות, שומר תשובות + citations',
              writes: 'geo_probes',
            },
            {
              time: '06:30 UTC',
              path: '/api/cron/gap-analyze',
              what: 'Gap Analyzer — אוסף 14 ימי probes, פותח ContentGap לכל שאילתה עם <60% citation, סוגר gaps שכבר עברו',
              writes: 'content_gaps',
            },
            {
              time: '07:00 UTC',
              path: '/api/cron/content-publish',
              what: 'Content Writer — לוקח את הפער עם severity הכי גבוה, עושה research (web_search), כותב 1800-2500 מילים בעברית, fact-check, ופרסום ל-/guides/[slug]. דוחף ל-IndexNow.',
              writes: 'generated_guides + IndexNow ping',
            },
          ].map((step, i) => (
            <li key={i} className="rounded-lg border border-violet-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-900">
                  {step.time}
                </span>
                <code className="font-mono text-xs text-slate-700">{step.path}</code>
              </div>
              <p className="mt-2 text-sm text-slate-700">{step.what}</p>
              <div className="mt-1 text-xs text-slate-500">
                כותב ל: <code className="rounded bg-slate-100 px-1">{step.writes}</code>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============================================================== */}
      {/* WHAT'S BUILT vs ROADMAP                                         */}
      {/* ============================================================== */}
      <section className="mb-10 rounded-xl border-2 border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900">🗺️ Roadmap — מה נבנה ומה הבא</h2>

        <div className="space-y-4">
          {[
            {
              phase: 'Phase 1 — תשתית מדידה (Sense)',
              status: 'ok' as const,
              items: [
                'GEO Probe — 3 LLMs × 8 queries יומי',
                'BotVisit tracker — מי סורק את האתר (passive)',
                'Bot Analytics dashboard — Stage 0-3 indicator',
                'IndexNow — push יומי ל-Bing',
              ],
            },
            {
              phase: 'Phase 2 — ניתוח (Analyze)',
              status: 'ok' as const,
              items: [
                'Gap Analyzer — מזהה queries שלא מצוטטים',
                'ContentGap pipeline עם severity scoring',
                'Competitor extraction — מי כן מצוטט',
              ],
            },
            {
              phase: 'Phase 3 — כתיבה אוטומטית (Create)',
              status: 'ok' as const,
              items: [
                'Multi-stage writer (research → outline → write → fact-check)',
                'Anthropic Claude Opus 4.7 ל-content',
                'Internal linker — קישורים אוטומטיים ל-guides קיימים',
                'SEO linter — title/meta/FAQ validation',
              ],
            },
            {
              phase: 'Phase 4 — פרסום (Publish)',
              status: 'ok' as const,
              items: [
                'Auto-publish ל-/guides/[slug]',
                'Article + FAQ + Breadcrumb schema',
                'IndexNow push לכל פרסום חדש',
              ],
            },
            {
              phase: 'Phase 5 — מדידה חוזרת (Re-Measure)',
              status: 'warn' as const,
              items: [
                'GEO Probe חוזר ובודק אם המאמר מתחיל להיות מצוטט',
                'Email alert על first-time citations (כבר קיים)',
                '⏳ אחרי-publish tracking של citation lift (לבנייה)',
              ],
            },
            {
              phase: 'Phase 6 — הגברה (Amplify) — לבנייה',
              status: 'bad' as const,
              items: [
                'LinkedIn auto-drafts — כל מאמר → פוסט אישי לאלון/הינוך/סבג',
                'Twitter thread generator + scheduler',
                'YouTube Shorts (script + ElevenLabs voice)',
                'Newsletter weekly digest auto',
                'Reddit/Quora answer queue (manual approval)',
              ],
            },
            {
              phase: 'Phase 7 — Authority (לטווח ארוך)',
              status: 'bad' as const,
              items: [
                'Featured images אוטומטיות (DALL-E 3)',
                'Wikipedia entity creation (agent-assisted)',
                'Original research reports (quarterly Israeli MedTech data)',
                'Press release distribution automation',
                'Competitor LLM Probe — לבדוק את המתחרים',
              ],
            },
          ].map((p, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-3">
                <Pill kind={p.status}>
                  {p.status === 'ok' ? '✅ פעיל' : p.status === 'warn' ? '⚠️ חלקי' : '⏳ לבנייה'}
                </Pill>
                <h3 className="font-semibold text-slate-900">{p.phase}</h3>
              </div>
              <ul className="list-disc space-y-1 pr-5 text-sm text-slate-700">
                {p.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. LINKS                                                        */}
      {/* ============================================================== */}
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-3 text-xl font-bold text-slate-900">🔗 קישורים שימושיים</h2>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <Link href="/admin/bot-analytics" className="rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50">
            <div className="font-semibold text-slate-900">Bot Analytics →</div>
            <div className="text-xs text-slate-600">מי מהבוטים מבקר באתר ומאיזה דפים</div>
          </Link>
          <Link href="/guides" className="rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50">
            <div className="font-semibold text-slate-900">/guides — כל המדריכים →</div>
            <div className="text-xs text-slate-600">מאמרים סטטיים + אוטומטיים יחד</div>
          </Link>
        </div>
      </section>
    </div>
  );
}

function HealthCard({
  label,
  value,
  installed,
  sublabel,
}: {
  label: string;
  value: number | string;
  installed: boolean;
  sublabel: string;
}) {
  return (
    <div className={`rounded-lg border p-4 ${installed ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-slate-900">
        {installed ? value : '—'}
      </div>
      <div className="mt-1 text-xs text-slate-500">
        {installed ? sublabel : 'טבלה חסרה — db:push'}
      </div>
    </div>
  );
}

