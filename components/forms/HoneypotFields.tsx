'use client';

import { useState } from 'react';

/**
 * Two hidden form fields that the spam filter uses to spot bots:
 *
 *  - `website` — a honeypot. Real users never see it (visually hidden +
 *    aria-hidden + tabIndex -1). Bots that fill every field they can find
 *    will fill this one, which makes the spam filter drop the submission.
 *
 *  - `_ts` — millisecond timestamp captured in the browser the moment the
 *    form mounts. The server compares it to the submission time; anything
 *    under 3 seconds is treated as bot-driven.
 *
 * Drop this once into every contact / application / newsletter / event
 * form. Zero visible UI, zero accessibility impact.
 *
 * Hiding is clip-based, not an off-screen offset: `left: -9999px` on an
 * RTL page extends the document's scrollable width by ~10,000px, which
 * let phones swipe sideways into an empty white area (seen on /contact
 * and inside the WhatsApp gate, 2026-09-10).
 */
export function HoneypotFields() {
  const [renderedAtMs] = useState(() => Date.now());

  return (
    <>
      {/* Honeypot — looks like a real "website" field to scrapers, invisible to humans. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: 0,
          border: 0,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <label htmlFor="website-hp">Website (do not fill)</label>
        <input
          type="text"
          name="website"
          id="website-hp"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {/* Time-of-render — server checks dwell time. */}
      <input type="hidden" name="_ts" value={renderedAtMs} readOnly />
    </>
  );
}
