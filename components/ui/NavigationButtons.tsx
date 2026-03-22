'use client';

import { TrackedLink } from '@/components/ui/TrackedLink';

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91';
const WAZE_URL =
  'https://waze.com/ul?q=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91';

function GoogleMapsLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 92.3 132.3"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#1a73e8"
        d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"
      />
      <path
        fill="#ea4335"
        d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3L10.8 16.5z"
      />
      <path
        fill="#4285f4"
        d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"
      />
      <path
        fill="#fbbc04"
        d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"
      />
      <path
        fill="#34a853"
        d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2"
      />
    </svg>
  );
}

function WazeLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Teal background circle */}
      <circle cx="24" cy="24" r="24" fill="#33CCFF" />
      {/* Ghost body */}
      <path
        d="M24 8C16 8 9.5 14.5 9.5 22.5c0 4 1.6 7.5 4.2 10.1.2.2.2.4.2.6l-.1 2.9c0 .6.7 1 1.2.6l3.2-2.3c.2-.2.5-.2.7-.2 1.5.4 3 .6 4.6.6 8 0 14.5-6.5 14.5-14.5S32 8 24 8z"
        fill="#FFFFFF"
      />
      {/* Left eye */}
      <ellipse cx="20" cy="21.5" rx="2.3" ry="2.8" fill="#333" />
      <ellipse cx="20.7" cy="20.5" rx="0.8" ry="1" fill="#FFF" />
      {/* Right eye */}
      <ellipse cx="28" cy="21.5" rx="2.3" ry="2.8" fill="#333" />
      <ellipse cx="28.7" cy="20.5" rx="0.8" ry="1" fill="#FFF" />
      {/* Smile */}
      <path
        d="M20 28c0 0 2 2.5 4 2.5s4-2.5 4-2.5"
        fill="none"
        stroke="#333"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// =============================================================================
// ROUND BUTTON VARIANTS
// =============================================================================

interface NavigationButtonsProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md';
}

export function NavigationButtons({
  variant = 'dark',
  size = 'md',
}: NavigationButtonsProps) {
  const iconSize = size === 'sm' ? 16 : 20;
  const btnSize = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';

  const btnClass =
    variant === 'dark'
      ? `${btnSize} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110`
      : `${btnSize} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md`;

  return (
    <div className="flex items-center gap-3">
      <TrackedLink
        trackAction="click.maps"
        trackMeta={{ location: 'nav-buttons' }}
        href={GOOGLE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="נווטו אלינו בגוגל מפות"
        className={`${btnClass} ${
          variant === 'dark'
            ? 'bg-white/10 hover:bg-white/20'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <GoogleMapsLogo size={iconSize} />
      </TrackedLink>
      <TrackedLink
        trackAction="click.waze"
        trackMeta={{ location: 'nav-buttons' }}
        href={WAZE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="נווטו אלינו בוויז"
        className={`${btnClass} ${
          variant === 'dark'
            ? 'bg-white/10 hover:bg-white/20'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <WazeLogo size={iconSize} />
      </TrackedLink>
    </div>
  );
}

// =============================================================================
// EMBEDDED MAP
// =============================================================================

interface LocationMapProps {
  variant?: 'dark' | 'light';
  height?: string;
  className?: string;
}

export function LocationMap({
  variant = 'dark',
  height = '300px',
  className = '',
}: LocationMapProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${
        variant === 'dark' ? 'border border-white/10' : 'border border-gray-200 shadow-sm'
      } ${className}`}
      style={{ height }}
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.3!2d34.7721!3d32.0636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDAzJzQ5LjAiTiAzNMKwNDYnMTkuNiJF!5e0!3m2!1siw!2sil!4v1700000000000"
        width="100%"
        height="100%"
        style={{ border: 0, filter: variant === 'dark' ? 'invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.1)' : 'none' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="מיקום WeCcelerate - רחוב הרכבת 58, תל אביב"
      />
    </div>
  );
}
