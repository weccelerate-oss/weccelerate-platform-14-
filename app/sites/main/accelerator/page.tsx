import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { ServiceFaq } from '@/components/services/ServiceFaq';
import { LeadFormSection } from '@/components/forms/LeadFormSection';
import type { ServiceFaqItem } from '@/lib/services-faqs';

export const revalidate = 86400;

// =============================================================================
// /accelerator — category page for "אקסלרטור לסטארטאפים בישראל"
// =============================================================================
// Search Console (2026-10/11) showed the site ranking for informational
// queries through the guides but nearly absent from the category queries
// ("אקסלרטור", "אקסלרטורים בישראל", "מאיץ סטארטאפים") — the ones where an AI
// answer lists companies. This page is the one canonical answer to "what is an
// accelerator and what does WeCcelerate offer": a direct definition first,
// then a comparison table, then the services, each linking to its own page.
//
// House rule (owner, 2026-09-10): no prices, timelines, counts or promises
// about WeCcelerate. General statements about the category are fine.
// Hebrew-only by design (like the guides); the visible FAQ and the FAQPage
// JSON-LD are built from the same FAQS array.
// =============================================================================

const PATH = '/accelerator';
const URL = `${SITE_CONFIG.url}${PATH}`;
const TITLE = 'אקסלרטור לסטארטאפים בישראל';

export const metadata: Metadata = constructMetadata({
  title: 'אקסלרטור לסטארטאפים בישראל: מה זה ואיך בוחרים | WeCcelerate',
  description:
    'מה זה אקסלרטור לסטארטאפים, מה ההבדל בינו לבין חממה ו-Venture Builder, איך בוחרים מאיץ, ומה כולל הליווי של WeCcelerate ליזמים בישראל.',
  keywords: [
    'אקסלרטור לסטארטאפים',
    'אקסלרטור',
    'אקסלרטורים בישראל',
    'מאיץ סטארטאפים',
    'מאיץ ליזמים',
    'חממה טכנולוגית',
    'Venture Builder',
    'startup accelerator Israel',
  ],
  path: PATH,
  locale: 'he',
});

const MODELS = [
  {
    name: 'אקסלרטור (מאיץ)',
    what: 'תוכנית ליווי לתקופה מוגדרת, לרוב במחזורים של כמה מיזמים יחד.',
    gives: 'מנטורינג, סדנאות, חידוד המודל העסקי וחיבור למשקיעים.',
    fits: 'צוות שכבר יש לו רעיון מגובש או מוצר ראשוני, ורוצה להתקדם מהר.',
  },
  {
    name: 'חממה טכנולוגית',
    what: 'מסגרת ליווי ארוכה יותר למיזם בשלב מוקדם מאוד. בישראל פועלות חממות במסגרת תוכנית של רשות החדשנות.',
    gives: 'תשתית, ליווי צמוד, ולעיתים גם מימון ראשוני.',
    fits: 'מיזם טכנולוגי בתחילת הדרך, שצריך זמן ומשאבים כדי להוכיח היתכנות.',
  },
  {
    name: 'Venture Builder (בונה מיזמים)',
    what: 'גוף שבונה את המיזם יחד עם היזם, עם צוות שמבצע בפועל חלק מהעבודה.',
    gives: 'ביצוע ולא רק ייעוץ: פיתוח מוצר, שיווק, תכנון עסקי והכנה לגיוס.',
    fits: 'יזם שיש לו רעיון וידע בתחום, אבל חסרות לו יכולות ביצוע או צוות מלא.',
  },
];

const CRITERIA = [
  {
    title: 'התמחות בתחום שלכם',
    text: 'מאיץ שמכיר את התחום מביא מנטורים, שותפים ומשקיעים רלוונטיים. מיזם רפואי, למשל, צריך גישה לרופאים ולידע רגולטורי.',
  },
  {
    title: 'מה מקבלים בפועל',
    text: 'בדקו אם מדובר בליווי ובמנטורינג בלבד, או שיש גם צוות שמבצע עבודה: פיתוח, שיווק, תוכנית עסקית.',
  },
  {
    title: 'התנאים',
    text: 'בררו מראש מה נדרש מכם: תשלום, אחוזים במיזם, משך התוכנית והיקף ההתחייבות.',
  },
  {
    title: 'גישה למשקיעים ולשותפים',
    text: 'שאלו אילו חיבורים התוכנית יוצרת בפועל, ואיך היא מכינה אתכם לפגישות.',
  },
  {
    title: 'מה קורה אחרי התוכנית',
    text: 'יש תוכניות שמסתיימות ביום הצגה, ויש שממשיכות ללוות את המיזם גם בשלבים הבאים.',
  },
];

