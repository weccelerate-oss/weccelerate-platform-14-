/**
 * Per-Service-Page JSON-LD Schema
 *
 * Generates rich structured data for individual service pages.
 * Optimized for:
 * - Google rich results (Service, AggregateRating, Breadcrumb)
 * - AI answer engines (detailed descriptions, FAQ)
 * - Voice search (Speakable)
 */

const SITE_URL = 'https://weccelerate.co.il';

interface ServicePageSchemaProps {
  serviceId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  path: string;
  category: string;
  faqs?: { question: string; answer: string }[];
}

export function ServicePageSchema({
  serviceId,
  title,
  titleEn,
  description,
  descriptionEn,
  path,
  category,
  faqs = [],
}: ServicePageSchemaProps) {
  const pageUrl = `${SITE_URL}${path}`;

  const graph: Record<string, unknown>[] = [
    // Service schema
    {
      '@type': 'Service',
      '@id': `${pageUrl}/#service`,
      name: title,
      alternateName: titleEn,
      description: descriptionEn,
      provider: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'WeCcelerate',
      },
      areaServed: [
        { '@type': 'Country', name: 'Israel' },
        { '@type': 'AdministrativeArea', name: 'Middle East' },
      ],
      audience: {
        '@type': 'Audience',
        audienceType: 'Entrepreneurs, Startups, Business Owners',
      },
      serviceType: category,
      url: pageUrl,
    },

    // Breadcrumb
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'בית',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'שירותים',
          item: `${SITE_URL}/services`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: pageUrl,
        },
      ],
    },

    // WebPage with Speakable
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}/#webpage`,
      url: pageUrl,
      name: `${title} | WeCcelerate`,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${pageUrl}/#service` },
      inLanguage: 'he-IL',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '[data-speakable]', 'main p:first-of-type'],
      },
    },
  ];

  // Add FAQ if provided
  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}/#faq`,
      mainEntity: faqs.map((faq, i) => ({
        '@type': 'Question',
        '@id': `${pageUrl}/#faq-${i + 1}`,
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
    />
  );
}
