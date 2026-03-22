'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Accessibility,
  X,
  Plus,
  Minus,
  RotateCcw,
  Contrast,
  Eye,
  MousePointer2,
  Pause,
  Link2,
  ALargeSmall,
  ScanLine,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TYPES
// =============================================================================

interface A11ySettings {
  fontSize: number;       // 0 = default, 1–5 = increase levels
  highContrast: boolean;
  grayscale: boolean;
  stopAnimations: boolean;
  highlightLinks: boolean;
  largeCursor: boolean;
  readingGuide: boolean;
}

const DEFAULT_SETTINGS: A11ySettings = {
  fontSize: 0,
  highContrast: false,
  grayscale: false,
  stopAnimations: false,
  highlightLinks: false,
  largeCursor: false,
  readingGuide: false,
};

const STORAGE_KEY = 'weccelerate-a11y';

// =============================================================================
// ACCESSIBILITY WIDGET
// =============================================================================

export function AccessibilityWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_SETTINGS);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mouseY, setMouseY] = useState(0);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<A11ySettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Apply settings to <html>
  useEffect(() => {
    const html = document.documentElement;

    // Font size
    const sizePct = 100 + settings.fontSize * 12.5; // each step = +12.5%
    html.style.fontSize = settings.fontSize === 0 ? '' : `${sizePct}%`;

    // High contrast
    html.classList.toggle('a11y-high-contrast', settings.highContrast);

    // Grayscale
    html.classList.toggle('a11y-grayscale', settings.grayscale);

    // Stop animations
    html.classList.toggle('a11y-stop-animations', settings.stopAnimations);

    // Highlight links
    html.classList.toggle('a11y-highlight-links', settings.highlightLinks);

    // Large cursor
    html.classList.toggle('a11y-large-cursor', settings.largeCursor);

    // Reading guide
    html.classList.toggle('a11y-reading-guide', settings.readingGuide);
  }, [settings]);

  // Reading guide: track mouse Y position
  useEffect(() => {
    if (!settings.readingGuide) return;
    const handleMouse = (e: MouseEvent) => setMouseY(e.clientY);
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [settings.readingGuide]);

  // Close panel on Escape, focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const update = useCallback(
    <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const hasActiveSettings =
    settings.fontSize !== 0 ||
    settings.highContrast ||
    settings.grayscale ||
    settings.stopAnimations ||
    settings.highlightLinks ||
    settings.largeCursor ||
    settings.readingGuide;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('a11y.title') : t('a11y.open')}
        aria-expanded={isOpen}
        aria-controls="a11y-panel"
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-black/25 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Accessibility className="w-7 h-7" aria-hidden="true" />
        )}
        {/* Active indicator dot */}
        {hasActiveSettings && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 rounded-full border-2 border-[#2563EB] animate-pulse" aria-hidden="true" />
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('a11y.title')}
          className="fixed bottom-24 right-6 z-[9998] w-[340px] max-h-[80vh] overflow-y-auto bg-[#0c1130] border border-white/10 rounded-2xl shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0c1130] border-b border-white/10 px-5 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Accessibility className="w-5 h-5 text-gold-400" aria-hidden="true" />
              <h2 className="text-white font-bold text-base">{t('a11y.title')}</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={t('a11y.title')}
              className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Controls */}
          <div className="p-5 space-y-3">
            {/* Font Size */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <ALargeSmall className="w-5 h-5 text-gold-400" aria-hidden="true" />
                <span className="text-white text-sm font-medium">{t('a11y.fontSize')}</span>
                {settings.fontSize > 0 && (
                  <span className="text-gold-400 text-xs font-bold mr-auto" dir="ltr">
                    +{settings.fontSize * 12.5}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update('fontSize', Math.max(0, settings.fontSize - 1))}
                  disabled={settings.fontSize === 0}
                  aria-label={t('a11y.decreaseFont')}
                  className="w-10 h-10 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all"
                    style={{ width: `${(settings.fontSize / 5) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={settings.fontSize}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label={t('a11y.fontLevel')}
                  />
                </div>
                <button
                  onClick={() => update('fontSize', Math.min(5, settings.fontSize + 1))}
                  disabled={settings.fontSize === 5}
                  aria-label={t('a11y.increaseFont')}
                  className="w-10 h-10 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Toggle Buttons */}
            <ToggleButton
              icon={<Contrast className="w-5 h-5" aria-hidden="true" />}
              label={t('a11y.contrast')}
              active={settings.highContrast}
              onToggle={() => update('highContrast', !settings.highContrast)}
            />
            <ToggleButton
              icon={<Eye className="w-5 h-5" aria-hidden="true" />}
              label={t('a11y.grayscale')}
              active={settings.grayscale}
              onToggle={() => update('grayscale', !settings.grayscale)}
            />
            <ToggleButton
              icon={<Pause className="w-5 h-5" aria-hidden="true" />}
              label={t('a11y.animations')}
              active={settings.stopAnimations}
              onToggle={() => update('stopAnimations', !settings.stopAnimations)}
            />
            <ToggleButton
              icon={<Link2 className="w-5 h-5" aria-hidden="true" />}
              label={t('a11y.links')}
              active={settings.highlightLinks}
              onToggle={() => update('highlightLinks', !settings.highlightLinks)}
            />
            <ToggleButton
              icon={<MousePointer2 className="w-5 h-5" aria-hidden="true" />}
              label={t('a11y.largeCursor')}
              active={settings.largeCursor}
              onToggle={() => update('largeCursor', !settings.largeCursor)}
            />
            <ToggleButton
              icon={<ScanLine className="w-5 h-5" aria-hidden="true" />}
              label={t('a11y.readingGuide')}
              active={settings.readingGuide}
              onToggle={() => update('readingGuide', !settings.readingGuide)}
            />

            {/* Reset */}
            {hasActiveSettings && (
              <button
                onClick={resetAll}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                {t('a11y.reset')}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-5 py-3">
            <p className="text-white/30 text-xs text-center">
              {t('a11y.footer')}
            </p>
          </div>
        </div>
      )}

      {/* Reading Guide Overlay */}
      {settings.readingGuide && (
        <div className="fixed inset-0 z-[9990] pointer-events-none" aria-hidden="true">
          {/* Top dark overlay */}
          <div
            className="absolute left-0 right-0 top-0 bg-black/40 transition-all duration-75"
            style={{ height: Math.max(0, mouseY - 20) }}
          />
          {/* Highlighted reading strip */}
          <div
            className="absolute left-0 right-0 border-y border-gold-500/40"
            style={{ top: Math.max(0, mouseY - 20), height: 40 }}
          />
          {/* Bottom dark overlay */}
          <div
            className="absolute left-0 right-0 bottom-0 bg-black/40 transition-all duration-75"
            style={{ top: mouseY + 20 }}
          />
        </div>
      )}
    </>
  );
}

// =============================================================================
// TOGGLE BUTTON — reusable row in the panel
// =============================================================================

function ToggleButton({
  icon,
  label,
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={active}
      aria-label={label}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-sm font-medium
        ${active
          ? 'bg-gold-500/15 border border-gold-500/30 text-gold-400'
          : 'bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/[0.08] hover:text-white'}
      `}
    >
      <span className={active ? 'text-gold-400' : 'text-white/40'}>{icon}</span>
      <span className="flex-1 text-right">{label}</span>
      {/* Switch indicator */}
      <span
        className={`
          relative w-10 h-6 rounded-full transition-colors
          ${active ? 'bg-gold-500' : 'bg-white/10'}
        `}
        aria-hidden="true"
      >
        <span
          className={`
            absolute top-1 w-4 h-4 rounded-full bg-white transition-all
            ${active ? 'right-1' : 'right-5'}
          `}
        />
      </span>
    </button>
  );
}
