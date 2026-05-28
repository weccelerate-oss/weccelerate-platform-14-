/**
 * Root Layout
 * 
 * Main application layout with comprehensive SEO/GEO optimization.
 * Implements the "Golden SEO Strategy" for maximum visibility in
 * both traditional search engines and AI-powered generative engines.
 * 
 * @module app/layout
 */

import type { Metadata, Viewport } from "next";
import { Inter, Heebo } from "next/font/google";
import Script from "next/script";

import { GeoSchema } from "@/components/seo/GeoSchema";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { LanguageProvider } from "@/lib/i18n";
import { HtmlAttrs } from "@/components/providers/HtmlAttrs";
import {
  constructMetadata,
  viewport as viewportConfig,
  SITE_CONFIG,
  BRAND,
} from "@/lib/seo";
import "./globals.css";

// =============================================================================
// FONTS
// =============================================================================

// Use local fallback approach for fonts to avoid build failures
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: false,
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
  // Heebo is the primary body font — preload to improve LCP on Hebrew pages.
  preload: true,
});

// =============================================================================
// METADATA (SEO) - Golden Keywords Strategy
// =============================================================================

export const metadata: Metadata = {
  ...constructMetadata({
    title: "Venture Builder & Startup Accelerator Israel | וויסלרייט",
    description:
      "WeCcelerate is a leading Venture Builder in Tel Aviv & Jerusalem, specializing in MedTech, AI, and IP strategy for startups. Partnered with Leumit Health Care.",
    keywords: [
      // Semantic Core
      "Venture Builder Israel",
      "Startup Accelerator",
      "Medical Accelerator",
      "Innovation Hub Tel Aviv",
      "Weccelerate",
      "וויסלרייט",
    ],
    path: "/",
    locale: "he",
    authors: ["WeCcelerate Team", "Leumit Health Services"],
  }),

  // Manifest
  manifest: "/manifest.webmanifest",

  // Icons — W-only mark (favicon). NOTE: /logo.png stays the full brand logo
  // for SEO/structured data; only the favicon/PWA icons use the W.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icon-512.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WeCcelerate",
  },

  // Format detection
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
};

// =============================================================================
// VIEWPORT
// =============================================================================

export const viewport: Viewport = viewportConfig;

// =============================================================================
// ROOT LAYOUT COMPONENT
// =============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${inter.variable} ${heebo.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.leumit.co.il" />
        <link rel="dns-prefetch" href="https://api.weccelerate.co.il" />

        {/* Canonical + hreflang are emitted by Next.js metadata.alternates
            (see lib/seo/metadata.ts). Manual <link> tags here caused
            duplicate canonical detection in Bing. */}

        {/* RSS Feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="WeCcelerate Blog RSS"
          href={`${SITE_CONFIG.url}/feed.xml`}
        />

        {/* Sitemap reference */}
        <link rel="sitemap" type="application/xml" href={`${SITE_CONFIG.url}/sitemap.xml`} />

        {/* GEO Schema - The Holy Grail JSON-LD for AI/LLM Optimization.
            FAQ intentionally excluded: it was causing Google to see a duplicate
            FAQPage (the @graph ends up rendered twice in head by Next.js/React
            streaming). Reintroduce per-page with a dedicated component if
            needed. */}
        <GeoSchema
          path="/"
          pageTitle="WeCcelerate - Venture Builder & Startup Accelerator Israel"
          includeFaq={false}
        />

        {/* Additional meta for Hebrew optimization */}
        <meta name="language" content="Hebrew" />
        <meta httpEquiv="content-language" content="he-IL" />

        {/* Geo targeting for Israel */}
        <meta name="geo.region" content="IL" />
        <meta name="geo.placename" content="Tel Aviv" />
        <meta name="geo.position" content="32.0636;34.7721" />
        <meta name="ICBM" content="32.0636, 34.7721" />

        {/* Dublin Core metadata for academic/enterprise search */}
        <meta name="DC.title" content="WeCcelerate - Venture Builder & Startup Accelerator Israel" />
        <meta name="DC.creator" content="WeCcelerate Team" />
        <meta name="DC.subject" content="Venture Builder, Startup Accelerator, MedTech, Innovation Hub, Israel" />
        <meta name="DC.description" content={BRAND.descriptions.medium.en} />
        <meta name="DC.publisher" content="WeCcelerate" />
        <meta name="DC.contributor" content="Leumit Health Services" />
        <meta name="DC.type" content="Service" />
        <meta name="DC.format" content="text/html" />
        <meta name="DC.identifier" content={SITE_CONFIG.url} />
        <meta name="DC.language" content="he" />
        <meta name="DC.coverage" content="Israel" />

        {/* OpenSearch */}
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="WeCcelerate Search"
          href={`${SITE_CONFIG.url}/opensearch.xml`}
        />

        {/* LLMs.txt — AI/LLM discovery (short index + deep full-text) */}
        <link
          rel="llms"
          type="text/plain"
          href={`${SITE_CONFIG.url}/llms.txt`}
        />
        <link
          rel="llms-full"
          type="text/plain"
          href={`${SITE_CONFIG.url}/llms-full.txt`}
        />
      </head>

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-BQDD91KSJG"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-BQDD91KSJG');
        `}
      </Script>

      <body className={`font-heebo antialiased bg-white text-slate-900`}>
        <LanguageProvider>
          {/* Dynamically sets <html lang/dir> based on selected language */}
          <HtmlAttrs />

          {/* Skip to Content — first focusable element (WCAG 2.4.1) */}
          <SkipToContent />

          {/* Page content — #main-content target lives in each page's <main> */}
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