const SERVICES = [
  { href: '/services/business-consulting', name: 'ייעוץ עסקי ואסטרטגי', text: 'מחקר שוק, מודל עסקי, תוכנית פיננסית ותוכנית עסקית.' },
  { href: '/services/digital-product', name: 'פיתוח מוצר דיגיטלי', text: 'אפיון, עיצוב UX/UI, פיתוח והשקה של אפליקציות ומערכות.' },
  { href: '/services/physical-product', name: 'פיתוח מוצר פיזי', text: 'תכנון הנדסי, אב-טיפוס והכנה לייצור.' },
  { href: '/services/marketing', name: 'שיווק, פרסום ויח"צ', text: 'אסטרטגיה, קמפיינים, רשתות חברתיות ויחסי ציבור.' },
  { href: '/services/medtech-leumit', name: 'מסלול MedTech עם לאומית', text: 'ליווי למיזמים רפואיים בשיתוף לאומית שירותי בריאות.' },
  { href: '/services/investor-preparation', name: 'הכנה למשקיעים', text: 'נאום מעלית, סימולציות והכנה לפגישות גיוס.' },
  { href: '/services/investors', name: 'למשקיעים', text: 'התאמה בין משקיעים למיזמים שעברו את תהליך הליווי.' },
];

const FAQS: ServiceFaqItem[] = [
  {
    question: 'מה זה אקסלרטור לסטארטאפים?',
    answer:
      'אקסלרטור, או מאיץ, הוא תוכנית שמלווה סטארטאפ בשלב מוקדם לתקופה מוגדרת ועוזרת לו להתקדם מהר יותר: חידוד המודל העסקי, בניית מוצר ראשון, וחיבור למנטורים ולמשקיעים.',
  },
  {
    question: 'מה ההבדל בין אקסלרטור לחממה טכנולוגית?',
    answer:
      'אקסלרטור הוא תוכנית קצרה וממוקדת למיזם שכבר התגבש. חממה טכנולוגית מלווה מיזם בשלב מוקדם יותר ולאורך זמן רב יותר, ולעיתים כוללת גם תשתית ומימון ראשוני.',
  },
  {
    question: 'האם WeCcelerate היא אקסלרטור או Venture Builder?',
    answer:
      'שניהם. WeCcelerate (וויסלרייט) היא Venture Builder ומאיץ סטארטאפים ישראלי: היא מלווה יזמים כמו מאיץ, ובנוסף הצוות שלה מבצע בפועל חלק מהעבודה, מייעוץ עסקי ופיתוח מוצר ועד שיווק והכנה לגיוס.',
  },
  {
    question: 'למי הליווי של WeCcelerate מתאים?',
    answer:
      'ליזמים בשלב רעיון שרוצים לבדוק היתכנות, למיזמים שבונים מוצר ראשון, ולחברות קיימות שרוצות להקים פעילות חדשה. הליווי מותאם לשלב שבו המיזם נמצא.',
  },
  {
    question: 'איך מתחילים תהליך עם WeCcelerate?',
    answer:
      'משאירים פרטים בטופס יצירת הקשר באתר. שיחת ההיכרות הראשונה היא ללא עלות, ובה מגדירים יחד מה המיזם צריך ואיזה מסלול מתאים לו.',
  },
  {
    question: 'האם אקסלרטור מבטיח גיוס השקעה?',
    answer:
      'לא. ההחלטה להשקיע מתקבלת על ידי משקיעים חיצוניים ועצמאיים, ולכן שום מאיץ רציני לא יכול להבטיח גיוס. מה שמאיץ כן עושה הוא להכין את המיזם ואת היזם: מודל עסקי, מצגת, מודל פיננסי ותרגול מול שאלות של משקיעים.',
  },
  {
    question: 'איפה נמצאים המשרדים של WeCcelerate?',
    answer: 'המשרדים של WeCcelerate נמצאים בתל אביב, ברחוב הרכבת 58, ובירושלים.',
  },
];

function buildSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${URL}#webpage`,
        url: URL,
        name: TITLE,
        inLanguage: 'he-IL',
        isPartOf: { '@id': `${SITE_CONFIG.url}/#website` },
        about: { '@id': `${SITE_CONFIG.url}/#organization` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]'] },
      },
      {
        '@type': 'FAQPage',
        '@id': `${URL}#faq`,
        inLanguage: 'he-IL',
        mainEntity: FAQS.map((f, i) => ({
          '@type': 'Question',
          '@id': `${URL}#faq-${i + 1}`,
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
          { '@type': 'ListItem', position: 2, name: TITLE, item: URL },
        ],
      },
    ],
  };
}

const h2 = 'text-2xl sm:text-3xl font-bold text-white tracking-tight mb-6';
const body = 'text-white/70 leading-relaxed';
const gold = 'text-[#c8a951] hover:text-[#e8d48b] underline underline-offset-4';

