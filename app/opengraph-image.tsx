import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'WeCcelerate - Venture Builder & Startup Accelerator Israel';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1a365d 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background:
                'linear-gradient(135deg, #d4a017 0%, #f5c842 50%, #d4a017 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 72,
              fontWeight: 900,
              color: '#0f172a',
            }}
          >
            W
          </div>
        </div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-2px',
          }}
        >
          WeCcelerate
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#d4a017',
            marginTop: 24,
            fontWeight: 600,
          }}
        >
          Venture Builder & Startup Accelerator
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#cbd5e1',
            marginTop: 16,
          }}
        >
          Israel · MedTech · AI · Innovation
        </div>
      </div>
    ),
    { ...size },
  );
}
