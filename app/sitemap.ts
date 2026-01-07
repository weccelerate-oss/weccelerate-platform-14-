/**
 * Dynamic Sitemap Generation
 * 
 * Generates a comprehensive sitemap including:
 * - All static pages
 * - All subdomains (leumit, biz, landing)
 * - Dynamic content (events, videos, blog)
 * - Proper priority and change frequency
 * 
 * @module app/sitemap
 */

import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

// =============================================================================
// STATIC PAGES
// =============================================================================

const STATIC_PAGES = [
  { path: '/', priority: 1.0, changeFreq: 'daily' as const },
  { path: '/about', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/services', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/program', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/portfolio', priority: 0.8, changeFreq: 'weekly' as const },
  { path: '/events', priority: 0.8, changeFreq: 'weekly' as const },
  { path: '/videos', priority: 0.8, changeFreq: 'weekly' as const },
  { path: '/blog', priority: 0.7, changeFreq: 'weekly' as const },
  { path: '/contact', priority: 0.7, changeFreq: 'monthly' as const },
  { path: '/apply', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/faq', priority: 0.7, changeFreq: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
  { path: '/services/incubation', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/services/mvp-development', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/services/regulatory', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/services/funding', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/services/data-access', priority: 0.8, changeFreq: 'monthly' as const },
];

const SUBDOMAIN_PAGES = {
  leumit: [
    { path: '/', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/dashboard', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/services', priority: 0.7, changeFreq: 'monthly' as const },
  ],
  biz: [
    { path: '/', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/dashboard', priority: 0.7, changeFreq: 'daily' as const },
  ],
  landing: [
    { path: '/medtech-2024', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/startup-program', priority: 0.9, changeFreq: 'weekly' as const },
  ],
};

async function getDynamicContent() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const [events, videos] = await Promise.all([
        prisma.event.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
        prisma.video.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      ]);
      return { events, videos };
    } catch {
      return { events: [], videos: [] };
    } finally {
      await prisma.$disconnect();
    }
  } catch {
    return { events: [], videos: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();
  const { events, videos } = await getDynamicContent();
  
  const entries: MetadataRoute.Sitemap = [];
  
  // Static pages (Hebrew + English)
  STATIC_PAGES.forEach((page) => {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFreq,
      priority: page.priority,
    });
    entries.push({
      url: `${baseUrl}/en${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFreq,
      priority: page.priority * 0.9,
    });
  });
  
  // Subdomain pages
  Object.entries(SUBDOMAIN_PAGES).forEach(([sub, pages]) => {
    const subUrl = SITE_CONFIG.subdomains[sub as keyof typeof SITE_CONFIG.subdomains];
    pages.forEach((page) => {
      entries.push({
        url: `${subUrl}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFreq,
        priority: page.priority,
      });
    });
  });
  
  // Dynamic content
  events.forEach((e) => entries.push({ url: `${baseUrl}/events/${e.slug}`, lastModified: e.updatedAt, changeFrequency: 'weekly', priority: 0.7 }));
  videos.forEach((v) => entries.push({ url: `${baseUrl}/videos/${v.slug}`, lastModified: v.updatedAt, changeFrequency: 'monthly', priority: 0.6 }));
  
  return entries;
}
