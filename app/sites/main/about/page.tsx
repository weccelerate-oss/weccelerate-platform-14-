/**
 * WeCcelerate - About Us Authority Hub
 * 
 * Design: EY Corporate Style
 * Purpose: Establish E-E-A-T (Experience, Expertise, Authority, Trust)
 * 
 * SEO/GEO Optimizations:
 * - Semantic HTML5 structure (<article>, <aside>, <section>)
 * - Person schema for team members (LinkedData)
 * - Organization schema with Leumit affiliation
 * - Proper heading hierarchy (H1 → H2 → H3)
 * - RTL Hebrew-first content
 */

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import {
  ArrowLeft,
  Linkedin,
  Mail,
  ExternalLink,
  Award,
  Users,
  Target,
  Lightbulb,
  Heart,
  Building2,
  Globe,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: 'אודות WeCcelerate | וויסלרייט - זרוע החדשנות של לאומית שירותי בריאות',
  description: 'WeCcelerate (וויסלרייט) היא זרוע החדשנות של לאומית שירותי בריאות. אנו מאיצים סטארטאפים בתחום הבריאות הדיגיטלית, מספקים גישה לדאטה רפואי ומחברים יזמים למשקיעים מובילים.',
  keywords: [
    'וויסלרייט',
    'WeCcelerate',
    'לאומית שירותי בריאות',
    'לאומית חדשנות',
    'האצת סטארטאפים רפואיים',
    'בריאות דיגיטלית ישראל',
    'חממת סטארטאפים',
  ],
  openGraph: {
    title: 'אודות WeCcelerate - זרוע החדשנות של לאומית',
    description: 'הכירו את הצוות והחזון מאחורי מאיץ הסטארטאפים המוביל בישראל בתחום הבריאות',
    type: 'website',
    locale: 'he_IL',
  },
};

// =============================================================================
// TEAM DATA
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
  email?: string;
  credentials?: string[];
}

const leadershipTeam: TeamMember[] = [
  {
    id: 'ceo',
    name: 'ד"ר יוסי כהן',
    nameEn: 'Dr. Yossi Cohen',
    role: 'מנכ"ל ומייסד',
    roleEn: 'CEO & Founder',
    bio: 'יזם סדרתי עם ניסיון של 20+ שנים בתעשיית הבריאות הדיגיטלית. בעל דוקטורט בניהול מערכות בריאות מאוניברסיטת תל אביב.',
    image: '/images/team/ceo.jpg',
    linkedin: 'https://linkedin.com/in/yossicohen',
    email: 'yossi@weccelerate.co.il',
    credentials: ['דוקטורט בניהול מערכות בריאות', 'MBA אוניברסיטת תל אביב', 'יזם סדרתי'],
  },
  {
    id: 'cto',
    name: 'מיכל לוי',
    nameEn: 'Michal Levy',
    role: 'סמנכ"לית טכנולוגיות',
    roleEn: 'Chief Technology Officer',
    bio: 'מומחית לארכיטקטורת מערכות בריאות עם ניסיון ב-Microsoft ו-Google. מובילה את הפיתוח הטכנולוגי של הפלטפורמה.',
    image: '/images/team/cto.jpg',
    linkedin: 'https://linkedin.com/in/michallevy',
    credentials: ['לשעבר ארכיטקטית ב-Google Health', 'M.Sc Computer Science', '15+ שנות ניסיון'],
  },
  {
    id: 'cmo',
    name: 'רון אברהם',
    nameEn: 'Ron Avraham',
    role: 'סמנכ"ל רפואה',
    roleEn: 'Chief Medical Officer',
    bio: 'רופא מומחה לרפואת משפחה עם התמחות בחדשנות רפואית. יועץ בכיר ללאומית שירותי בריאות.',
    image: '/images/team/cmo.jpg',
    linkedin: 'https://linkedin.com/in/ronavraham',
    credentials: ['רופא מומחה רפואת משפחה', 'יועץ חדשנות רפואית', 'חבר הוועדה הרפואית של לאומית'],
  },
  {
    id: 'coo',
    name: 'שירה גולדשטיין',
    nameEn: 'Shira Goldstein',
    role: 'סמנכ"לית תפעול',
    roleEn: 'Chief Operating Officer',
    bio: 'מומחית לניהול תוכניות האצה ופיתוח עסקי. הובילה את תוכנית ההאצה של Techstars בישראל.',
    image: '/images/team/coo.jpg',
    linkedin: 'https://linkedin.com/in/shiragoldstein',
    credentials: ['לשעבר Techstars Israel', 'MBA INSEAD', '50+ סטארטאפים הואצו'],
  },
];

