/**
 * Dynamic Open Graph image generator: /og?slug=<slug>&locale=he|en
 *
 * Returns a 1200x630 PNG with the guide's H1 + WeCcelerate branding,
 * for use in OG:image and Twitter:image meta tags.
 *
 * DESIGN:
 *   - Dark navy background (#0f1e3d) with gold accent (#f3c661)
 *   - Large H1 title (max 2 lines, auto-wrapped)
 *   - Brand mark in the bottom-left corner
 *   - Tagline "Venture Builder ישראל" / "Israel's Leading Venture Builder"
 *   - Locale-aware: Hebrew = RTL, English = LTR
 *
 * USAGE:
 *   <meta property="og:image" content="https://weccelerate.co.il/og?slug=rayon-le-startup" />
 *   <meta property="og:image" content="https://weccelerate.co.il/og?slug=what-is-venture-builder&locale=en" />
 *
 * FALLBACK:
 *   If slug not found or query missing, a generic WeCcelerate-branded
 *   card is returned. Never 404 — OG crawlers do not handle 404 gracefully.
 */

import { ImageResponse } from 'next/og';
import { getGuideBySlug } from '@/lib/seo/guides-catalog';
import { getGuideBySlugEn } from '@/lib/seo/guides-catalog-en';

export const runtime = 'edge';
export const contentType = 'image/png';
// Dimensions exported for reference (next/og always emits PNG).
export const size = { width: 1200, height: 630 };

const BG_COLOR = '#0f1e3d';
const GOLD = '#f3c661';
const WHITE = '#ffffff';
const WHITE_70 = 'rgba(255,255,255,0.7)';

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '…';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const locale = (url.searchParams.get('locale') ?? 'he') as 'he' | 'en';

  // Look up guide (Hebrew first, English second). If neither matches, fall
  // back to a generic brand card rather than 404.
  const heGuide = slug ? getGuideBySlug(slug) : undefined;
  const enGuide = slug ? getGuideBySlugEn(slug) : undefined;

  let title: string;
  let tagline: string;
  let isRtl: boolean;

  if (locale === 'en' && enGuide) {
    title = truncate(enGuide.h1, 120);
    tagline = "Israel's Leading Venture Builder & Startup Accelerator";
    isRtl = false;
  } else if (heGuide) {
    title = truncate(heGuide.h1, 110);
    tagline = 'Venture Builder ומאיץ סטארטאפים מוביל בישראל';
    isRtl = true;
  } else if (enGuide) {
    title = truncate(enGuide.h1, 120);
    tagline = "Israel's Leading Venture Builder & Startup Accelerator";
    isRtl = false;
  } else {
    // Generic fallback
    title = locale === 'en'
      ? 'WeCcelerate — Venture Builder & Startup Accelerator, Israel'
      : 'WeCcelerate — Venture Builder ומאיץ סטארטאפים מוביל בישראל';
    tagline = locale === 'en'
      ? 'From idea to successful global startup'
      : 'מרעיון לסטארט-אפ עולמי מצליח';
    isRtl = locale !== 'en';
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 90px',
          backgroundColor: BG_COLOR,
          backgroundImage: `radial-gradient(circle at ${isRtl ? '90%' : '10%'} 10%, rgba(243,198,97,0.15), transparent 60%)`,
          direction: isRtl ? 'rtl' : 'ltr',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            display: 'flex',
            width: '80px',
            height: '6px',
            backgroundColor: GOLD,
            borderRadius: '3px',
          }}
        />

        {/* Main title */}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 70 ? 54 : 64,
            fontWeight: 700,
            color: WHITE,
            lineHeight: 1.15,
            letterSpacing: isRtl ? 0 : -1,
            textAlign: isRtl ? 'right' : 'left',
            maxWidth: '1000px',
          }}
        >
          {title}
        </div>

        {/* Footer: brand + tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 38,
                fontWeight: 700,
                color: GOLD,
                letterSpacing: -1,
              }}
            >
              WeCcelerate
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                color: WHITE_70,
                marginTop: '6px',
                maxWidth: '700px',
              }}
            >
              {tagline}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: WHITE_70,
            }}
          >
            weccelerate.co.il
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // Cache at the CDN for 1 day. Change a guide's slug to bust.
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
