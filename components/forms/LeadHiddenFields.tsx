'use client';

/**
 * Hidden inputs every lead form must carry.
 *
 * Collects what the server action reads in `readAttribution()`:
 * the submitting page, the referrer, UTM/click ids from the URL, and the
 * classified channel (google-organic / llm-chatgpt / linkedin ...) that
 * lib/analytics/attribution.ts persisted when the visitor first arrived —
 * so a lead that browsed three guides before converting still carries the
 * original source into Pipedrive.
 *
 * The inputs are uncontrolled and filled imperatively after mount, so the
 * server-rendered markup (empty values) never mismatches the client.
 *
 * Also renders the honeypot envelope so no form forgets it.
 */

import { useEffect, useRef } from 'react';
import { HoneypotFields } from '@/components/forms/HoneypotFields';
import { attributionMetadata } from '@/lib/analytics/attribution';

interface LeadHiddenFieldsProps {
  /** Site key: main | leumit | biz | landing */
  site?: string;
  /** Form type, e.g. contact | whatsapp_gate | home_cta | service | guide_inline */
  formType: string;
  /** Service slug when the form sits on / points at a service page. */
  service?: string | null;
}

const URL_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as const;
const ATTR_KEYS = ['sourceUrl', 'referrerUrl', 'channel', 'channelDetail', 'campaign', 'firstChannel', 'landingPage'] as const;
const ALL_KEYS = [...ATTR_KEYS, ...URL_KEYS];

export function LeadHiddenFields({ site = 'main', formType, service }: LeadHiddenFieldsProps) {
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    try {
      const params = new URL(window.location.href).searchParams;
      const attr = attributionMetadata();
      const vals: Record<string, string> = {
        sourceUrl: window.location.href,
        referrerUrl: document.referrer || '',
        channel: attr.channel || '',
        channelDetail: attr.channelDetail || '',
        campaign: attr.campaign || '',
        firstChannel: attr.firstChannel || '',
        landingPage: attr.landingPage || '',
      };
      for (const k of URL_KEYS) vals[k] = params.get(k) || '';
      for (const k of ALL_KEYS) {
        const el = refs.current[k];
        if (el) el.value = vals[k] ?? '';
      }
    } catch {
      /* attribution must never break the form */
    }
  }, []);

  return (
    <>
      <HoneypotFields />
      <input type="hidden" name="site" value={site} />
      <input type="hidden" name="formType" value={formType} />
      {service ? <input type="hidden" name="service" value={service} /> : null}
      {ALL_KEYS.map((k) => (
        <input
          key={k}
          type="hidden"
          name={k}
          defaultValue=""
          ref={(el) => { refs.current[k] = el; }}
        />
      ))}
    </>
  );
}
