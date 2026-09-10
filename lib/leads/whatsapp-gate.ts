/**
 * WhatsApp gate — client helpers.
 *
 * Every "WhatsApp" button on the marketing site used to open wa.me directly,
 * which sent two thirds of all inquiries around the lead form (and around
 * Pipedrive). Now a button dispatches `openWhatsAppGate()`; the floating
 * <WhatsAppFloat /> listens, shows a 3-field sheet, records the lead, and
 * only then opens the chat with a prefilled message.
 */

export const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '972555647538';
export const WHATSAPP_GATE_EVENT = 'wecc:whatsapp-gate';

export interface WhatsAppGateOptions {
  /** Where the click came from — goes to analytics + lead metadata. */
  location: string;
  /** Preselect the "what do you need" option. */
  need?: WhatsAppNeed;
  /** Service slug when opened from a service page. */
  service?: string;
}

export type WhatsAppNeed = 'idea' | 'product' | 'funding' | 'medtech' | 'other';

export const WHATSAPP_NEEDS: Array<{ value: WhatsAppNeed; he: string; en: string }> = [
  { value: 'idea', he: 'יש לי רעיון', en: 'I have an idea' },
  { value: 'product', he: 'מוצר / אפליקציה', en: 'Product / app' },
  { value: 'funding', he: 'גיוס משקיעים', en: 'Raising from investors' },
  { value: 'medtech', he: 'מיזם רפואי', en: 'MedTech venture' },
  { value: 'other', he: 'משהו אחר לגמרי', en: 'Something else entirely' },
];

export function openWhatsAppGate(opts: WhatsAppGateOptions): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<WhatsAppGateOptions>(WHATSAPP_GATE_EVENT, { detail: opts }));
}

/** wa.me link with a prefilled first message so the chat starts with context. */
export function buildWhatsAppUrl(opts: { name?: string; need?: WhatsAppNeed | ''; lang?: 'he' | 'en' }): string {
  const lang = opts.lang ?? 'he';
  const needLabel = WHATSAPP_NEEDS.find((n) => n.value === opts.need)?.[lang] ?? '';
  const text =
    lang === 'he'
      ? `היי, זה ${opts.name || ''}. השארתי פרטים באתר${needLabel ? ` בנושא: ${needLabel}` : ''}. אשמח לדבר.`
      : `Hi, this is ${opts.name || ''}. I left my details on the site${needLabel ? ` regarding: ${needLabel}` : ''}. Happy to talk.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text.trim())}`;
}
