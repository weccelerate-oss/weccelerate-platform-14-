'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// COMPARISONS PAGE CONTENT — client component (i18n)
// =============================================================================

interface Competitor {
  id: string;
  name: string;
  type: 'accelerator' | 'incubator' | 'community' | 'venture-builder';
  url?: string;
}

const COMPETITORS: Competitor[] = [
  {
    id: '8200-eisp',
    name: '8200 EISP',
    type: 'accelerator',
    url: 'https://www.startau.tau.ac.il/programs/8200-entrepreneurship-and-innovation-support-program',
  },
  {
    id: 'the-junction',
    name: 'The Junction (F2 Capital)',
    type: 'accelerator',
    url: 'https://www.thejunction.tech',
  },
  {
    id: 'masschallenge-israel',
    name: 'MassChallenge Israel',
    type: 'accelerator',
    url: 'https://masschallenge.org/programs/israel',
  },
  {
    id: 'google-startups',
    name: 'Google for Startups Campus Tel Aviv',
    type: 'community',
    url: 'https://startup.google.com/campus/tel-aviv',
  },
  {
    id: 'techstars-tel-aviv',
    name: 'Techstars Tel Aviv',
    type: 'accelerator',
    url: 'https://www.techstars.com/accelerators/tel-aviv',
  },
  {
    id: 'pitango-first',
    name: 'Pitango First',
    type: 'accelerator',
    url: 'https://www.pitango.com',
  },
];

// Head-to-head field keys (label + WeCcelerate value share the same suffix).
const HEAD_TO_HEAD_FIELDS = [
  'model',
  'equity',
  'duration',
  'focus',
  'medicalData',
  'operationalTeam',
  'investorNetwork',
  'relationshipAfter',
] as const;

export default function ComparisonsContent() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white" id="main-content">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">{t('comparisons.breadcrumb.home')}</Link>
          <span className="mx-2">›</span>
          <span aria-current="page" className="text-slate-900">{t('comparisons.breadcrumb.current')}</span>
        </nav>

        <header className="mb-10">
          <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
            {t('comparisons.hero.title')}
          </h1>
          <p data-speakable className="max-w-3xl text-lg leading-relaxed text-slate-700">
            {t('comparisons.hero.intro').replace('{count}', String(COMPETITORS.length))}
          </p>
        </header>

        {/* WeCcelerate at a glance */}
        <section className="mb-12 rounded-2xl border-2 border-blue-300 bg-blue-50 p-6 md:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              WeCcelerate
            </span>
            <span className="text-sm text-blue-900">{t('comparisons.glance.badge')}</span>
          </div>
          <dl className="grid gap-4 md:grid-cols-2">
            {HEAD_TO_HEAD_FIELDS.map((field) => (
              <div key={field}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {t(`comparisons.field.${field}`)}
                </dt>
                <dd className="mt-1 text-slate-900">{t(`comparisons.weccelerate.${field}`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Competitor sections */}
        <div className="space-y-10">
          {COMPETITORS.map((c) => (
            <section
              key={c.id}
              id={c.id}
              className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  WeCcelerate vs <span className="text-slate-700">{c.name}</span>
                </h2>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    {t('comparisons.card.officialSite')}
                  </a>
                )}
              </div>

              <p className="mb-5 leading-relaxed text-slate-700">{t(`comparisons.${c.id}.what`)}</p>

              <dl className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">{t('comparisons.card.equity')}</dt>
                  <dd className="mt-0.5 text-slate-900">{t(`comparisons.${c.id}.equity`)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">{t('comparisons.card.duration')}</dt>
                  <dd className="mt-0.5 text-slate-900">{t(`comparisons.${c.id}.duration`)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">{t('comparisons.card.type')}</dt>
                  <dd className="mt-0.5 text-slate-900">
                    {t(`comparisons.type.${c.type}`)}
                  </dd>
                </div>
              </dl>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                    {t('comparisons.card.theirStrength')}
                  </h3>
                  <p className="text-sm text-slate-700">{t(`comparisons.${c.id}.strength`)}</p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-700">
                    {t('comparisons.card.weccelerateStrength')}
                  </h3>
                  <p className="text-sm text-slate-800">{t(`comparisons.${c.id}.advantage`)}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Decision helper */}
        <section className="mt-16 rounded-2xl bg-slate-900 p-8 text-white">
          <h2 className="mb-4 text-2xl font-bold">{t('comparisons.decision.title')}</h2>
          <ul className="space-y-3 text-slate-200">
            <li>
              <strong className="text-white">{t('comparisons.decision.noTeam.q')}</strong> → {t('comparisons.decision.noTeam.a')}
            </li>
            <li>
              <strong className="text-white">{t('comparisons.decision.cyber.q')}</strong> → {t('comparisons.decision.cyber.a')}
            </li>
            <li>
              <strong className="text-white">{t('comparisons.decision.b2b.q')}</strong> → {t('comparisons.decision.b2b.a')}
            </li>
            <li>
              <strong className="text-white">{t('comparisons.decision.medical.q')}</strong> → {t('comparisons.decision.medical.a')}
            </li>
            <li>
              <strong className="text-white">{t('comparisons.decision.undecided.q')}</strong> → {t('comparisons.decision.undecided.a')}
            </li>
          </ul>
        </section>

        <section className="mt-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold md:text-3xl">{t('comparisons.cta.title')}</h2>
          <p className="mb-6 text-lg opacity-90">
            {t('comparisons.cta.text')}
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            {t('comparisons.cta.button')}
          </Link>
        </section>
      </div>
    </main>
  );
}