export default function AcceleratorPage() {
  return (
    <main id="main-content" dir="rtl" className="relative bg-[#070b1e]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema()) }}
      />

      {/* Hero: the direct answer comes first */}
      <section className="pt-36 pb-14 sm:pt-44 sm:pb-20">
        <div className="container-corporate max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-white/40">
            <Link href="/" className="hover:text-white">בית</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-white/70">{TITLE}</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-8">
            {TITLE}
          </h1>
          <p data-speakable className="text-lg sm:text-xl text-white/80 leading-relaxed mb-5">
            אקסלרטור, או מאיץ, הוא תוכנית שמלווה סטארטאפ בשלב מוקדם לתקופה מוגדרת ועוזרת לו להתקדם
            מהר יותר: חידוד המודל העסקי, בניית מוצר ראשון, וחיבור למנטורים ולמשקיעים.
          </p>
          <p data-speakable className={`text-lg ${body} mb-10`}>
            WeCcelerate (וויסלרייט) היא חברה ישראלית שמשלבת מאיץ עם Venture Builder. מלבד הליווי,
            הצוות שלה מבצע בפועל חלק מהעבודה: ייעוץ עסקי, פיתוח מוצר, שיווק והכנה לגיוס.
          </p>
          <Link
            href="/contact?source=accelerator-page"
            className="inline-flex items-center bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 text-lg font-bold rounded-sm transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
          >
            לשיחת היכרות ללא עלות
          </Link>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-14 sm:py-20 border-t border-white/[0.06]">
        <div className="container-corporate max-w-5xl">
          <h2 className={h2}>מה ההבדל בין אקסלרטור, חממה ו-Venture Builder?</h2>
          <p className={`${body} max-w-3xl mb-8`}>
            שלושת המודלים מלווים מיזמים בתחילת הדרך, אבל הם נבדלים במשך הליווי, במה שהיזם מקבל ובשלב
            שבו הם מתאימים.
          </p>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[640px] text-right text-sm sm:text-base">
              <thead className="bg-white/[0.04] text-white">
                <tr>
                  <th scope="col" className="p-4 font-semibold">מודל</th>
                  <th scope="col" className="p-4 font-semibold">מה זה</th>
                  <th scope="col" className="p-4 font-semibold">מה מקבלים</th>
                  <th scope="col" className="p-4 font-semibold">למי מתאים</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {MODELS.map((m) => (
                  <tr key={m.name} className="align-top">
                    <th scope="row" className="p-4 font-semibold text-[#e8d48b] whitespace-nowrap">{m.name}</th>
                    <td className="p-4 text-white/70">{m.what}</td>
                    <td className="p-4 text-white/70">{m.gives}</td>
                    <td className="p-4 text-white/70">{m.fits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${body} mt-6`}>
            להרחבה: <Link href="/guides/mah-ze-venture-builder" className={gold}>מה זה Venture Builder</Link>
            {' '}ו<Link href="/comparisons" className={gold}>השוואה בין מאיצים בישראל</Link>.
          </p>
        </div>
      </section>

      {/* How to choose */}
      <section className="py-14 sm:py-20 border-t border-white/[0.06]">
        <div className="container-corporate max-w-3xl">
          <h2 className={h2}>איך בוחרים אקסלרטור?</h2>
          <ol className="space-y-6">
            {CRITERIA.map((c, i) => (
              <li key={c.title} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#c8a951]/15 text-[#e8d48b] font-bold flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{c.title}</h3>
                  <p className={body}>{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What WeCcelerate provides */}
      <section className="py-14 sm:py-20 border-t border-white/[0.06]">
        <div className="container-corporate max-w-5xl">
          <h2 className={h2}>מה כולל הליווי של WeCcelerate?</h2>
          <p className={`${body} max-w-3xl mb-8`}>
            הליווי נבנה לפי השלב שבו המיזם נמצא ולפי מה שחסר לו. אפשר לשלב כמה תחומים או להתחיל באחד.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="block h-full rounded-lg border border-white/10 bg-white/[0.02] p-5 transition-colors duration-200 hover:border-[#c8a951]/40 hover:bg-white/[0.04]"
                >
                  <h3 className="text-lg font-semibold text-white mb-1">{s.name}</h3>
                  <p className="text-white/60 leading-relaxed">{s.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MedTech + location */}
      <section className="py-14 sm:py-20 border-t border-white/[0.06]">
        <div className="container-corporate max-w-3xl space-y-12">
          <div>
            <h2 className={h2}>מאיץ רפואי: מסלול MedTech עם לאומית</h2>
            <p className={body}>
              למיזמים בתחומי הבריאות הדיגיטלית, המכשור הרפואי והדיאגנוסטיקה יש מסלול ייעודי בשיתוף
              לאומית שירותי בריאות. לאומית מביאה את הצד הקליני, ובו חוות דעת של רופאים מומחים,
              ו-WeCcelerate מביאה את הליווי העסקי, הרגולטורי והטכנולוגי.{' '}
              <Link href="/services/medtech-leumit" className={gold}>לפרטים על המסלול</Link>.
            </p>
          </div>
          <div>
            <h2 className={h2}>איפה WeCcelerate נמצאת?</h2>
            <p className={body}>
              המשרדים נמצאים בתל אביב, ברחוב הרכבת 58, ובירושלים. הליווי ניתן ליזמים מכל הארץ.{' '}
              <Link href="/contact" className={gold}>ליצירת קשר</Link>.
            </p>
          </div>
        </div>
      </section>

      <ServiceFaq items={FAQS} title="שאלות נפוצות על אקסלרטורים" />
      <LeadFormSection formType="page_cta" />
    </main>
  );
}
