'use client';

/**
 * Microsoft Clarity — session recordings, heatmaps, and rage-click detection,
 * enriched with our traffic-source attribution so every recording is
 * filterable by "came from ChatGPT / Google / a Facebook campaign".
 *
 * Renders nothing unless NEXT_PUBLIC_CLARITY_PROJECT_ID is set (create the
 * project at https://clarity.microsoft.com → Settings → Overview → Project ID,
 * then add the env var in the hosting dashboard AND .env.local).
 *
 * Custom tags pushed per session (visible as filters in the Clarity UI):
 *  - channel        llm-chatgpt / google-organic / facebook-ads / direct …
 *  - channelDetail  referrer host or utm_source
 *  - campaign       utm_campaign
 *  - firstChannel   the visitor's ORIGINAL discovery channel (first touch)
 */

import { useEffect } from 'react';
import Script from 'next/script';
import { getAttribution } from '@/lib/analytics/attribution';

// Sanitize hard: a BOM + trailing CRLF once snuck into the Vercel env value
// (piped through PowerShell) and the raw newline inside the inline-script
// string threw a SyntaxError that silently killed Clarity site-wide.
const PROJECT_ID = (process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '')
  .replace(/[^a-z0-9]/gi, '');

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

export function Clarity() {
  useEffect(() => {
    if (!PROJECT_ID) return;
    try {
      const { first, session } = getAttribution();
      // The queue stub below exists as soon as the inline script runs, so
      // these are safe even before clarity.js finishes loading.
      window.clarity?.('set', 'channel', session.channel);
      if (session.detail) window.clarity?.('set', 'channelDetail', session.detail);
      if (session.campaign) window.clarity?.('set', 'campaign', session.campaign);
      window.clarity?.('set', 'firstChannel', first.channel);
    } catch { /* tagging must never break the page */ }
  }, []);

  if (!PROJECT_ID) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${PROJECT_ID}");`}
    </Script>
  );
}
