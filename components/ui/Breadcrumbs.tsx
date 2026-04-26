import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/seo';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Also emit a BreadcrumbList JSON-LD alongside the visual crumbs (default: true). */
  includeSchema?: boolean;
}

/**
 * Accessible breadcrumb component with matching BreadcrumbList JSON-LD.
 *
 * The last item is rendered as current-page (no link, aria-current="page").
 * `items` should include every step from home to current page.
 */
export function Breadcrumbs({ items, className = '', includeSchema = true }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const schema = includeSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          ...(item.href
            ? {
                item: item.href.startsWith('http')
                  ? item.href
                  : `${SITE_CONFIG.url}${item.href}`,
              }
            : {}),
        })),
      }
    : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <nav
        aria-label="Breadcrumb"
        className={`text-sm text-slate-500 ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && (
                  <span className="mx-1 text-slate-300" aria-hidden="true">
                    ›
                  </span>
                )}
                {isLast || !item.href ? (
                  <span aria-current={isLast ? 'page' : undefined} className="text-slate-900">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-slate-900">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
