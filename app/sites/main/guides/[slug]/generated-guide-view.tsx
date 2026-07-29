/**
 * Renders an agent-generated guide (from prisma.generatedGuide) as a public
 * /guides/[slug] page.
 *
 * The static catalog at lib/seo/guides-catalog.ts uses a rich shape with
 * sections + paragraphs + howToSteps. Agent-generated guides hold raw
 * markdown instead, so we render them with a minimal markdown→JSX
 * converter and emit the same Article + FAQ + Breadcrumb schemas the
 * static path emits.
 */

import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/seo';

// Local type — avoids importing from @prisma/client before the user has
// regenerated the client (post-db:push). Mirrors the GeneratedGuide model
// in prisma/schema.prisma.
export interface GeneratedGuide {
  id: string;
  slug: string;
  titleHe: string;
  titleEn: string | null;
  metaDescription: string;
  category: string;
  contentHe: string;
  contentEn: string | null;
  featuredImageUrl: string | null;
  socialImageUrl: string | null;
  modelChain: string[];
  citedSources: string[];
  internalLinks: string[];
  targetKeyword?: string | null;
  relatedKeywords?: string[];
  factCheckScore: number | null;
  seoScore: number | null;
  wordCount: number | null;
  status: string;
  publishedAt: Date | null;
  retractedAt: Date | null;
  retractReason: string | null;
  firstCitedAt: Date | null;
  citationCount: number;
  botVisits: number;
  createdAt: Date;
  updatedAt: Date;
}

export function renderGeneratedGuide(g: GeneratedGuide) {
  const url = `${SITE_CONFIG.url}/guides/${g.slug}`;
  const date = (g.publishedAt ?? g.createdAt).toISOString();

  // Pull FAQ pairs out of the markdown so we can build FAQPage schema.
  const faqs = extractFaqs(g.contentHe);
  const blocks = parseMarkdown(g.contentHe);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: g.titleHe,
    description: g.metaDescription,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'he-IL',
    datePublished: date,
    dateModified: g.updatedAt.toISOString(),
    author: {
      '@id': `${SITE_CONFIG.url}/#organization`,
      '@type': 'Organization',
      name: 'WeCcelerate',
    },
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
      '@type': 'Organization',
      name: 'WeCcelerate',
      logo: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/logo.png` },
    },
    wordCount: g.wordCount ?? undefined,
    image: g.featuredImageUrl ?? `${SITE_CONFIG.url}/logo.png`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-speakable]'],
    },
    // Keyword surfaces. The static catalog pages have always emitted these;
    // agent-generated guides had no targetKeyword to emit, so their Article
    // schema was thinner than the hand-written ones. Guides commissioned from
    // a keyword brief now carry the phrase they were written to win.
    ...(g.targetKeyword
      ? {
          alternativeHeadline: g.targetKeyword,
          about: { '@type': 'Thing', name: g.targetKeyword },
          keywords: [g.targetKeyword, ...(g.relatedKeywords ?? [])].join(', '),
        }
      : {}),
  };

  const faqSchema = faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: 'he-IL',
        mainEntity: faqs.map((f, i) => ({
          '@type': 'Question',
          '@id': `${url}#faq-${i + 1}`,
          position: i + 1,
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
            inLanguage: 'he-IL',
          },
        })),
      }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
      { '@type': 'ListItem', position: 2, name: 'מדריכים', item: `${SITE_CONFIG.url}/guides` },
      { '@type': 'ListItem', position: 3, name: g.titleHe, item: url },
    ],
  };

  const schemas = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

      <article
        className="min-h-screen bg-[#070b1e] text-white font-heebo"
        id="main-content"
        dir="rtl"
      >
        <header className="relative overflow-hidden border-b border-white/5 pt-28 pb-12 md:pt-36 md:pb-16">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(200,169,81,0.10) 0%, transparent 70%)',
            }}
          />
          <div className="container mx-auto px-4 relative z-10 max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/80 transition-colors">בית</Link>
              <span className="mx-2">›</span>
              <Link href="/guides" className="hover:text-white/80 transition-colors">מדריכים</Link>
              <span className="mx-2">›</span>
              <span aria-current="page" className="text-white/80">{g.titleHe}</span>
            </nav>

            <div className="mb-3 flex items-center gap-3 text-xs text-white/40">
              <span className="rounded-full border border-[#c8a951]/30 bg-[#c8a951]/10 px-3 py-1 font-semibold text-[#e8d48b] uppercase tracking-wider">
                {g.category}
              </span>
              {g.wordCount && <span>{Math.ceil(g.wordCount / 220)} דק׳ קריאה</span>}
              <span>·</span>
              <time dateTime={date.slice(0, 10)}>פורסם {date.slice(0, 10)}</time>
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight">
              {g.titleHe}
            </h1>
            <div className="rounded-2xl border border-[#c8a951]/25 bg-gradient-to-br from-[#c8a951]/[0.08] via-transparent to-[#c8a951]/[0.04] p-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#c8a951]">
                תקציר
              </div>
              <p data-speakable className="text-lg leading-relaxed text-white">
                {g.metaDescription}
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
          <div className="space-y-1 text-white/75 leading-relaxed">{blocks}</div>
        </div>
      </article>
    </>
  );
}

