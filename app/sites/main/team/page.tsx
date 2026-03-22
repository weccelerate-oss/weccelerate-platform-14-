import { Metadata } from 'next';
import Script from 'next/script';
import { constructMetadata } from '@/lib/seo';
import TeamContent from './TeamContent';

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

const advisoryBoard: TeamMember[] = [
  {
    id: 'sharon',
    name: 'שרון',
    nameEn: 'Sharon',
    role: 'חבר ועדה מייעצת',
    roleEn: 'Advisory Board Member',
    bio: 'מומחה בכיר בתעשיית הטכנולוגיה והחדשנות בישראל.',
    image: '/images/team/sharon.jpg',
    credentials: ['ועדה מייעצת'],
  },
  {
    id: 'on',
    name: 'און',
    nameEn: 'On',
    role: 'חבר ועדה מייעצת',
    roleEn: 'Advisory Board Member',
    bio: 'ניסיון עשיר בליווי סטארטאפים מהרעיון לשוק.',
    image: '/images/team/on.jpg',
    credentials: ['ועדה מייעצת'],
  },
  {
    id: 'elia',
    name: 'אליה',
    nameEn: 'Elia',
    role: 'חבר ועדה מייעצת',
    roleEn: 'Advisory Board Member',
    bio: 'רקע עמוק בפיתוח עסקי ואסטרטגיה טכנולוגית.',
    image: '/images/team/elia.jpg',
    credentials: ['ועדה מייעצת'],
  },
  {
    id: 'shahar',
    name: 'שחר',
    nameEn: 'Shahar',
    role: 'חבר ועדה מייעצת',
    roleEn: 'Advisory Board Member',
    bio: 'מומחה בהשקעות ופיתוח אקוסיסטם טכנולוגי.',
    image: '/images/team/shahar.jpg',
    credentials: ['ועדה מייעצת'],
  },
];

const coreTeam: TeamMember[] = [
  {
    id: 'tomer',
    name: 'תומר',
    nameEn: 'Tomer',
    role: 'צוות מוביל',
    roleEn: 'Core Team',
    bio: 'ליווי סטארטאפים מהאפיון הראשוני ועד השקה בשוק.',
    image: '/images/team/tomer.jpg',
  },
  {
    id: 'meital',
    name: 'מיטל',
    nameEn: 'Meital',
    role: 'פיננסים',
    roleEn: 'Finance',
    bio: 'ניהול פיננסי, תקציב ותכנון כלכלי למיזמים.',
    image: '/images/team/meital.jpg',
    credentials: ['פיננסים'],
  },
  {
    id: 'susan',
    name: 'סוזן הלפרט',
    nameEn: 'Susan Halperlt',
    role: 'צוות מוביל',
    roleEn: 'Core Team',
    bio: 'מומחית בפיתוח עסקי בינלאומי ויצירת שותפויות אסטרטגיות.',
    image: '/images/team/susan.jpg',
  },
  {
    id: 'amir-shaul',
    name: 'אמיר שאול',
    nameEn: 'Amir Shaul',
    role: 'צוות מוביל',
    roleEn: 'Core Team',
    bio: 'ניסיון בניהול מוצר וליווי טכנולוגי לסטארטאפים.',
    image: '/images/team/amir-shaul.jpg',
  },
  {
    id: 'dani-topaz',
    name: 'דני טופז',
    nameEn: 'Dani Topaz',
    role: 'צוות מוביל',
    roleEn: 'Core Team',
    bio: 'מומחה באסטרטגיה עסקית וחיבור לשוק.',
    image: '/images/team/dani-topaz.jpg',
  },
];

// =============================================================================
// JSON-LD
// =============================================================================

function generateTeamSchema() {
  const allMembers = [...advisoryBoard, ...coreTeam];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://weccelerate.co.il/team',
        name: 'הצוות שלנו - WeCcelerate',
        description: 'Advisory Board, Partners and Mentors of WeCcelerate Venture Builder',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://weccelerate.co.il',
          name: 'WeCcelerate',
        },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', 'h2', '[data-speakable]'],
        },
      },
      ...allMembers.map((member) => ({
        '@type': 'Person',
        name: member.nameEn,
        alternateName: member.name,
        jobTitle: member.roleEn,
        description: member.bio,
        image: `https://weccelerate.co.il${member.image}`,
        sameAs: member.linkedin ? [member.linkedin] : [],
        worksFor: {
          '@type': 'Organization',
          '@id': 'https://weccelerate.co.il/#organization',
          name: 'WeCcelerate',
          url: 'https://weccelerate.co.il',
        },
        knowsAbout: [
          'Startup Acceleration',
          'Venture Building',
          'Entrepreneurship',
          'Business Strategy',
          ...(member.credentials || []),
        ],
        ...(member.credentials && member.credentials.length > 0 && {
          hasCredential: member.credentials.map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: c,
          })),
        }),
        nationality: {
          '@type': 'Country',
          name: 'Israel',
        },
      })),
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
