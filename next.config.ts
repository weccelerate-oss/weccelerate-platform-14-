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