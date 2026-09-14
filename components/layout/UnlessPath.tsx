'use client';

import { usePathname } from 'next/navigation';

/**
 * Renders children everywhere except under the given path prefixes.
 * Used to drop the site navigation on paid landing pages (/lp/*), where
 * the only way out should be the form.
 */
export function UnlessPath({ prefixes, children }: { prefixes: string[]; children: React.ReactNode }) {
  const pathname = usePathname() || '';
  if (prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}
