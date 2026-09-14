import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANDING_PAGES, getLandingPage } from '@/lib/landing-pages';
import { LandingContent } from './LandingContent';

/**
 * Paid-traffic landing pages. noindex: organic visitors get /services/*.
 * The main layout drops the navbar under /lp (see UnlessPath).
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return { title: 'WeCcelerate', robots: { index: false, follow: false } };
  return {
    title: page.metaTitle,
    description: page.sub,
    robots: { index: false, follow: false },
    alternates: { canonical: `https://weccelerate.co.il/services/${page.service}` },
  };
}

export default async function LandingPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();
  return <LandingContent page={page} />;
}
