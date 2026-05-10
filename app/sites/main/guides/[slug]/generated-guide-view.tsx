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

      <article className="min-h-screen bg-white" id="main-content">
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16" dir="rtl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <Link href="/guides" className="hover:text-slate-900">מדריכים</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">{g.titleHe}</span>
          </nav>

          <header className="mb-8">
            <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700">
                {g.category}
              </span>
              {g.wordCount && <span>{Math.ceil(g.wordCount / 220)} דק׳ קריאה</span>}
              <span>·</span>
              <time dateTime={date.slice(0, 10)}>פורסם {date.slice(0, 10)}</time>
            </div>
            <h1 className="mb-5 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {g.titleHe}
            </h1>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
                תקציר
              </div>
              <p data-speakable className="text-lg leading-relaxed text-slate-900">
                {g.metaDescription}
              </p>
            </div>
          </header>

          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-blue-700">
            {blocks}
          </div>
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
        <ul key={`l${out.length}`} className="my-4 list-disc space-y-1.5 pr-6">
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
        <p key={`p${out.length}`} className="my-4 leading-relaxed text-slate-700">
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
      out.push(<h2 key={`h${out.length}`} className="mt-10 mb-4 text-2xl font-bold text-slate-900">{line.slice(3)}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph(); flushList();
      out.push(<h3 key={`h${out.length}`} className="mt-6 mb-3 text-xl font-semibold text-slate-900">{line.slice(4)}</h3>);
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
      parts.push(<a key={key++} href={m[3]} className="text-blue-700 hover:underline">{m[2]}</a>);
    } else if (m[4]) {
      parts.push(<strong key={key++} className="font-semibold">{m[5]}</strong>);
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
