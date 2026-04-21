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
    ];
  },

  // Performance
  poweredByHeader: false,
  compress: true,

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;