// =============================================================================
// MINIMAL MARKDOWN PARSER
// =============================================================================

interface FaqPair {
  q: string;
  a: string;
}

function extractFaqs(markdown: string): FaqPair[] {
  // Look for a "## שאלות נפוצות" section, then ### Q / paragraph A pairs.
  const idx = markdown.search(/##\s*שאלות נפוצות/);
  if (idx < 0) return [];
  const tail = markdown.slice(idx);
  const pairs: FaqPair[] = [];
  const re = /###\s*(.+?)\n+([^#]+?)(?=\n###|\n##|\n*$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tail)) !== null) {
    pairs.push({ q: m[1].trim(), a: m[2].trim() });
  }
  return pairs;
}

function parseMarkdown(md: string): React.ReactNode[] {
  const lines = md.split('\n');
  const out: React.ReactNode[] = [];
  let buffer: string[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      out.push(
        <ul key={`l${out.length}`} className="my-4 list-disc space-y-1.5 pr-6 marker:text-[#c8a951]">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };

  const flushParagraph = () => {
    if (buffer.length > 0) {
      out.push(
        <p key={`p${out.length}`} className="my-4 leading-relaxed text-white/75">
          {renderInline(buffer.join(' '))}
        </p>,
      );
      buffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    if (line.startsWith('# ')) { flushParagraph(); flushList(); continue; /* h1 already in header */ }
    if (line.startsWith('## ')) {
      flushParagraph(); flushList();
      out.push(<h2 key={`h${out.length}`} className="mt-10 mb-4 text-2xl md:text-3xl font-bold tracking-tight text-white">{line.slice(3)}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph(); flushList();
      out.push(<h3 key={`h${out.length}`} className="mt-6 mb-3 text-xl font-semibold text-[#e8d48b]">{line.slice(4)}</h3>);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph();
      listBuffer.push(line.replace(/^\s*[-*]\s+/, ''));
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      // Numbered list — treat the same as bullet for simplicity.
      flushParagraph();
      listBuffer.push(line.replace(/^\s*\d+\.\s+/, ''));
      continue;
    }
    buffer.push(line);
  }
  flushParagraph();
  flushList();
  return out;
}

function renderInline(text: string): React.ReactNode {
  // Handle [text](url) and **bold** in one pass.
  const parts: React.ReactNode[] = [];
  const re = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    if (m[1]) {
      parts.push(<a key={key++} href={m[3]} className="text-[#e8d48b] hover:text-[#c8a951] hover:underline">{m[2]}</a>);
    } else if (m[4]) {
      // Recurse so links nested inside bold — David's favorite CTA pattern
      // **[text](url)** — render as links instead of raw markdown.
      parts.push(<strong key={key++} className="font-semibold">{renderInline(m[5])}</strong>);
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
