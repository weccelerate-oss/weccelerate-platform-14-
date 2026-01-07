import { ReactNode } from 'react';
import { BreadcrumbJsonLd, ArticleJsonLd, FAQJsonLd, ServiceJsonLd } from './json-ld';

// =============================================================================
// TYPES
// =============================================================================

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SeoHeadProps {
  /**
   * Breadcrumb items for structured data
   */
  breadcrumbs?: BreadcrumbItem[];
  
  /**
   * Article data for blog/news pages
   */
  article?: {
    headline: string;
    description: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    author?: string;
  };
  
  /**
   * FAQ items for FAQ pages
   */
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  
  /**
   * Service data for service pages
   */
  service?: {
    name: string;
    description: string;
    provider?: string;
    areaServed?: string[];
  };
  
  /**
   * Preload critical resources
   */
  preloadImages?: string[];
  
  /**
   * Additional children (custom script tags, etc.)
   */
  children?: ReactNode;
}

// =============================================================================
// SEO HEAD COMPONENT
// =============================================================================

/**
 * Reusable SEO Head component for page-level SEO elements
 * 
 * This component renders:
 * - Breadcrumb structured data
 * - Article structured data (for blog posts)
 * - FAQ structured data
 * - Service structured data
 * - Resource preloading hints
 * 
 * @example
 * // In a blog post page
 * <SeoHead
 *   breadcrumbs={[
 *     { name: 'Home', url: 'https://weccelerate.co.il' },
 *     { name: 'Blog', url: 'https://weccelerate.co.il/blog' },
 *     { name: 'Post Title', url: 'https://weccelerate.co.il/blog/post-slug' },
 *   ]}
 *   article={{
 *     headline: 'Post Title',
 *     description: 'Post description',
 *     datePublished: '2024-01-15',
 *   }}
 * />
 * 
 * @example
 * // In a service page
 * <SeoHead
 *   service={{
 *     name: 'Business Acceleration',
 *     description: 'Fast-track your business growth',
 *   }}
 * />
 */
export function SeoHead({
  breadcrumbs,
  article,
  faqItems,
  service,
  preloadImages,
  children,
}: SeoHeadProps) {
  return (
    <>
      {/* Breadcrumb structured data */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbJsonLd items={breadcrumbs} />
      )}

      {/* Article structured data */}
      {article && <ArticleJsonLd article={article} />}

      {/* FAQ structured data */}
      {faqItems && faqItems.length > 0 && <FAQJsonLd items={faqItems} />}

      {/* Service structured data */}
      {service && <ServiceJsonLd service={service} />}

      {/* Preload critical images */}
      {preloadImages?.map((src) => (
        <link
          key={src}
          rel="preload"
          as="image"
          href={src}
          // fetchPriority is handled by Next.js Image component
        />
      ))}

      {/* Additional custom elements */}
      {children}
    </>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * Preload fonts for performance
 */
export function PreloadFonts({ fonts }: { fonts: string[] }) {
  return (
    <>
      {fonts.map((font) => (
        <link
          key={font}
          rel="preload"
          href={font}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}

/**
 * Defer non-critical CSS
 */
export function DeferredStyles({ href }: { href: string }) {
  return (
    <>
      <link
        rel="preload"
        href={href}
        as="style"
        // @ts-expect-error - onLoad is valid for link elements
        onLoad="this.onload=null;this.rel='stylesheet'"
      />
      <noscript>
        <link rel="stylesheet" href={href} />
      </noscript>
    </>
  );
}

/**
 * Canonical link override for edge cases
 */
export function CanonicalOverride({ url }: { url: string }) {
  return <link rel="canonical" href={url} />;
}

/**
 * Hreflang links for multi-language pages
 */
export function HreflangLinks({
  languages,
}: {
  languages: Array<{ lang: string; url: string }>;
}) {
  return (
    <>
      {languages.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
    </>
  );
}

// =============================================================================
// EXPORT CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create breadcrumb items helper
 */
export function createBreadcrumbs(
  items: Array<{ name: string; path: string }>,
  baseUrl: string = 'https://weccelerate.co.il'
): BreadcrumbItem[] {
  return items.map((item) => ({
    name: item.name,
    url: `${baseUrl}${item.path}`,
  }));
}
