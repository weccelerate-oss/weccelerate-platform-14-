import { headers } from 'next/headers';
import { SiteConfig, SiteKey, getSiteByKey } from '@/config/sites';

/**
 * Get the current site context in Server Components
 * Uses headers set by middleware
 */
export async function getSiteContext(): Promise<{
  site: SiteConfig;
  siteKey: SiteKey;
  subdomain: string | null;
}> {
  const headersList = await headers();
  
  const siteKey = (headersList.get('x-site') as SiteKey) || 'main';
  const subdomain = headersList.get('x-subdomain');
  
  return {
    site: getSiteByKey(siteKey),
    siteKey,
    subdomain: subdomain === 'main' ? null : subdomain,
  };
}

/**
 * Get just the site key for quick checks
 */
export async function getCurrentSiteKey(): Promise<SiteKey> {
  const headersList = await headers();
  return (headersList.get('x-site') as SiteKey) || 'main';
}