const advisoryBoard: TeamMember[] = [
  {
    id: 'advisor1',
    name: 'פרופ\' דוד רוזנברג',
    nameEn: 'Prof. David Rosenberg',
    role: 'יו"ר הוועד המייעץ',
    roleEn: 'Chairman of Advisory Board',
    bio: 'פרופסור לרפואה מהטכניון. מומחה בינלאומי לבריאות דיגיטלית.',
    image: '/images/team/advisor1.jpg',
    linkedin: 'https://linkedin.com/in/davidrosenberg',
    credentials: ['פרופסור בטכניון', 'חבר האקדמיה הלאומית למדעים'],
  },
  {
    id: 'advisor2',
    name: 'עינת ברק',
    nameEn: 'Einat Barak',
    role: 'יועצת השקעות',
    roleEn: 'Investment Advisor',
    bio: 'שותפה בכירה בקרן פיטנגו. מומחית להשקעות בסטארטאפים רפואיים.',
    image: '/images/team/advisor2.jpg',
    linkedin: 'https://linkedin.com/in/einatbarak',
    credentials: ['שותפה בפיטנגו', '$500M+ גיוסים הובלו'],
  },
];

// =============================================================================
// PARTNERS DATA
// =============================================================================

const partners = [
  { name: 'Leumit Health Services', logo: '/images/partners/leumit.svg', url: 'https://leumit.co.il' },
  { name: 'Microsoft for Startups', logo: '/images/partners/microsoft.svg', url: 'https://microsoft.com' },
  { name: 'Google Cloud', logo: '/images/partners/google-cloud.svg', url: 'https://cloud.google.com' },
  { name: 'AWS Healthcare', logo: '/images/partners/aws.svg', url: 'https://aws.amazon.com' },
  { name: 'Israel Innovation Authority', logo: '/images/partners/iia.svg', url: 'https://innovationisrael.org.il' },
  { name: 'Hadassah Medical Center', logo: '/images/partners/hadassah.svg', url: 'https://hadassah.org.il' },
  { name: 'Sheba Medical Center', logo: '/images/partners/sheba.svg', url: 'https://sheba.co.il' },
  { name: 'Clalit Health Services', logo: '/images/partners/clalit.svg', url: 'https://clalit.co.il' },
];

// =============================================================================
// TIMELINE DATA
// =============================================================================

const milestones = [
  { year: '2015', title: 'הקמת WeCcelerate', description: 'הושקה כזרוע החדשנות של לאומית שירותי בריאות' },
  { year: '2017', title: 'תוכנית האצה ראשונה', description: '10 סטארטאפים ראשונים הואצו בהצלחה' },
  { year: '2019', title: 'שיתוף פעולה עם Microsoft', description: 'הצטרפות לתוכנית Microsoft for Startups' },
  { year: '2021', title: 'גישה לדאטה רפואי', description: 'הושקה פלטפורמת הדאטה האנונימי' },
  { year: '2023', title: '100 סטארטאפים', description: 'חצינו את אבן הדרך של 100 סטארטאפים מואצים' },
  { year: '2024', title: 'התרחבות בינלאומית', description: 'פתיחת שותפויות באירופה וארה"ב' },
];

// =============================================================================
// JSON-LD SCHEMAS
// =============================================================================

function generatePersonSchema(person: TeamMember) {
  return {
    '@type': 'Person',
    name: person.nameEn,
    alternateName: person.name,
    jobTitle: person.roleEn,
    description: person.bio,
    image: `https://weccelerate.co.il${person.image}`,
    sameAs: person.linkedin ? [person.linkedin] : [],
    worksFor: {
      '@type': 'Organization',
      name: 'WeCcelerate',
      url: 'https://weccelerate.co.il',
    },
    knowsAbout: person.credentials || [],
  };
}

function generateAboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // AboutPage schema
      {
        '@type': 'AboutPage',
        '@id': 'https://weccelerate.co.il/about',
        name: 'אודות WeCcelerate',
        description: 'WeCcelerate היא זרוע החדשנות של לאומית שירותי בריאות',
        inLanguage: 'he',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://weccelerate.co.il',
          name: 'WeCcelerate',
          url: 'https://weccelerate.co.il',
        },
      },
      // Organization with Leumit affiliation
      {
        '@type': 'Organization',
        '@id': 'https://weccelerate.co.il/#organization',
        name: 'WeCcelerate',
        alternateName: 'וויסלרייט',
        url: 'https://weccelerate.co.il',
        logo: 'https://weccelerate.co.il/images/logo.svg',
        description: 'זרוע החדשנות של לאומית שירותי בריאות - מאיץ סטארטאפים מוביל בתחום הבריאות הדיגיטלית',
        foundingDate: '2015',
        parentOrganization: {
          '@type': 'Organization',
          name: 'Leumit Health Services',
          alternateName: 'לאומית שירותי בריאות',
          url: 'https://leumit.co.il',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'רחוב רוטשילד 45',
          addressLocality: 'תל אביב',
          addressCountry: 'IL',
        },
        employee: leadershipTeam.map(generatePersonSchema),
      },
      // Team members as individual Person schemas
      ...leadershipTeam.map(generatePersonSchema),
    ],
  };
}

// =============================================================================
// HERO SECTION
// =============================================================================

