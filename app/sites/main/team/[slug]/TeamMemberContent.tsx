'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import type { TeamPerson } from '@/lib/seo/founders';

// =============================================================================
// PROPS
// =============================================================================
// page.tsx (server) fetches the member + related content and passes plain,
// serializable data down. All static UI chrome is translated via t('team.*');
// stored member fields prefer their English variant in EN locale, else fall
// back to Hebrew (we never invent translations for stored bios/names).

export interface RelatedGuide {
  slug: string;
  h1: string;
  metaDescription: string;
}

export interface RelatedPress {
  id: string;
  /** Hebrew (or fallback) outlet name. */
  outletName: string;
  /** English outlet name. */
  outletNameEn: string;
  /** ISO date string — formatted per-locale on the client. */
  date: string;
  title: string;
  excerpt?: string;
  url?: string;
}

interface TeamMemberContentProps {
  person: TeamPerson;
  expertGuides: RelatedGuide[];
  personPress: RelatedPress[];
}

export default function TeamMemberContent({
  person,
  expertGuides,
  personPress,
}: TeamMemberContentProps) {
  const { t, lang } = useLanguage();

  // Prefer stored English fields in EN locale, fall back to Hebrew.
  const en = lang === 'en';
  const name = en && person.nameEn ? person.nameEn : person.name;
  const role = en && person.roleEn ? person.roleEn : person.role;
  const bio = en && person.bioEn ? person.bioEn : person.bio;

  const imageAlt = t('team.image.alt')
    .replace('{name}', name)
    .replace('{role}', role);

  return (
    <main className="min-h-screen bg-white" id="main-content">
      <article className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">{t('team.breadcrumb.home')}</Link>
          <span className="mx-2">›</span>
          <Link href="/team" className="hover:text-slate-900">{t('team.breadcrumb.team')}</Link>
          <span className="mx-2">›</span>
          <span aria-current="page" className="text-slate-900">{name}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="relative h-44 w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:h-48 md:w-48">
            <Image
              src={person.image}
              alt={imageAlt}
              fill
              priority
              sizes="192px"
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">
              {name}
            </h1>
            <p className="mb-1 text-lg font-medium text-blue-700">{role}</p>
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
          <h2 className="mb-3 text-xl font-bold text-slate-900">{t('team.bio.title')}</h2>
          <p data-speakable className="leading-relaxed text-slate-700">
            {bio}
          </p>
        </section>

        {/* Expert in / contributing to */}
        {expertGuides.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              {t('team.guides.title').replace('{name}', name)}
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
            <h2 className="mb-4 text-xl font-bold text-slate-900">{t('team.press.title')}</h2>
            <ul className="space-y-3">
              {personPress.map((mention) => {
                const dateFormatted = new Date(mention.date).toLocaleDateString(
                  lang === 'en' ? 'en-US' : 'he-IL',
                  { day: 'numeric', month: 'long', year: 'numeric' },
                );
                const content = (
                  <article className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm">
                    <div className="mb-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {en ? mention.outletNameEn : mention.outletName}
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
          <h2 className="mb-3 text-xl font-bold">
            {t('team.cta.title').replace('{name}', name)}
          </h2>
          <p className="mb-5 text-slate-300">
            {t('team.cta.text')}
          </p>
          <a
            href={`mailto:info@weccelerate.co.il?subject=Press%20inquiry%20%E2%80%94%20${encodeURIComponent(person.nameEn)}`}
            className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            {t('team.cta.email')}
          </a>
        </section>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/team" className="hover:text-slate-900">
            {t('team.back')}
          </Link>
        </p>
      </article>
    </main>
  );
}
