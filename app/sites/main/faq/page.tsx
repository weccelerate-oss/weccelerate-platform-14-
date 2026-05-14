import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  FAQ_CATALOG,
  FAQ_INTENTS,
  type FaqIntent,
} from '@/lib/seo/faq-catalog';

export const revalidate = 86400;

export const metadata: Metadata = constructMetadata({
  title: 'שאלות נפוצות | WeCcelerate — הכל על Venture Builder, MedTech, גיוס הון ופיתוח',
  description:
    'מעל 50 תשובות מקיפות על WeCcelerate: מה זה Venture Builder, כמה עולה לפתח אפליקציה, איך עוברים ועדת הלסינקי, תהליך FDA 510(k) ו-CE, השוואה מול אקסלרטורים אחרים ועוד.',
  keywords: [
    'שאלות נפוצות סטארטאפים',
    'Venture Builder FAQ',
    'כמה עולה MVP',
    'איך מגייסים הון',
    'ועדת הלסינקי',
    'FDA 510k מדריך',
    'CE marking מדריך',
    'השוואת אקסלרטורים ישראל',
    'WeCcelerate FAQ',
  ],
  path: '/faq',
  locale: 'he',
});

function buildFaqPageSchema(locale: 'he' | 'en' = 'he') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_CONFIG.url}/faq#faqpage`,
    inLanguage: locale === 'he' ? 'he-IL' : 'en-US',
    mainEntity: FAQ_CATALOG.map((faq, index) => ({
      '@type': 'Question',
      '@id': `${SITE_CONFIG.url}/faq#${faq.id}`,
      position: index + 1,
      name: faq.question[locale],
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer[locale],
        inLanguage: locale === 'he' ? 'he-IL' : 'en-US',
        author: { '@id': `${SITE_CONFIG.url}/#organization` },
      },
    })),
  };
}

export default function FaqPage() {
  const schema = buildFaqPageSchema('he');

  const grouped = (Object.keys(FAQ_INTENTS) as FaqIntent[]).map((intent) => ({
    intent,
    label: FAQ_INTENTS[intent],
    items: FAQ_CATALOG.filter((f) => f.intent === intent),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="min-h-screen bg-white" id="main-content">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16" dir="rtl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">שאלות נפוצות</span>
          </nav>

          <header className="mb-10">
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">שאלות נפוצות</h1>
            <p
              data-speakable
              className="max-w-3xl text-lg leading-relaxed text-slate-700"
            >
              WeCcelerate היא — Venture Builder ומאיץ סטארטאפים בישראל, פועלת מתל אביב וירושלים
              משנת 2016 ומעניקה ליווי מעטפת 360° מרעיון ועד סטארט-אפ עולמי. מתחת — {FAQ_CATALOG.length} תשובות
              מקיפות לשאלות הנפוצות ביותר: מחירים, זמנים, רגולציה רפואית, גיוס הון והשוואה לאקסלרטורים
              אחרים בישראל.
            </p>
          </header>

          <nav aria-label="FAQ sections" className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              מעבר מהיר
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {grouped.map(({ intent, label, items }) => (
                <li key={intent}>
                  <a
                    href={`#${intent}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-700 transition hover:bg-white hover:text-blue-700"
                  >
                    <span>{label.he}</span>
                    <span className="text-xs text-slate-400">{items.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12">
            {grouped.map(({ intent, label, items }) => (
              <section key={intent} id={intent} className="scroll-mt-24">
                <h2 className="mb-6 border-b border-slate-200 pb-2 text-2xl font-bold text-slate-900">
                  {label.he}
                </h2>
                <div className="space-y-4">
                  {items.map((faq) => (
                    <details
                      key={faq.id}
                      id={faq.id}
                      className="group rounded-xl border border-slate-200 bg-white p-5 open:border-blue-400 open:shadow-sm"
                    >
                      <summary className="flex cursor-pointer items-start justify-between gap-3 text-lg font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                        <span>{faq.question.he}</span>
                        <span
                          aria-hidden="true"
                          className="flex-shrink-0 text-slate-400 transition group-open:rotate-180"
                        >
                          ⌄
                        </span>
                      </summary>
                      <div className="mt-4 leading-relaxed text-slate-700">{faq.answer.he}</div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-16 rounded-2xl bg-slate-900 p-8 text-center text-white">
            <h2 className="mb-3 text-2xl font-bold">לא מצאתם תשובה?</h2>
            <p className="mb-6 text-slate-300">
              צרו קשר ונחזור אליכם תוך 48 שעות לפגישת הכרות ראשונה ללא עלות.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-lg bg-white px-6 py-3 text-slate-900 font-semibold transition hover:bg-slate-100"
            >
              יצירת קשר →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
