'use client';

import { trackClick, type TrackAction } from '@/lib/analytics/track';

interface TrackedLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  trackAction: TrackAction;
  trackMeta?: Record<string, string>;
}

export function TrackedLink({
  trackAction,
  trackMeta,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackClick(trackAction, trackMeta);
    onClick?.(e);
  };

  return (
    <a onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
