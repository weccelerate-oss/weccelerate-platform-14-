'use client';

/**
 * Meta (Facebook) Pixel — conversion tracking for paid Meta campaigns.
 *
 * Renders nothing unless NEXT_PUBLIC_META_PIXEL_ID is set (create the pixel
 * at https://business.facebook.com/events_manager → Data Sources → Pixels,
 * then add the env var in the hosting dashboard AND .env.local).
 *
 * PageView fires on load and again on every App Router client-side
 * navigation (fbq does not observe history changes on its own).
 * Conversion events (Lead) are fired from lib/analytics/meta-pixel.ts.
 */

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

// Sanitized like Clarity's PROJECT_ID: env values pasted/piped with a BOM or
// trailing newline break the inline script with a SyntaxError.
const PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || '')
  .replace(/[^a-z0-9]/gi, '');

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function MetaPixel() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!PIXEL_ID) return;
    // The inline stub below queues calls until fbevents.js loads, and the
    // init snippet already fires the initial PageView — only re-fire on
    // subsequent client-side navigations.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.fbq?.('track', 'PageView');
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
