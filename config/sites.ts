/**
 * Site Configuration
 * Central configuration for all WeCcelerate domains and their settings
 */

export type SiteKey = 'main' | 'leumit' | 'biz' | 'landing';

export interface SiteConfig {
  key: SiteKey;
  name: string;
  domain: string;
  subdomain: string | null;
  description: string;
  theme: {
    primary: string;
    accent: string;
  };
  features: {
    auth: boolean;
    blog: boolean;
    portal: boolean;
  };
}

export const SITES: Record<SiteKey, SiteConfig> = {
  main: {
    key: 'main',
    name: 'WeCcelerate',
    domain: 'weccelerate.co.il',
    subdomain: null,
    description: 'Business Acceleration & Entrepreneurial Services',
    theme: {
      primary: 'royal',
      accent: 'gold',
    },
    features: {
      auth: true,
      blog: true,
      portal: true,
    },
  },
  leumit: {
    key: 'leumit',
    name: 'WeCcelerate Leumit',
    domain: 'leumit.weccelerate.co.il',
    subdomain: 'leumit',
    description: 'Leumit Partner Portal',
    theme: {
      primary: 'teal',
      accent: 'gold',
    },
    features: {
      auth: true,
      blog: false,
      portal: true,
    },
  },
  biz: {
    key: 'biz',
    name: 'WeCcelerate Business',
    domain: 'biz.weccelerate.co.il',
    subdomain: 'biz',
    description: 'Business Dashboard & Operations',
    theme: {
      primary: 'slate',
      accent: 'emerald',
    },
    features: {
      auth: true,
      blog: false,
      portal: true,
    },
  },
  landing: {
    key: 'landing',
    name: 'WeCcelerate Campaigns',
    domain: 'landing.weccelerate.co.il',
    subdomain: 'landing',
    description: 'Marketing Landing Pages',
    theme: {
      primary: 'royal',
      accent: 'coral',
    },
    features: {
      auth: false,
      blog: false,
      portal: false,
    },
  },
};

/**
 * Get site configuration by subdomain
 */
export function getSiteBySubdomain(subdomain: string | null): SiteConfig {
  if (!subdomain) return SITES.main;
  
  const site = Object.values(SITES).find(s => s.subdomain === subdomain);
  return site || SITES.main;
}

/**
 * Get site configuration by key
 */
export function getSiteByKey(key: SiteKey): SiteConfig {
  return SITES[key];
}
