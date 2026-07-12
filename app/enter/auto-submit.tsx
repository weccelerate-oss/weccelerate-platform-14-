'use client';

/**
 * Auto-submits the magic-entry form once on mount, so clicking the email
 * button lands the entrepreneur straight in the portal with zero extra
 * clicks. The visible button stays as a fallback (JS disabled / errors).
 */

import { useEffect, useRef } from 'react';

export function AutoSubmit({ formId }: { formId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    (document.getElementById(formId) as HTMLFormElement | null)?.requestSubmit();
  }, [formId]);

  return null;
}
