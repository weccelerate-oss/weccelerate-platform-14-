import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'weccelerate.co.il',
      },
      {
        protocol: 'https',
        hostname: '*.weccelerate.co.il',
      },
      {
        protocol: 'https',
        hostname: 'wecc-ltd.com',
      },
      {
        protocol: 'https',
        hostname: '*.wecc-ltd.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'aqpiecydauxlrvhdqghx.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Domain redirects
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'wecc-ltd.com',
          },
        ],
        destination: 'https://weccelerate.co.il/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.wecc-ltd.com',
          },
        ],
        destination: 'https://weccelerate.co.il/:path*',
        permanent: true,
      },
      {
        // www served the full site with a 200 (2026-10-11): one host only,
        // so links and rankings are not split between two copies.
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.weccelerate.co.il',
          },
        ],
        destination: 'https://weccelerate.co.il/:path*',
        permanent: true,
      },
      // Internal links in generated guides / glossary that 404ed (site crawl 2026-10-11):
      // missing /guides prefix, misspelled slugs, and a comparison guide that never existed.
      ...[
        ['/pitch-deck-startup', '/guides/pitch-deck-startup'],
        ['/tochnit-iskit-startup', '/guides/tochnit-iskit-startup'],
        ['/heskem-sodyut-nda', '/guides/heskem-sodyut-nda'],
        ['/giyus-series-a', '/guides/giyus-series-a'],
        ['/vesting-hesber', '/guides/vesting-hesber'],
        ['/customer-discovery', '/guides/customer-discovery'],
        ['/product-market-fit', '/guides/product-market-fit'],
        ['/services/cto-as-a-service', '/guides/cto-as-a-service'],
        ['/guides/livui-mzimim', '/guides/livui-mizmim'],
        ['/guides/livui-mzmim', '/guides/livui-mizmim'],
        ['/guides/grants-rashut-hachadshnaut', '/guides/grants-rashut-hachadshanut'],
        ['/guides/hashvaat-acceleratorim', '/comparisons'],
        // Linked from the daily content brief (2026-10-18); the real page is medtech-leumit.
        ['/services/medtech', '/services/medtech-leumit'],
      ].map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },

  // Performance
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'date-fns'],
  },

  // Long-term immutable caching for hashed build assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Next.js optimized images — cache at the CDN edge
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;