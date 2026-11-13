'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Globe } from '@phosphor-icons/react/dist/ssr';
import { LANGS, langInfo, type Lang } from '@/lib/i18n/langs';
import { i18n } from '@/lib/i18n/store';

const useLang = () => useSyncExternalStore(i18n.subscribe, i18n.get, i18n.server).lang;

/**
 * The header's language button (Bob, round 33): a globe and the language in use; it opens a small list of the three,
 * each named in itself. The page changes language at once, without a reload, and the choice is kept for the next visit.
 * Escape, a pick, or a click anywhere else closes the list. Phones pick in the menu instead (LangChoices).
 */
export function LangSwitch() {
  const id = useId();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const info = langInfo(lang);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener('pointerdown', away);
    window.addEventListener('keydown', key);
    root.current?.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
    return () => {
      document.removeEventListener('pointerdown', away);
      window.removeEventListener('keydown', key);
    };
  }, [open]);

  const choose = (next: Lang) => {
    setOpen(false);
    button.current?.focus();
    if (next !== lang) void i18n.set(next);
  };

  return (
    <div ref={root} className="lang" data-i18n-skip>
      <button
        ref={button}
        type="button"
        className="lang__button"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${info.label}: ${info.name}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe size={18} weight="regular" aria-hidden="true" />
        <span lang={info.html}>{info.short}</span>
      </button>
      <ul id={`${id}-list`} className="lang__list" data-open={open} hidden={!open}>
        {LANGS.map((l) => (
          <li key={l.id}>
            <button type="button" lang={l.html} aria-current={l.id === lang} onClick={() => choose(l.id)}>
              {l.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The three languages side by side, for the full-screen menu, where phones choose. */
export function LangChoices({ onPick }: { onPick?: () => void }) {
  const lang = useLang();
  return (
    <div className="lang-row" role="group" aria-label={langInfo(lang).label} data-i18n-skip>
      <Globe size={18} weight="regular" aria-hidden="true" />
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.html}
          aria-pressed={l.id === lang}
          onClick={() => {
            if (l.id !== lang) void i18n.set(l.id);
            onPick?.();
          }}
        >
          {l.name}
        </button>
      ))}
    </div>
  );
}
