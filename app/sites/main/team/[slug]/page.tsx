import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  TEAM_SLUGS,
  getPersonBySlug,
  type TeamPerson,
} from '@/lib/seo/founders';
import { getGuideBySlug } from '@/lib/seo/guides-catalog';
import { OUTLET_METADATA, PRESS_MENTIONS } from '@/lib/seo/press-catalog';

export const revalidate = 86400;

type Params = { slug: string };

// =============================================================================
// AUTHOR / FOUNDER PAGES
// =============================================================================
// Each founder gets a dedicated, indexable URL with full Person schema —
// critical for E-E-A-T (Google YMYL) and for press citations that link to a
// specific founder. Without these pages, /team#alon-pinchas is just an
// anchor; with these pages, the founder is a first-class entity.
// =============================================================================

export function generateStaticParams() {
  return TEAM_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const person = getPersonBySlug(slug);

  if (!person) {
    return constructMetadata({
      title: 'דף לא נמצא',
      path: `/team/${slug}`,
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${person.name} (${person.nameEn}) — ${person.role} | WeCcelerate`,
    description: person.bio.slice(0, 160),
    path: `/team/${person.id}`,
    locale: 'he',
    type: 'article',
    image: `${SITE_CONFIG.url}${person.image}`,
    keywords: [
      person.name,
      person.nameEn,
      `${person.name} WeCcelerate`,
      `${person.nameEn} WeCcelerate`,
      person.role,
      'מייסד WeCcelerate',
      'WeCcelerate founder',
      ...(person.isFounder ? ['Venture Builder Israel founder'] : []),
    ],
  });
}

function buildPersonSchema(person: TeamPerson) {
  const url = `${SITE_CONFIG.url}/team/${person.id}`;
  const sameAs: string[] = [];
  if (person.linkedin) sameAs.push(person.linkedin);
  if (person.twitter) sameAs.push(person.twitter);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_CONFIG.url}/team#${person.id}`,
    name: person.nameEn,
    alternateName: person.name,
    jobTitle: person.roleEn,
    description: person.bioEn ?? person.bio,
    image: `${SITE_CONFIG.url}${person.image}`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(sameAs.length > 0 && { sameAs }),
    worksFor: { '@id': `${SITE_CONFIG.url}/#organization` },
    memberOf: { '@id': `${SITE_CONFIG.url}/#organization` },
    nationality: { '@type': 'Country', name: 'Israel' },
    knowsAbout: [
      'Venture Building',
      'Startup Acceleration',
      'Entrepreneurship',
      'Business Strategy',
      ...(person.credentials ?? []),
    ],
    ...(person.credentials && person.credentials.length > 0 && {
      hasCredential: person.credentials.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: c,
      })),
    }),
  };
}

function buildBreadcrumbSchema(person: TeamPerson) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${SITE_CONFIG.url}/team/${person.id}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
      { '@type': 'ListItem', position: 2, name: 'הצוות', item: `${SITE_CONFIG.url}/team` },
      {
        '@type': 'ListItem',
        position: 3,
        name: person.name,
        item: `${SITE_CONFIG.url}/team/${person.id}`,
      },
    ],
  };
}

export default async function FounderAuthorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const person = getPersonBySlug(slug);

  if (!person) notFound();

  // Surface relevant guides this person is associated with as expert/contributor.
  const expertGuides = (person.expertGuides ?? [])
    .map((s) => getGuideBySlug(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  // Press mentions that quote/feature this person.
  const personPress = (person.pressMentions ?? [])
    .map((id) => PRESS_MENTIONS.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPersonSchema(person)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(person)) }}
      />

      <main className="min-h-screen bg-white" id="main-content">
        <article className="mx-auto max-w-4xl px-4 py-12 md:py-16" dir="rtl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <Link href="/team" className="hover:text-slate-900">הצוות</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">{person.name}</span>
          </nav>

          {/* Hero */}
          <header className="mb-10 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
            <div className="relative h-44 w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:h-48 md:w-48">
              <Image
                src={person.image}
                alt={`${person.name} — ${person.role}`}
                fill
                priority
                sizes="192px"
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">
                {person.name}
              </h1>
              <p className="mb-1 text-lg font-medium text-blue-700">{person.role}</p>
              <p className="mb-4 text-sm text-slate-500">
                {person.nameEn} · {person.roleEn}
              </p>
              <div className="flex flex-wrap gap-2">
                {(person.credentials ?? []).map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {person.linkedin && (
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
                >
                  LinkedIn →
                </a>
              )}
            </div>
          </header>

          {/* Bio */}
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-bold text-slate-900">ביוגרפיה</h2>
            <p data-speakable className="leading-relaxed text-slate-700">
              {person.bio}
            </p>
          </section>

          {/* Expert in / contributing to */}
          {expertGuides.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                תחומי מומחיות — מדריכים מ-{person.name}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {expertGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm"
                  >
                    <h3 className="mb-2 font-semibold text-slate-900 group-hover:text-blue-700">
                      {g.h1}
                    </h3>
                    <p className="text-sm text-slate-600">{g.metaDescription}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Press mentions */}
          {personPress.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-slate-900">בתקשורת</h2>
              <ul className="space-y-3">
                {personPress.map((mention) => {
                  const outlet = OUTLET_METADATA[mention.outlet];
                  const dateFormatted = new Date(mention.date).toLocaleDateString('he-IL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                  const content = (
                    <article className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm">
                      <div className="mb-2 flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {outlet?.nameHe ?? outlet?.name ?? mention.outlet}
                        </span>
                        <span>·</span>
                        <time dateTime={mention.date}>{dateFormatted}</time>
                      </div>
                      <h3 className="font-semibold text-slate-900">{mention.title}</h3>
                      {mention.excerpt && (
                        <p className="mt-1 text-sm text-slate-600">{mention.excerpt}</p>
                      )}
                    </article>
                  );
                  return (
                    <li key={mention.id}>
                      {mention.url ? (
                        <a href={mention.url} target="_blank" rel="noopener noreferrer">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* CTA */}
          <section className="mt-12 rounded-2xl bg-slate-900 p-8 text-center text-white">
            <h2 className="mb-3 text-xl font-bold">פניות ישירות ל-{person.name}</h2>
            <p className="mb-5 text-slate-300">
              עיתונאים, פודקאסטים, יזמים — דרך משרד WeCcelerate.
            </p>
            <a
              href={`mailto:info@weccelerate.co.il?subject=Press%20inquiry%20%E2%80%94%20${encodeURIComponent(person.nameEn)}`}
              className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              info@weccelerate.co.il
            </a>
          </section>

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/team" className="hover:text-slate-900">
              ← חזרה לכל הצוות
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
