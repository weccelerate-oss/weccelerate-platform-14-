/**
 * Robots.txt Configuration
 * 
 * Controls search engine crawling with proper rules for:
 * - Main site (fully indexable)
 * - Subdomains (selective indexing)
 * - Protected areas (no indexing)
 * 
 * @module app/robots
 */

import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;
  
  const publicDisallow = ['/api/', '/admin/', '/portal/'];

  return {
    rules: [
      // Default — all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [...publicDisallow, '/_next/', '/private/'],
      },
      // Google (search + AI Overviews)
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: publicDisallow,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: publicDisallow,
      },
      // Bing (search + Copilot)
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: publicDisallow,
      },
      // OpenAI (ChatGPT, GPT search)
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: publicDisallow,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: publicDisallow,
      },
      // Anthropic (Claude)
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: publicDisallow,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: publicDisallow,
      },
      // Perplexity AI
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: publicDisallow,
      },
      // Meta AI
      {
        userAgent: 'FacebookBot',
        allow: '/',
        disallow: publicDisallow,
      },
      // Apple (Siri, Spotlight)
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: publicDisallow,
      },
      // Yandex
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: publicDisallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
