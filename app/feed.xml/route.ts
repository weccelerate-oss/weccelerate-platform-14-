import { NextResponse } from 'next/server';
import { getNewsUpdates } from '@/lib/db-repository';
import { SITE_CONFIG } from '@/lib/seo';

export const revalidate = 600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(date: Date | string | null | undefined): string {
  const d = date ? new Date(date) : new Date();
  return d.toUTCString();
}

export async function GET() {
  const siteUrl = SITE_CONFIG.url;
  const feedUrl = `${siteUrl}/feed.xml`;
  const now = new Date();

  let items: Array<{
    title: string;
    link: string | null;
    excerpt: string | null;
    publishAt: Date;
    imageUrl: string | null;
    id: string;
  }> = [];

  try {
    const news = await getNewsUpdates({ limit: 50 });
    items = news.map((n: {
      id: string;
      title: string;
      link: string | null;
      excerpt: string | null;
      publishAt: Date;
      imageUrl: string | null;
    }) => ({
      id: n.id,
      title: n.title,
      link: n.link,
      excerpt: n.excerpt,
      publishAt: n.publishAt,
      imageUrl: n.imageUrl,
    }));
  } catch {
    items = [];
  }

  const rssItems = items
    .map((item) => {
      const itemUrl = item.link && item.link.startsWith('http')
        ? item.link
        : `${siteUrl}/blog#${item.id}`;
      const description = item.excerpt ?? item.title;
      const pubDate = toRfc822(item.publishAt);
      const enclosure = item.imageUrl
        ? `      <enclosure url="${escapeXml(item.imageUrl)}" type="image/jpeg" />\n`
        : '';

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(itemUrl)}</link>
      <guid isPermaLink="false">${escapeXml(`${siteUrl}/news/${item.id}`)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
${enclosure}    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>WeCcelerate — עדכונים, חדשות ומאמרים</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>עדכונים, חדשות ותכני בלוג של WeCcelerate — Venture Builder ומאיץ הסטארטאפים המוביל בישראל.</description>
    <language>he-IL</language>
    <copyright>© ${now.getFullYear()} WeCcelerate Ltd.</copyright>
    <lastBuildDate>${toRfc822(now)}</lastBuildDate>
    <generator>Next.js (WeCcelerate)</generator>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${escapeXml(siteUrl)}/logo.png</url>
      <title>WeCcelerate</title>
      <link>${escapeXml(siteUrl)}</link>
    </image>
${rssItems}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
