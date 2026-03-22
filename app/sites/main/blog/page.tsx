/**
 * Blog / News Listing Page — Server Component (Data Fetching Only)
 */

export const revalidate = 3600; // ISR: regenerate every hour

import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { getNewsUpdates } from '@/lib/db-repository';
import { mockNewsUpdates } from '@/lib/mock-data';
import { BlogPageContent } from './BlogPageContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'עדכונים וכתבות | חדשות, מאמרים ותובנות',
  description:
    'כל העדכונים והכתבות של WeCcelerate: חדשות מעולם הסטארטאפים, מאמרים מקצועיים, תובנות מתוכניות ההאצה שלנו ועדכונים שוטפים.',
  keywords: [
    'חדשות סטארטאפים',
    'מאמרים עסקיים',
    'WeCcelerate בלוג',
    'עדכוני חדשנות',
    'תובנות יזמות',
    'Startup News Israel',
    'WeCcelerate Blog',
  ],
  path: '/blog',
  locale: 'he',
});

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getArticlesData() {
  try {
    const news = await getNewsUpdates({ limit: 50, activeOnly: true });
    if (news.length > 0) {
      return news.map((n) => ({
        id: n.id,
        title: n.title,
        excerpt: n.excerpt ?? null,
        link: n.link ?? null,
        urgencyLevel: (n.urgencyLevel ?? 'NORMAL') as string,
        isPinned: n.isPinned ?? false,
        publishAt: n.publishAt ?? n.createdAt,
        imageUrl: (n as Record<string, unknown>).imageUrl as string | null ?? null,
        source: (n as Record<string, unknown>).source as string | null ?? null,
        category: (n as Record<string, unknown>).category as string | null ?? null,
      }));
    }
    return mockNewsUpdates.map((n) => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt ?? null,
      link: n.link ?? null,
      urgencyLevel: (n.urgencyLevel ?? 'normal').toUpperCase(),
      isPinned: n.isPinned ?? false,
      publishAt: new Date(n.createdAt),
      imageUrl: n.imageUrl ?? null,
      source: n.source ?? null,
      category: n.category ?? null,
    }));
  } catch {
    return mockNewsUpdates.map((n) => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt ?? null,
      link: n.link ?? null,
      urgencyLevel: (n.urgencyLevel ?? 'normal').toUpperCase(),
      isPinned: n.isPinned ?? false,
      publishAt: new Date(n.createdAt),
      imageUrl: n.imageUrl ?? null,
      source: n.source ?? null,
      category: n.category ?? null,
    }));
  }
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

// =============================================================================
// ARTICLE LIST SCHEMA (JSON-LD for Google News/Blog Rich Results)
// =============================================================================

function generateBlogSchema(articles: { title: string; excerpt: string | null; link: string | null; publishAt: Date; imageUrl: string | null; source: string | null }[]) {
  const articleItems = articles.slice(0, 15).map((article, i) => ({
    '@type': 'Article',
    position: i + 1,
    headline: article.title,
    description: article.excerpt || article.title,
    datePublished: article.publishAt instanceof Date ? article.publishAt.toISOString() : new Date(article.publishAt).toISOString(),
    ...(article.imageUrl && { image: article.imageUrl }),
    ...(article.link && { url: article.link }),
    author: {
      '@type': 'Organization',
      name: 'WeCcelerate',
      url: 'https://weccelerate.co.il',
    },
    publisher: {
      '@type': 'Organization',
      name: article.source || 'WeCcelerate',
      logo: {
        '@type': 'ImageObject',
        url: 'https://weccelerate.co.il/logo.png',
      },
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://weccelerate.co.il/blog/#articlelist',
    name: 'עדכונים וכתבות — WeCcelerate',
    numberOfItems: articleItems.length,
    itemListElement: articleItems,
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function BlogPage() {
  const articles = await getArticlesData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBlogSchema(articles)),
        }}
      />
      <BlogPageContent articles={articles} />
    </>
  );
}
