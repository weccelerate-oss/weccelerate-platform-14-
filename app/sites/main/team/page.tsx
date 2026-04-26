import { Metadata } from 'next';
import Script from 'next/script';
import { constructMetadata } from '@/lib/seo';
import TeamContent from './TeamContent';
import { FOUNDER as SHARED_FOUNDER, CO_FOUNDERS as SHARED_CO_FOUNDERS } from '@/lib/seo/founders';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'הצוות שלנו | Our Team',
  description:
    'Meet the WeCcelerate team — Advisory Board, Partners, and Startup Mentors leading Israel\'s top Venture Builder and Medical Accelerator.',
  keywords: [
    'Advisory Board',
    'Partners',
    'Startup Mentors',
    'WeCcelerate Team',
    'Israel Venture Builder Team',
    'ועדה מייעצת',
    'שותפים',
    'מנטורים לסטארטאפים',
    'צוות וויסלרייט',
  ],
  path: '/team',
  locale: 'he',
});

// =============================================================================
// TEAM DATA (for JSON-LD only)
// =============================================================================

interface TeamMember {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  bio: string;
  image: string;
  linkedin?: string;
  credentials?: string[];
}

// ENTITY-CRITICAL ROSTER — ONLY VERIFIED FOUNDERS
// ------------------------------------------------------------
// Google Knowledge Graph + LLMs require a Person entity to have enough
// distinguishing information (full name, verified jobTitle, and ideally a
// LinkedIn sameAs) to be treated as a real, trustworthy entity. First-name-
// only entries ("Sharon", "On") degrade Organization E-E-A-T because search
// engines and LLMs cannot resolve them to unique people, so they discount the
// Organization's authority signal.
//
// This roster therefore contains ONLY:
//   1. The CEO & founder (Alon Pinchas)
//   2. Confirmed co-founders (Avraham Hinoch, Ido Sabag)
//
// UI display of other team members is handled separately inside TeamContent —
// keeping them OUT of JSON-LD is intentional, not an oversight.
// ------------------------------------------------------------

// Founders are now loaded from the shared single-source-of-truth at
// `lib/seo/founders.ts`. This module is also used by `/team/[slug]/page.tsx`
// (author pages) — keeping them in sync without duplication.
const founder: TeamMember = SHARED_FOUNDER;
const coFounders: TeamMember[] = SHARED_CO_FOUNDERS;

// =============================================================================
// JSON-LD
// =============================================================================

function generateTeamSchema() {
  const SITE = 'https://weccelerate.co.il';
  const ORG_ID = `${SITE}/#organization`;
  // Order matters for JSON-LD: founder first, then co-founders.
  // Advisory Board & Core Team are INTENTIONALLY excluded — see roster comment above.
  const allMembers = [founder, ...coFounders];

  const people = allMembers.map((member) => {
    const personId = `${SITE}/team#${member.id}`;
    const sameAs = member.linkedin ? [member.linkedin] : undefined;
    return {
      '@type': 'Person',
      '@id': personId,
      name: member.nameEn,
      alternateName: member.name,
      jobTitle: member.roleEn,
      description: member.bio,
      url: `${SITE}/team#${member.id}`,
      image: `${SITE}${member.image}`,
      ...(sameAs && { sameAs }),
      worksFor: { '@id': ORG_ID },
      memberOf: { '@id': ORG_ID },
      knowsAbout: [
        'Startup Acceleration',
        'Venture Building',
        'Entrepreneurship',
        'Business Strategy',
        ...(member.credentials ?? []),
      ],
      ...(member.credentials && member.credentials.length > 0 && {
        hasCredential: member.credentials.map((c) => ({
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: c,
        })),
      }),
      nationality: { '@type': 'Country', name: 'Israel' },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE}/team#webpage`,
        url: `${SITE}/team`,
        name: 'הצוות שלנו — WeCcelerate',
        description: 'Advisory Board, Partners and Mentors of WeCcelerate Venture Builder',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': ORG_ID },
        inLanguage: 'he-IL',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['[data-speakable]'],
        },
      },
      // Reinforce the Organization with explicit `founder` (Alon Pinchas + co-founders)
      // and `member` links — bidirectional graph between Organization and each Person
      // strengthens entity recognition for LLMs and Google Knowledge Graph.
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'WeCcelerate',
        url: SITE,
        founder: [
          { '@id': `${SITE}/team#${founder.id}` },
          ...coFounders.map((c) => ({ '@id': `${SITE}/team#${c.id}` })),
        ],
        employee: { '@id': `${SITE}/team#${founder.id}` },
        member: people.map((p) => ({ '@id': p['@id'] })),
      },
      ...people,
    ],
  };
}

// =============================================================================
// PAGE
// =============================================================================

export default function TeamPage() {
  return (
    <>
      <Script
        id="team-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateTeamSchema()),
        }}
      />

      <TeamContent />
    </>
  );
}
