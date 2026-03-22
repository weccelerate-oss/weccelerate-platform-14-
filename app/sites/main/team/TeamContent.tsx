'use client';

/**
 * TeamContent — Client wrapper for the Team page.
 * All UI text uses useLanguage() / t() for i18n.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import {
  ArrowLeft,
  ArrowRight,
  Linkedin,
  Users,
  Award,
  Star,
  Youtube,
  Briefcase,
} from 'lucide-react';

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
  credentials?: string[];
}

const advisoryBoard: TeamMember[] = [
  {
    id: 'sharon',
    name: '\u05E9\u05E8\u05D5\u05DF',
    nameEn: 'Sharon',
    role: '\u05D7\u05D1\u05E8 \u05D5\u05E2\u05D3\u05D4 \u05DE\u05D9\u05D9\u05E2\u05E6\u05EA',
    roleEn: 'Advisory Board Member',
    bio: '\u05DE\u05D5\u05DE\u05D7\u05D4 \u05D1\u05DB\u05D9\u05E8 \u05D1\u05EA\u05E2\u05E9\u05D9\u05D9\u05EA \u05D4\u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D5\u05D4\u05D7\u05D3\u05E9\u05E0\u05D5\u05EA \u05D1\u05D9\u05E9\u05E8\u05D0\u05DC.',
    image: '/images/team/sharon.jpg',
    credentials: ['\u05D5\u05E2\u05D3\u05D4 \u05DE\u05D9\u05D9\u05E2\u05E6\u05EA'],
  },
  {
    id: 'on',
    name: '\u05D0\u05D5\u05DF',
    nameEn: 'On',
    role: '\u05D7\u05D1\u05E8 \u05D5\u05E2\u05D3\u05D4 \u05DE\u05D9\u05D9\u05E2\u05E6\u05EA',
    roleEn: 'Advisory Board Member',
    bio: '\u05E0\u05D9\u05E1\u05D9\u05D5\u05DF \u05E2\u05E9\u05D9\u05E8 \u05D1\u05DC\u05D9\u05D5\u05D5\u05D9 \u05E1\u05D8\u05D0\u05E8\u05D8\u05D0\u05E4\u05D9\u05DD \u05DE\u05D4\u05E8\u05E2\u05D9\u05D5\u05DF \u05DC\u05E9\u05D5\u05E7.',
    image: '/images/team/on.jpg',
    credentials: ['\u05D5\u05E2\u05D3\u05D4 \u05DE\u05D9\u05D9\u05E2\u05E6\u05EA'],
  },
  {
    id: 'elia',
    name: '\u05D0\u05DC\u05D9\u05D4',
    nameEn: 'Elia',
    role: '\u05D7\u05D1\u05E8 \u05D5\u05E2\u05D3\u05D4 \u05DE\u05D9\u05D9\u05E2\u05E6\u05EA',
    roleEn: 'Advisory Board Member',
    bio: '\u05E8\u05E7\u05E2 \u05E2\u05DE\u05D5\u05E7 \u05D1\u05E4\u05D9\u05EA\u05D5\u05D7 \u05E2\u05E1\u05E7\u05D9 \u05D5\u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05D4 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05EA.',
    image: '/images/team/elia.jpg',
    credentials: ['\u05D5\u05E2\u05D3\u05D4 \u05DE\u05D9\u05D9\u05E2\u05E6\u05EA'],
  },
  {
    id: 'shahar',
    name: '\u05E9\u05D7\u05E8',
    nameEn: 'Shahar',
    role: '\u05D7\u05D1\u05E8 \u05D5\u05E2\u05D3\u05D4 \u05DE\u05D9\u05D9\u05E2\u05E6\u05EA',
    roleEn: 'Advisory Board Member',
    bio: '\u05DE\u05D5\u05DE\u05D7\u05D4 \u05D1\u05D4\u05E9\u05E7\u05E2\u05D5\u05EA \u05D5\u05E4\u05D9\u05EA\u05D5\u05D7 \u05D0\u05E7\u05D5\u05E1\u05D9\u05E1\u05D8\u05DD \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9.',
    image: '/images/team/shahar.jpg',
    credentials: ['\u05D5\u05E2\u05D3\u05D4 \u05DE\u05D9\u05D9\u05E2\u05E6\u05EA'],
  },
];

const coreTeam: TeamMember[] = [
  {
    id: 'tomer',
    name: '\u05EA\u05D5\u05DE\u05E8',
    nameEn: 'Tomer',
    role: '\u05E6\u05D5\u05D5\u05EA \u05DE\u05D5\u05D1\u05D9\u05DC',
    roleEn: 'Core Team',
    bio: '\u05DC\u05D9\u05D5\u05D5\u05D9 \u05E1\u05D8\u05D0\u05E8\u05D8\u05D0\u05E4\u05D9\u05DD \u05DE\u05D4\u05D0\u05E4\u05D9\u05D5\u05DF \u05D4\u05E8\u05D0\u05E9\u05D5\u05E0\u05D9 \u05D5\u05E2\u05D3 \u05D4\u05E9\u05E7\u05D4 \u05D1\u05E9\u05D5\u05E7.',
    image: '/images/team/tomer.jpg',
  },
  {
    id: 'meital',
    name: '\u05DE\u05D9\u05D8\u05DC',
    nameEn: 'Meital',
    role: '\u05E4\u05D9\u05E0\u05E0\u05E1\u05D9\u05DD',
    roleEn: 'Finance',
    bio: '\u05E0\u05D9\u05D4\u05D5\u05DC \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9, \u05EA\u05E7\u05E6\u05D9\u05D1 \u05D5\u05EA\u05DB\u05E0\u05D5\u05DF \u05DB\u05DC\u05DB\u05DC\u05D9 \u05DC\u05DE\u05D9\u05D6\u05DE\u05D9\u05DD.',
    image: '/images/team/meital.jpg',
    credentials: ['\u05E4\u05D9\u05E0\u05E0\u05E1\u05D9\u05DD'],
  },
  {
    id: 'susan',
    name: '\u05E1\u05D5\u05D6\u05DF \u05D4\u05DC\u05E4\u05E8\u05D8',
    nameEn: 'Susan Halperlt',
    role: '\u05E6\u05D5\u05D5\u05EA \u05DE\u05D5\u05D1\u05D9\u05DC',
    roleEn: 'Core Team',
    bio: '\u05DE\u05D5\u05DE\u05D7\u05D9\u05EA \u05D1\u05E4\u05D9\u05EA\u05D5\u05D7 \u05E2\u05E1\u05E7\u05D9 \u05D1\u05D9\u05E0\u05DC\u05D0\u05D5\u05DE\u05D9 \u05D5\u05D9\u05E6\u05D9\u05E8\u05EA \u05E9\u05D5\u05EA\u05E4\u05D5\u05D9\u05D5\u05EA \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05D5\u05EA.',
    image: '/images/team/susan.jpg',
  },
  {
    id: 'amir-shaul',
    name: '\u05D0\u05DE\u05D9\u05E8 \u05E9\u05D0\u05D5\u05DC',
    nameEn: 'Amir Shaul',
    role: '\u05E6\u05D5\u05D5\u05EA \u05DE\u05D5\u05D1\u05D9\u05DC',
    roleEn: 'Core Team',
    bio: '\u05E0\u05D9\u05E1\u05D9\u05D5\u05DF \u05D1\u05E0\u05D9\u05D4\u05D5\u05DC \u05DE\u05D5\u05E6\u05E8 \u05D5\u05DC\u05D9\u05D5\u05D5\u05D9 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9 \u05DC\u05E1\u05D8\u05D0\u05E8\u05D8\u05D0\u05E4\u05D9\u05DD.',
    image: '/images/team/amir-shaul.jpg',
  },
  {
    id: 'dani-topaz',
    name: '\u05D3\u05E0\u05D9 \u05D8\u05D5\u05E4\u05D6',
    nameEn: 'Dani Topaz',
    role: '\u05E6\u05D5\u05D5\u05EA \u05DE\u05D5\u05D1\u05D9\u05DC',
    roleEn: 'Core Team',
    bio: '\u05DE\u05D5\u05DE\u05D7\u05D4 \u05D1\u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05D4 \u05E2\u05E1\u05E7\u05D9\u05EA \u05D5\u05D7\u05D9\u05D1\u05D5\u05E8 \u05DC\u05E9\u05D5\u05E7.',
    image: '/images/team/dani-topaz.jpg',
  },
];

const ecosystemPartners = [
  {
    name: '\u05DC\u05D0\u05D5\u05DE\u05D9\u05EA \u05E9\u05D9\u05E8\u05D5\u05EA\u05D9 \u05D1\u05E8\u05D9\u05D0\u05D5\u05EA',
    nameEn: 'Leumit Health Care',
    role: '\u05E9\u05D5\u05EA\u05E3 \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9',
    description: '\u05D2\u05D9\u05E9\u05D4 \u05DC\u05D3\u05D0\u05D8\u05D4 \u05E8\u05E4\u05D5\u05D0\u05D9, \u05E4\u05D9\u05D9\u05DC\u05D5\u05D8\u05D9\u05DD \u05E7\u05DC\u05D9\u05E0\u05D9\u05D9\u05DD \u05D5\u05D4\u05DB\u05D5\u05D5\u05E0\u05D4 \u05E8\u05D2\u05D5\u05DC\u05D8\u05D5\u05E8\u05D9\u05EA.',
  },
  {
    name: '\u05D4\u05E8\u05E6\u05D5\u05D2 \u05E4\u05D5\u05E7\u05E1 \u05E0\u05D0\u05DE\u05DF',
    nameEn: 'Herzog Fox & Neeman',
    role: '\u05D9\u05D9\u05E2\u05D5\u05E5 \u05DE\u05E9\u05E4\u05D8\u05D9',
    description: '\u05DC\u05D9\u05D5\u05D5\u05D9 \u05DE\u05E9\u05E4\u05D8\u05D9 \u2014 \u05D4\u05E1\u05DB\u05DE\u05D9 \u05D4\u05E9\u05E7\u05E2\u05D4, IP \u05D5\u05E8\u05D2\u05D5\u05DC\u05E6\u05D9\u05D4.',
  },
  {
    name: '\u05D2\u05D5\u05E8\u05E0\u05D9\u05E6\u05E7\u05D9',
    nameEn: 'Gornitzky & Co.',
    role: '\u05D9\u05D9\u05E2\u05D5\u05E5 \u05DE\u05E9\u05E4\u05D8\u05D9',
    description: '\u05D9\u05D9\u05E2\u05D5\u05E5 \u05DE\u05E9\u05E4\u05D8\u05D9 \u05D1\u05EA\u05D7\u05D5\u05DE\u05D9 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D5\u05D4\u05E1\u05DB\u05DE\u05D9\u05DD \u05DE\u05E1\u05D7\u05E8\u05D9\u05D9\u05DD.',
  },
  {
    name: '\u05D0\u05E4\u05E8\u05D9\u05E7\u05D4 \u05D9\u05E9\u05E8\u05D0\u05DC',
    nameEn: 'Africa Israel',
    role: '\u05E9\u05D5\u05EA\u05E3 \u05E2\u05E1\u05E7\u05D9',
    description: '\u05EA\u05E9\u05EA\u05D9\u05D5\u05EA, \u05E0\u05D3\u05DC"\u05DF \u05D5\u05E4\u05D9\u05EA\u05D5\u05D7 \u05E2\u05E1\u05E7\u05D9 \u05DC\u05E1\u05D8\u05D0\u05E8\u05D8\u05D0\u05E4\u05D9\u05DD.',
  },
];

// =============================================================================
// PAGE CONTENT
// =============================================================================

export default function TeamContent() {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="relative bg-[#070b1e] py-20 md:py-28">
        <div className="absolute bottom-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />
        <div className="container-corporate">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t('team.breadcrumb.home')}
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
                {t('team.breadcrumb.current')}
              </li>
            </ol>
          </nav>

          <h1 className="heading-display text-white mb-6">
            {t('team.hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
              {t('team.hero.title2')}
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            {t('team.hero.text')}
          </p>
        </div>
      </section>

      {/* Alon Pinchas -- Founder Spotlight */}
      <section className="section-padding bg-[#070b1e] border-b border-white/[0.06]" aria-labelledby="founder-heading">
        <div className="container-corporate">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-[#c8a951]" />
                <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-wider">
                  {t('team.founder.tag')}
                </span>
              </div>
              <h2 id="founder-heading" className="heading-1 text-white mb-6">
                {t('team.founder.name')}
              </h2>
              <p className="body-large text-white/60 mb-6">
                {t('team.founder.bio')}
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Venture Building', 'MedTech', 'AI & IP Strategy', 'Startup Mentoring'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#c8a951]/10 text-[#c8a951] px-3 py-1.5 font-medium"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
              <a
                href="https://www.youtube.com/@WeCcelerate.Ltd1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white/[0.05] border border-white/[0.06] text-white px-6 py-3 font-semibold hover:bg-white/[0.08] transition-colors"
              >
                <Youtube className="w-5 h-5 text-red-500" />
                {t('team.founder.watchContent')}
              </a>
            </div>

            <div className="relative">
              <div className="aspect-[3/4] max-w-sm mx-auto bg-white/[0.05] overflow-hidden">
                <Image
                  src="/images/team/alon-pinchas.jpg"
                  alt={`${t('team.founder.name')} — ${t('team.founder.tag')}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -end-4 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] px-6 py-3">
                <p className="text-sm font-bold text-[#070b1e]">{t('team.founder.tag')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="section-padding bg-[#0d1321]" aria-labelledby="advisory-heading">
        <div className="container-corporate">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-[#c8a951]" />
            <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-wider">
              {t('team.advisory.tag')}
            </span>
          </div>
          <h2 id="advisory-heading" className="heading-1 text-white mb-4">
            {t('team.advisory.title')}
          </h2>
          <p className="body-large text-white/60 max-w-2xl mb-12">
            {t('team.advisory.text')}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {advisoryBoard.map((member) => (
              <article
                key={member.id}
                className="group"
                itemScope
                itemType="https://schema.org/Person"
              >
                <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-white/[0.05]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    itemProp="image"
                  />
                  {member.linkedin && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 start-4 end-4">
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          aria-label={`LinkedIn - ${member.name}`}
                        >
                          <Linkedin className="w-5 h-5 text-white" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white" itemProp="name">
                  {member.name}
                </h3>
                <p className="text-sm text-[#c8a951] font-medium mb-2" itemProp="jobTitle">
                  {member.role}
                </p>
                <p className="text-sm text-white/60" itemProp="description">
                  {member.bio}
                </p>
                {member.credentials && (
                  <ul className="flex flex-wrap gap-2 mt-3">
                    {member.credentials.map((c) => (
                      <li key={c} className="text-xs bg-white/[0.05] text-white/50 px-2 py-1">
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
                <meta itemProp="alternateName" content={member.nameEn} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Core Team */}
      <section className="section-padding bg-[#070b1e]" aria-labelledby="core-team-heading">
        <div className="container-corporate">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-[#c8a951]" />
            <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-wider">
              {t('team.core.tag')}
            </span>
          </div>
          <h2 id="core-team-heading" className="heading-1 text-white mb-4">
            {t('team.core.title')}
          </h2>
          <p className="body-large text-white/60 max-w-2xl mb-12">
            {t('team.core.text')}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {coreTeam.map((member) => (
              <article
                key={member.id}
                className="group text-center"
                itemScope
                itemType="https://schema.org/Person"
              >
                <div className="relative aspect-square mb-4 overflow-hidden bg-white/[0.05] mx-auto max-w-[200px]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    itemProp="image"
                  />
                </div>
                <h3 className="text-base font-semibold text-white" itemProp="name">
                  {member.name}
                </h3>
                <p className="text-sm text-[#c8a951] font-medium mb-1" itemProp="jobTitle">
                  {member.role}
                </p>
                <p className="text-xs text-white/40" itemProp="description">
                  {member.bio}
                </p>
                <meta itemProp="alternateName" content={member.nameEn} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Ecosystem */}
      <section className="section-padding bg-[#0d1321]" aria-labelledby="partners-heading">
        <div className="container-corporate">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-6 h-6 text-[#c8a951]" />
            <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-wider">
              {t('team.partners.tag')}
            </span>
          </div>
          <h2 id="partners-heading" className="heading-1 text-white mb-4">
            {t('team.partners.title')}
          </h2>
          <p className="body-large text-white/60 max-w-2xl mb-12">
            {t('team.partners.text')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystemPartners.map((partner) => (
              <article
                key={partner.nameEn}
                className="border border-white/[0.06] bg-white/[0.03] p-8 hover:border-[#c8a951]/40 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-1">
                  {partner.name}
                </h3>
                <p className="text-xs font-medium text-[#c8a951] uppercase tracking-wider mb-3">
                  {partner.role}
                </p>
                <p className="text-sm text-white/60">{partner.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#050810] text-center">
        <div className="container-corporate">
          <h2 className="heading-1 text-white mb-6">{t('team.cta.title')}</h2>
          <p className="body-large text-white/40 max-w-xl mx-auto mb-10">
            {t('team.cta.text')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 font-semibold hover:opacity-90 transition-colors"
          >
            {t('team.cta.contact')}
            <DirArrow className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
