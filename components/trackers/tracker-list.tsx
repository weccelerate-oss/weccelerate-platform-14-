'use client';

/**
 * The record list — one readable card per entry, at every breakpoint.
 *
 * Replaces the spreadsheet grid. An 11-column grid meant horizontal scrolling
 * on a laptop and was unusable on a phone; a card shows the fields that
 * identify a record and hands the rest to the editor panel.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Copy, ExternalLink, Headphones, Mail, Phone, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatHebrewDate } from '@/lib/trackers/csv';
import { sanitizeRow, type DraftRow, type TrackerDefinition } from '@/lib/trackers/schema';

interface TrackerListProps {
  definition: TrackerDefinition;
  rows: DraftRow[];
  readOnly: boolean;
  onOpen: (clientId: string) => void;
  onDelete: (clientId: string) => void;
  onMove: (clientId: string, direction: -1 | 1) => void;
  onDuplicate: (clientId: string) => void;
}

/** Column keys that the card renders itself; the rest live in the editor. */
function faceOf(definition: TrackerDefinition) {
  const byKey = Object.fromEntries(definition.columns.map((c) => [c.key, c]));
  return definition.slug === 'calls'
    ? {
        title: 'contactName',
        subtitle: 'company',
        chip: 'relevance',
        date: 'lastContactAt',
        body: 'summary',
        link: 'recordingUrl',
        phone: 'phone',
        email: 'email',
        byKey,
      }
    : {
        title: 'companyName',
        subtitle: 'occupation',
        chip: 'status',
        date: 'lastOutreachAt',
        body: 'notes',
        link: 'link',
        phone: 'phone',
        email: 'email',
        byKey,
      };
}

export default function TrackerList({
  definition,
  rows,
  readOnly,
  onOpen,
  onDelete,
  onMove,
  onDuplicate,
}: TrackerListProps) {
  const face = faceOf(definition);

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {rows.map((row, index) => {
          const { warnings } = sanitizeRow(definition.slug, row as Record<string, unknown>);
          const warningCount = Object.keys(warnings).length;

          const title = String(row[face.title] ?? '').trim();
          const subtitle = String(row[face.subtitle] ?? '').trim();
          const chip = String(row[face.chip] ?? '').trim();
          const date = formatHebrewDate(row[face.date] as string | null);
          const body = String(row[face.body] ?? '').trim();
          const link = String(row[face.link] ?? '').trim();
          const phone = String(row[face.phone] ?? '').trim();
          const email = String(row[face.email] ?? '').trim();

          return (
            <motion.div
              key={row.clientId}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
              className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-[#c8a951]/30 transition-colors"
            >
              <button
                type="button"
                onClick={() => onOpen(row.clientId)}
                className="w-full text-right px-4 sm:px-5 py-4"
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  {definition.showRowNumber && (
                    <span className="text-[12px] text-white/25 tabular-nums shrink-0">
                      {index + 1}
                    </span>
                  )}
                  <span
                    className={cn(
                      'font-bold text-[15px] truncate max-w-full',
                      title ? 'text-white/90' : 'text-white/30',
                    )}
                  >
                    {title || (definition.slug === 'calls' ? 'ללא שם' : 'ללא שם חברה')}
                  </span>
                  {subtitle && (
                    <span className="text-[13px] text-white/35 truncate">· {subtitle}</span>
                  )}

                  <span className="flex-1" />

                  {chip && (
                    <span className="shrink-0 rounded-full border border-[#c8a951]/30 bg-[#c8a951]/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-[#e8d48b]">
                      {chip}
                    </span>
                  )}
                  {date && (
                    <span className="shrink-0 text-[12px] text-white/40 tabular-nums">{date}</span>
                  )}
                </div>

                {(phone || email || link) && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] text-white/40">
                    {phone && (
                      <span className="inline-flex items-center gap-1" dir="ltr">
                        <Phone className="w-3 h-3" />
                        {phone}
                      </span>
                    )}
                    {email && (
                      <span className="inline-flex items-center gap-1 truncate max-w-[220px]" dir="ltr">
                        <Mail className="w-3 h-3 shrink-0" />
                        {email}
                      </span>
                    )}
                    {link && (
                      <span className="inline-flex items-center gap-1 text-[#c8a951]/70">
                        {definition.slug === 'calls' ? (
                          <Headphones className="w-3 h-3" />
                        ) : (
                          <ExternalLink className="w-3 h-3" />
                        )}
                        {definition.slug === 'calls' ? 'הקלטה' : 'קישור'}
                      </span>
                    )}
                  </div>
                )}

                {body && (
                  <p className="mt-2 text-[13px] leading-relaxed text-white/50 line-clamp-2">
                    {body}
                  </p>
                )}

                {warningCount > 0 && (
                  <p className="mt-2 text-[11.5px] text-amber-300/70">
                    {warningCount} שדות לבדיקה
                  </p>
                )}
              </button>

              {!readOnly && (
                <div className="absolute top-3 left-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onMove(row.clientId, -1)}
                    disabled={index === 0}
                    aria-label="הזז למעלה"
                    className="p-1.5 rounded-md text-white/30 hover:text-[#e8d48b] hover:bg-white/[0.06] disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(row.clientId, 1)}
                    disabled={index === rows.length - 1}
                    aria-label="הזז למטה"
                    className="p-1.5 rounded-md text-white/30 hover:text-[#e8d48b] hover:bg-white/[0.06] disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(row.clientId)}
                    aria-label="שכפל"
                    className="p-1.5 rounded-md text-white/30 hover:text-[#e8d48b] hover:bg-white/[0.06] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row.clientId)}
                    aria-label="מחק"
                    className="p-1.5 rounded-md text-white/30 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
