import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  /** Page title displayed at the top */
  title: string;
  /** Tagline / subtitle */
  subtitle?: string;
  /** Theme color for accents — accepts hex or tailwind color */
  accentColor?: string;
  /** Sections of content */
  children: React.ReactNode;
  /** Back link label */
  backLabel?: string;
  /** Back link href */
  backHref?: string;
}

/**
 * LegalPage — Reusable layout for /privacy and /accessibility pages.
 * Dark theme matches main subdomain landing pages.
 */
export function LegalPage({
  title,
  subtitle,
  accentColor = '#c8a951',
  children,
  backLabel = 'חזרה לדף הראשי',
  backHref = '/',
}: LegalPageProps) {
  return (
    <main id="main-content" className="relative min-h-screen py-20 sm:py-28">
      <div className="container-corporate relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {backLabel}
          </Link>

          {/* Header */}
          <div className="mb-12 pb-8 border-b border-white/10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/55 text-base sm:text-lg leading-relaxed">{subtitle}</p>
            )}
            <div
              className="mt-6 h-px w-24"
              style={{
                background: `linear-gradient(90deg, ${accentColor}, transparent)`,
              }}
            />
          </div>

          {/* Content */}
          <div
            className="prose-content space-y-6 text-white/70 text-sm sm:text-base leading-relaxed"
            style={
              {
                '--accent': accentColor,
              } as React.CSSProperties
            }
          >
            {children}
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-white/10 text-xs text-white/40">
            <p>עודכן לאחרונה: אפריל 2026 · WeCcelerate Ltd.</p>
            <p className="mt-2">
              לבירורים נוספים:{' '}
              <a
                href="mailto:info@weccelerate.co.il"
                className="hover:text-white transition-colors"
                style={{ color: accentColor }}
              >
                info@weccelerate.co.il
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}

export function LegalSection({ title, children, accentColor = '#c8a951' }: SectionProps) {
  return (
    <section className="space-y-3">
      <h2
        className="text-xl sm:text-2xl font-bold tracking-tight"
        style={{ color: accentColor }}
      >
        {title}
      </h2>
      <div className="space-y-3 text-white/65">{children}</div>
    </section>
  );
}
