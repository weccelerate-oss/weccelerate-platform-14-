/**
 * Infratech AI Proxy
 *
 * Forwards Claude API requests from the Infratech app to Anthropic,
 * injecting the server-side API key so it's never exposed to the browser.
 *
 * Required env var: ANTHROPIC_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_VERSION = '2023-06-01';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        content: [
          {
            type: 'text',
            text:
              '⚠ שגיאה: מפתח ANTHROPIC_API_KEY לא מוגדר בשרת. ' +
              'הוסיפו ANTHROPIC_API_KEY לקובץ .env.local ואתחלו את השרת.',
          },
        ],
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[Infratech AI] Anthropic API error:', data);
      return NextResponse.json(
        {
          content: [
            {
              type: 'text',
              text:
                '⚠ שגיאה מה-API של Anthropic: ' +
                (data?.error?.message || res.statusText),
            },
          ],
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Infratech AI] Proxy error:', message);
    return NextResponse.json(
      {
        content: [
          { type: 'text', text: '⚠ שגיאה בשרת: ' + message },
        ],
      },
      { status: 500 }
    );
  }
}