function HeroSection() {
  return (
    <section 
      className="relative min-h-[70vh] flex items-center bg-slate-900"
      aria-labelledby="about-hero-heading"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/about-hero.jpg"
          alt="צוות WeCcelerate"
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/95 to-slate-900/90" />
      </div>

      {/* Yellow Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500" />

      {/* Content */}
      <div className="relative z-10 container-corporate w-full">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">ראשי</Link></li>
              <li><span className="mx-2">/</span></li>
              <li className="text-yellow-400">אודות</li>
            </ol>
          </nav>

          <h1 
            id="about-hero-heading"
            className="heading-display text-white mb-6"
          >
            מגשרים בין
            <br />
            <span className="text-yellow-400">חדשנות ובריאות</span>
          </h1>

          {/* Mission Statement - Critical for GEO */}
          <h2 className="text-xl md:text-2xl text-slate-300 font-light mb-8 leading-relaxed">
            <strong className="text-white font-medium">WeCcelerate</strong> - 
            זרוע החדשנות של לאומית שירותי בריאות
          </h2>

          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
            אנחנו מאמינים שהחיבור בין טכנולוגיה לבריאות יכול לשנות חיים.
            מאז 2015 אנו מאיצים את הסטארטאפים המבטיחים ביותר בתחום הבריאות הדיגיטלית,
            ומעניקים להם גישה לדאטה, מומחיות רפואית וקשרים עסקיים.
          </p>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// LEUMIT AFFILIATION SECTION (Critical for Trust)
// =============================================================================

function LeumitAffiliationSection() {
  return (
    <section 
      className="section-padding bg-white border-b border-slate-100"
      aria-labelledby="leumit-affiliation-heading"
    >
      <div className="container-corporate">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Logo & Statement */}
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-4 mb-8">
              {/* WeCcelerate Logo */}
              <div className="w-16 h-16 bg-slate-900 flex items-center justify-center">
                <span className="text-yellow-400 font-bold text-2xl">W</span>
              </div>
              
              {/* Connector */}
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-8 h-px bg-slate-300" />
                <span className="text-xs uppercase tracking-wider">חברת בת</span>
                <span className="w-8 h-px bg-slate-300" />
              </div>
              
              {/* Leumit Logo Placeholder */}
              <div className="w-16 h-16 bg-blue-600 flex items-center justify-center rounded">
                <span className="text-white font-bold text-xl">L</span>
              </div>
            </div>

            <h2 
              id="leumit-affiliation-heading"
              className="heading-2 text-slate-900 mb-4"
            >
              חברת בת של לאומית שירותי בריאות
            </h2>

            <p className="body-large text-slate-600 mb-6">
              WeCcelerate הוקמה בשנת 2015 כחברת בת בבעלות מלאה של לאומית שירותי בריאות,
              קופת החולים השלישית בגודלה בישראל עם למעלה מ-2.3 מיליון מבוטחים.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">גוף מוכר רשמית</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">אישור משרד הבריאות</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">הסמכת ISO 27001</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <aside className="bg-slate-50 p-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
              לאומית שירותי בריאות - במספרים
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-bold text-slate-900">2.3M+</p>
                <p className="text-sm text-slate-600">מבוטחים</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">450+</p>
                <p className="text-sm text-slate-600">מרפאות</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">70+</p>
                <p className="text-sm text-slate-600">שנות פעילות</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">8,000+</p>
                <p className="text-sm text-slate-600">עובדים</p>
              </div>
            </div>

            <a 
              href="https://leumit.co.il"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-slate-900 hover:text-yellow-600 transition-colors"
            >
              לאתר לאומית
              <ExternalLink className="w-4 h-4" />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// STORY SECTION (Scroll-telling)
// =============================================================================

function StorySection() {
  return (
    <article 
      className="section-padding bg-slate-50"
      aria-labelledby="story-heading"
    >
      <div className="container-corporate">
        {/* Section Header */}
        <header className="max-w-2xl mb-16">
          <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
            הסיפור שלנו
          </span>
          <h2 id="story-heading" className="heading-1 text-slate-900 mt-3 mb-4">
            מהחזון למציאות
          </h2>
          <p className="body-large text-slate-600">
            המסע שלנו התחיל עם שאלה פשוטה: איך אפשר לרתום את הכוח של חדשנות
            טכנולוגית כדי לשפר את בריאות האוכלוסייה בישראל?
          </p>
        </header>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute right-8 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />

          {/* Milestones */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="relative md:pr-24">
                {/* Year badge */}
                <div className="absolute right-0 top-0 w-16 h-16 bg-slate-900 flex items-center justify-center hidden md:flex">
                  <span className="text-yellow-400 font-bold">{milestone.year}</span>
                </div>

                {/* Content */}
                <div className="bg-white p-6 md:p-8 border border-slate-100 shadow-sm">
                  <span className="md:hidden text-yellow-600 font-bold text-sm">
                    {milestone.year}
                  </span>
                  <h3 className="heading-3 text-slate-900 mt-1 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-slate-600">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

// =============================================================================
// VISION & VALUES SECTION
// =============================================================================

function VisionSection() {
  const values = [
    {
      icon: Lightbulb,
      title: 'חדשנות',
      description: 'אנו מאמינים בכוחה של טכנולוגיה לשנות את עולם הבריאות',
    },
    {
      icon: Heart,
      title: 'אמפתיה',
      description: 'בלב כל מה שאנחנו עושים עומד המטופל והצרכים שלו',
    },
    {
      icon: Users,
      title: 'שותפות',
      description: 'מאמינים בכוחה של קהילה וליווי צמוד של היזמים',
    },
    {
      icon: Target,
      title: 'מצוינות',
      description: 'שואפים לסטנדרטים הגבוהים ביותר בכל פעילות',
    },
  ];

  return (
    <section 
      className="section-padding bg-slate-900"
      aria-labelledby="vision-heading"
    >
      <div className="container-corporate">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Vision */}
          <div>
            <span className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">
              החזון שלנו
            </span>
            <h2 id="vision-heading" className="heading-1 text-white mt-3 mb-6">
              להוביל את מהפכת הבריאות הדיגיטלית בישראל
            </h2>
            <p className="body-large text-slate-300 mb-8">
              אנחנו שואפים להיות הפלטפורמה המובילה להאצת סטארטאפים בתחום הבריאות,
              ולהפוך את ישראל למרכז עולמי לחדשנות רפואית.
            </p>

            {/* Mission Statement */}
            <blockquote className="border-r-4 border-yellow-500 pr-6 py-2">
              <p className="text-xl text-white font-light italic">
                "לגשר בין רעיונות פורצי דרך לבין השפעה אמיתית על בריאות האנשים"
              </p>
              <footer className="mt-4 text-slate-400">
                — ד"ר יוסי כהן, מנכ"ל ומייסד
              </footer>
            </blockquote>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-slate-800/50 p-6">
                <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-slate-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// TEAM SECTION
// =============================================================================

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article 
      className="group"
      itemScope
      itemType="https://schema.org/Person"
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-slate-200">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          itemProp="image"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label={`LinkedIn של ${member.name}`}
                  itemProp="sameAs"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label={`אימייל ל${member.name}`}
                  itemProp="email"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-lg font-semibold text-slate-900" itemProp="name">
        {member.name}
      </h3>
      <p className="text-sm text-yellow-600 font-medium mb-2" itemProp="jobTitle">
        {member.role}
      </p>
      <p className="text-sm text-slate-600 mb-3" itemProp="description">
        {member.bio}
      </p>

      {/* Credentials */}
      {member.credentials && (
        <ul className="flex flex-wrap gap-2">
          {member.credentials.map((credential) => (
            <li 
              key={credential}
              className="text-xs bg-slate-100 text-slate-600 px-2 py-1"
              itemProp="knowsAbout"
            >
              {credential}
            </li>
          ))}
        </ul>
      )}

      {/* Hidden schema data */}
      <meta itemProp="alternateName" content={member.nameEn} />
      <link itemProp="sameAs" href={member.linkedin || ''} />
    </article>
  );
}

function TeamSection() {
  return (
    <section 
      className="section-padding bg-white"
      aria-labelledby="team-heading"
    >
      <div className="container-corporate">
        {/* Header */}
        <header className="max-w-2xl mb-16">
          <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
            הצוות שלנו
          </span>
          <h2 id="team-heading" className="heading-1 text-slate-900 mt-3 mb-4">
            הנהגה מנוסה, חזון ברור
          </h2>
          <p className="body-large text-slate-600">
            הצוות המוביל שלנו משלב ניסיון רב שנים בתעשיית הבריאות, טכנולוגיה וניהול סטארטאפים.
          </p>
        </header>

        {/* Leadership Team */}
        <div className="mb-20">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
            צוות הנהלה
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadershipTeam.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Advisory Board */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
            ועדה מייעצת
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {advisoryBoard.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// PARTNERS MARQUEE SECTION
// =============================================================================

function PartnersSection() {
  return (
    <section 
      className="py-12 bg-slate-50 border-t border-b border-slate-100 overflow-hidden"
      aria-label="שותפים ומשתפי פעולה"
    >
      <div className="container-corporate mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
          שותפים ומשתפי פעולה
        </h2>
      </div>

      {/* Scrolling Marquee */}
      <div className="relative">
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10" />

        {/* Scrolling content - using Tailwind animate class */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {/* First set */}
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 mx-12 flex items-center justify-center h-16 w-40 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
              aria-label={partner.name}
            >
              {/* Placeholder for logo */}
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-200 mx-auto mb-1 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-xs text-slate-500">{partner.name}</span>
              </div>
            </a>
          ))}
          
          {/* Duplicate for seamless loop */}
          {partners.map((partner) => (
            <a
              key={`${partner.name}-dup`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 mx-12 flex items-center justify-center h-16 w-40 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
              aria-label={partner.name}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-200 mx-auto mb-1 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-xs text-slate-500">{partner.name}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// CTA SECTION
// =============================================================================

function CTASection() {
  return (
    <section className="section-padding bg-slate-900">
      <div className="container-corporate text-center">
        <h2 className="heading-1 text-white mb-6">
          רוצים להצטרף למהפכה?
        </h2>
        <p className="body-large text-slate-400 max-w-2xl mx-auto mb-10">
          אם יש לכם רעיון שיכול לשנות את עולם הבריאות, נשמח לשמוע ממכם.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-yellow-500 text-slate-900 px-8 py-4 font-semibold hover:bg-yellow-400 transition-colors"
          >
            הגישו מועמדות
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 font-medium hover:bg-white/10 transition-colors"
          >
            צרו קשר
          </Link>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="about-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateAboutPageSchema()),
        }}
      />

      <main id="main-content">
        {/* Hero */}
        <HeroSection />

        {/* Leumit Affiliation - Critical for Trust */}
        <LeumitAffiliationSection />

        {/* Our Story */}
        <StorySection />

        {/* Vision & Values */}
        <VisionSection />

        {/* Team */}
        <TeamSection />

        {/* Partners */}
        <PartnersSection />

        {/* CTA */}
        <CTASection />
      </main>
    </>
  );
}