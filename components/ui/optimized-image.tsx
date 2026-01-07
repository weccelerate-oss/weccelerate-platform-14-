'use client';

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface OptimizedImageProps extends Omit<NextImageProps, 'onError'> {
  fallback?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  showSkeleton?: boolean;
}

// =============================================================================
// ASPECT RATIO CLASSES
// =============================================================================

const aspectRatioClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  auto: '',
};

// =============================================================================
// OPTIMIZED IMAGE COMPONENT
// =============================================================================

/**
 * Optimized image component with:
 * - Automatic fallback handling
 * - Loading skeleton
 * - Lazy loading by default
 * - Aspect ratio support
 */
export function OptimizedImage({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  aspectRatio = 'auto',
  showSkeleton = true,
  className,
  fill,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageSrc = error ? fallback : src;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-100',
        aspectRatioClasses[aspectRatio],
        fill && 'w-full h-full'
      )}
    >
      {/* Loading skeleton */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}

      <NextImage
        src={imageSrc}
        alt={alt}
        fill={fill}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

// =============================================================================
// HERO IMAGE (Priority loading)
// =============================================================================

export function HeroImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, 'priority' | 'loading'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      priority
      showSkeleton={false}
      {...props}
    />
  );
}

// =============================================================================
// AVATAR IMAGE
// =============================================================================

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
}

const avatarSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export function AvatarImage({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  className,
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-royal-100 text-royal-600 font-semibold',
          avatarSizes[size],
          className
        )}
      >
        {fallbackInitials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', avatarSizes[size], className)}>
      <NextImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
        sizes={size === 'xl' ? '80px' : size === 'lg' ? '56px' : size === 'md' ? '40px' : '32px'}
      />
    </div>
  );
}

// =============================================================================
// LOGO IMAGE
// =============================================================================

interface LogoImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function LogoImage({ src, alt, width = 120, height = 40, className }: LogoImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-100 rounded px-3 py-2',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-xs text-slate-500 font-medium truncate">{alt}</span>
      </div>
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-contain', className)}
      onError={() => setError(true)}
    />
  );
}

export default OptimizedImage;
