import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  TEAM_SLUGS,
  getPersonBySlug,
  type TeamPerson,
} from '@/lib/seo/founders';
import { getGuideBySlug } from '@/lib/seo/guides-catalog';
import { OUTLET_METADATA, PRESS_MENTIONS } from '@/lib/seo/press-catalog';
import TeamMemberContent, {
  type RelatedGuide,
  type RelatedPress,
} from './TeamMemberContent';

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
  const expertGuides: RelatedGuide[] = (person.expertGuides ?? [])
    .map((s) => getGuideBySlug(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ slug: g.slug, h1: g.h1, metaDescription: g.metaDescription }));

  // Press mentions that quote/feature this person — shaped into serializable
  // props (outlet name resolved here; date formatted per-locale on the client).
  const personPress: RelatedPress[] = (person.pressMentions ?? [])
    .map((id) => PRESS_MENTIONS.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((mention) => {
      const outlet = OUTLET_METADATA[mention.outlet];
      return {
        id: mention.id,
        outletName: outlet?.nameHe ?? outlet?.name ?? mention.outlet,
        outletNameEn: outlet?.name ?? mention.outlet,
        date: mention.date,
        title: mention.title,
        excerpt: mention.excerpt,
        url: mention.url,
      };
    });

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

      <TeamMemberContent
        person={person}
        expertGuides={expertGuides}
        personPress={personPress}
      />
    </>
  );
}
