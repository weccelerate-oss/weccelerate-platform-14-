'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackClassName?: string;
  fallbackContent?: React.ReactNode;
  style?: CSSProperties;
  quality?: number;
}

/**
 * SafeImage — Next.js Image wrapper that gracefully handles missing assets.
 * If the image 404s, it renders a soft branded placeholder gradient instead
 * of breaking the layout. Used throughout the landing pages so missing assets
 * don't crash the design while images are still being created.
 */
export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  sizes,
  fallbackClassName,
  fallbackContent,
  style,
  quality = 85,
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`relative overflow-hidden ${fallbackClassName || className || ''}`}
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.04) 100%)',
          ...style,
        }}
        aria-label={alt}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackContent || (
            <div className="w-full h-full opacity-20"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.04), transparent 50%)',
              }}
            />
          )}
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={quality}
        className={className}
        style={style}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      priority={priority}
      sizes={sizes}
      quality={quality}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  );
}
