/**
 * WhatsApp Button Component
 * 
 * Floating action button for direct WhatsApp communication.
 * Pulls dynamic contact info from project/user data.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Send, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface WhatsAppButtonProps {
  /** Phone number to contact */
  phone?: string | null;
  /** Project name for context */
  projectName?: string;
  /** Custom message template */
  messageTemplate?: string;
  /** Position */
  position?: 'left' | 'right';
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Default WeCcelerate support number
const DEFAULT_PHONE = '+972535551234';

// Pre-defined message templates
const MESSAGE_TEMPLATES = [
  { id: 'general', label: 'שאלה כללית', message: 'היי, יש לי שאלה לגבי הפרויקט שלי' },
  { id: 'meeting', label: 'תיאום פגישה', message: 'היי, אני רוצה לתאם פגישה' },
  { id: 'update', label: 'עדכון סטטוס', message: 'היי, אני רוצה לעדכן על התקדמות הפרויקט' },
  { id: 'urgent', label: 'בקשה דחופה', message: 'היי, יש לי בקשה דחופה - ' },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Israeli numbers
  if (cleaned.startsWith('0')) {
    cleaned = '972' + cleaned.substring(1);
  }
  
  // Ensure it starts with country code
  if (!cleaned.startsWith('972')) {
    cleaned = '972' + cleaned;
  }
  
  return cleaned;
}

function buildWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function WhatsAppButton({
  phone,
  projectName,
  messageTemplate,
  position = 'left',
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Use provided phone or default
  const contactPhone = phone || DEFAULT_PHONE;

  // Build context prefix
  const contextPrefix = projectName
    ? `[${projectName}] `
    : '';

  // Handle quick message selection
  const handleQuickMessage = (template: typeof MESSAGE_TEMPLATES[0]) => {
    const fullMessage = contextPrefix + template.message;
    const url = buildWhatsAppUrl(contactPhone, fullMessage);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  // Handle custom message send
  const handleCustomMessage = () => {
    if (!customMessage.trim()) return;
    const fullMessage = contextPrefix + customMessage;
    const url = buildWhatsAppUrl(contactPhone, fullMessage);
    window.open(url, '_blank');
    setCustomMessage('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>

      {/* Floating Button & Panel */}
      <div className={cn(
        'fixed bottom-6 z-50',
        position === 'left' ? 'left-6' : 'right-6'
      )}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-l from-green-500 to-green-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">צור קשר בוואטסאפ</h3>
                      <p className="text-xs opacity-80">מענה מהיר בזמן אמת</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick messages */}
              <div className="p-4 border-b border-slate-100">
                <p className="text-xs text-slate-500 mb-3">הודעות מהירות</p>
                <div className="grid grid-cols-2 gap-2">
                  {MESSAGE_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleQuickMessage(template)}
                      className="px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors text-right"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom message */}
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-2">או כתוב הודעה חופשית</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomMessage()}
                    placeholder="מה תרצה לשאול?"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                  <button
                    onClick={handleCustomMessage}
                    disabled={!customMessage.trim()}
                    className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Direct call option */}
              <div className="px-4 pb-4">
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>העדפה להתקשר? לחץ כאן</span>
                </a>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 text-center">
                <p className="text-xs text-slate-400">
                  זמני מענה: א׳-ה׳ 9:00-18:00
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center',
            'transition-all duration-300',
            isOpen
              ? 'bg-slate-800 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <ChevronUp className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="whatsapp"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {/* WhatsApp Icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 fill-current"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse effect when closed */}
          {!isOpen && (
            <>
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </>
          )}
        </motion.button>

        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-4 right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg whitespace-nowrap"
          >
            צריכים עזרה? 💬
            <div className="absolute top-1/2 -translate-y-1/2 left-full border-8 border-transparent border-l-slate-900" />
          </motion.div>
        )}
      </div>
    </>
  );
}

export default WhatsAppButton;
