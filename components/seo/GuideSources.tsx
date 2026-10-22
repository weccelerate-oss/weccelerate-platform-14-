import type { GuideSource } from '@/lib/seo/guides-catalog';

const LABELS = {
  he: { heading: 'מקורות', note: 'העובדות במדריך נבדקו מול המקורות הרשמיים האלה' },
  en: { heading: 'Sources', note: 'The facts in this guide were checked against these official sources' },
};

/** Visible list of the official sources a guide was verified against. */
export function GuideSources({ sources, locale }: { sources?: readonly GuideSource[]; locale: 'he' | 'en' }) {
  if (!sources || sources.length === 0) return null;
  const t = LABELS[locale];
  return (
    <section id="sources" className="mt-14 scroll-mt-24">
      <h2 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight">{t.heading}</h2>
      <p className="mb-4 text-sm text-white/50">{t.note}</p>
      <ol className={`list-decimal space-y-2 text-white/70 ${locale === 'he' ? 'pr-6' : 'pl-6'}`}>
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 hover:text-[#e8d48b]"
            >
              {s.title}
            </a>
            <span className="text-white/45"> · {s.publisher}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
