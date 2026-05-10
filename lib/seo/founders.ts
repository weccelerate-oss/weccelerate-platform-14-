/**
 * Founders & key team members — single source of truth for Person entities
 * across the site (team page, author pages, GeoSchema).
 *
 * Only individuals listed here are emitted as Person entities in JSON-LD.
 * Adding "test" or "placeholder" people here will damage Organization
 * E-E-A-T because LLMs and Google verify each Person via sameAs.
 *
 * To add a team member:
 *   1. Confirm they are publicly named (LinkedIn, press, signed bio).
 *   2. If they have a verified LinkedIn profile, set `linkedin`.
 *   3. Append to FOUNDERS or CORE_TEAM. The /team page and /team/[slug]
 *      route pick them up automatically.
 *
 * NEVER add Maor Argaman (site developer) or anyone outside the company.
 */

export interface TeamPerson {
  /** URL slug — must match `/team/${slug}` and `#${slug}` anchors. */
  id: string;
  /** Hebrew display name. */
  name: string;
  /** English display name (used in Person schema `name`). */
  nameEn: string;
  /** Hebrew role title. */
  role: string;
  /** English role title. */
  roleEn: string;
  /** Hebrew bio — 200-400 chars, citation-ready. */
  bio: string;
  /** English bio — used on author page in EN locale. */
  bioEn?: string;
  /** Local image path under /public. */
  image: string;
  /** Public LinkedIn profile URL — populate once verified. */
  linkedin?: string;
  /** Twitter/X handle URL — populate once verified. */
  twitter?: string;
  /** Hebrew credentials list. */
  credentials?: string[];
  /** True if this person is a founder (vs core-team / advisor). */
  isFounder?: boolean;
  /** Founder rank — 1 = primary founder/CEO, 2+ = co-founders. */
  founderRank?: number;
  /** Press mentions / appearances — used on author page. */
  pressMentions?: string[];
  /** Slugs from guides-catalog that this person is associated with as
   *  expert/contributor — surfaced as related content on author page. */
  expertGuides?: string[];
}

export const FOUNDER: TeamPerson = {
  id: 'alon-pinchas',
  name: 'אלון פנחס',
  nameEn: 'Alon Pinchas',
  role: 'מייסד ומנכ"ל',
  roleEn: 'Founder & CEO',
  bio: 'מייסד ומנכ"ל WeCcelerate — בונה המיזמים המוביל בישראל. כלכלן במקצועו, בעל רקע ברואת חשבון באינטל. הוביל את הקמת המאיץ וליווי של מאות סטארטאפים ישראלים משלב הרעיון ועד גיוסי Seed, Pre-Seed ו-Series A. שותף-מייסד של Firefly. מופיע באופן קבוע בתקשורת הישראלית (ערוץ הכלכלה, גלובס, רשת 13) כמומחה לאקוסיסטם הסטארטאפים.',
  bioEn:
    'Founder & CEO of WeCcelerate — Israel\'s leading Venture Builder. Economist by training, former accountant at Intel. Led the founding of the accelerator and the mentorship of hundreds of Israeli startups from idea stage through Pre-Seed, Seed, and Series A fundraising. Co-founder of Firefly. Regular media commentator on the Israeli startup ecosystem (Channel 14 Economy, Globes, Reshet 13).',
  image: '/images/team/alon-pinchas.jpg',
  linkedin: 'https://www.linkedin.com/in/alon-pinhas-589a97172/',
  credentials: ['מייסד', 'מנכ"ל', 'כלכלן'],
  isFounder: true,
  founderRank: 1,
  pressMentions: [
    'globes-2022-leumit-partnership',
    'calcalist-tag-page',
  ],
  expertGuides: [
    'mah-ze-venture-builder',
    'eich-lehakim-startup',
    'eich-mgayisim-mashkim',
    'mizam-refui',
    'startup-ai-israel',
  ],
};

export const CO_FOUNDERS: TeamPerson[] = [
  {
    id: 'avraham-hinoch',
    name: 'אברהם הינוך',
    nameEn: 'Avraham Hinoch',
    role: 'שותף מייסד · סמנכ"ל שיווק',
    roleEn: 'Co-Founder · VP Marketing',
    bio: 'שותף מייסד וסמנכ"ל שיווק ב-WeCcelerate. פעיל בליווי יזמים ובפיתוח שותפויות אסטרטגיות. מצוטט בכתבות בכלכליסט וב-CTech על דאטה לאומית, אסטרטגיית שיווק לסטארטאפים ועתיד הענף.',
    bioEn:
      'Co-Founder and VP Marketing at WeCcelerate. Active in mentoring entrepreneurs and developing strategic partnerships. Cited in Calcalist and CTech on national data infrastructure, startup marketing strategy, and the future of the industry.',
    image: '/images/team/avraham-hinoch.jpg',
    linkedin: 'https://www.linkedin.com/in/avraham-heinoch-20168a231/',
    credentials: ['שותף מייסד', 'סמנכ"ל שיווק'],
    isFounder: true,
    founderRank: 2,
    pressMentions: ['calcalist-2025-hinoch-data-budget'],
    expertGuides: ['pitch-deck-startup', 'tochnit-iskit-startup'],
  },
  {
    id: 'ido-sabag',
    name: 'עידו סבג',
    nameEn: 'Ido Sabag',
    role: 'שותף מייסד',
    roleEn: 'Co-Founder',
    bio: 'שותף מייסד של WeCcelerate. מהנדס מכונות במקצועו, חבר ילדות של אלון פנחס משכונה ד׳ בבאר שבע. מתמקד בפיתוח עסקי ובמסלולי ליווי לחברות פורטפוליו.',
    bioEn:
      'Co-Founder of WeCcelerate. Mechanical engineer by training, childhood friend of Alon Pinchas from Be\'er Sheva. Focuses on business development and portfolio company support tracks.',
    image: '/images/team/ido-sabag.jpg',
    linkedin: 'https://www.linkedin.com/in/ido-sabag-382b641b3/',
    credentials: ['שותף מייסד', 'מהנדס מכונות'],
    isFounder: true,
    founderRank: 3,
    expertGuides: ['eich-lehakim-mizam', 'chipus-shutaf-meyased'],
  },
];

/** All team people indexed by slug for fast lookup. */
export const TEAM_BY_SLUG: Record<string, TeamPerson> = Object.fromEntries(
  [FOUNDER, ...CO_FOUNDERS].map((p) => [p.id, p]),
);

/** Static slugs for generateStaticParams. */
export const TEAM_SLUGS: readonly string[] = Object.keys(TEAM_BY_SLUG);

export function getPersonBySlug(slug: string): TeamPerson | undefined {
  return TEAM_BY_SLUG[slug];
}
