'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useLenis } from 'lenis/react';
import { ArrowRight, X } from '@phosphor-icons/react';
import { BUNDLES, BUNDLE_NOTE, bundleQuestion, shouldAutoOpen } from '@/lib/bundles';

const SEEN = 'jontai-bundles-seen';

/**
 * The header's "Bundle offers" pill and the small panel it opens under the header: three ruled rows (name, saving,
 * what is in it), one WhatsApp question, and the note that these are samples. Not a modal: the page stays usable and
 * focus stays where it was when it opens by itself (once per visit, near the top, a moment after load). Opened from
 * the pill, focus goes in; Escape or the close button closes it and focus returns to the pill. It also closes when the
 * menu opens (`hidden`) and, if it opened by itself, once the visitor scrolls on.
 */
export function BundleOffer({ hidden }: { hidden: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [byItself, setByItself] = useState(false);
  const pill = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const remember = () => {
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {
      // Private mode or blocked storage: it may open again on the next page view, which is harmless.
    }
  };

  // Once per visit, a moment after load, while the visitor is still at the top.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === '1';
    } catch {
      seen = true;
    }
    const timer = window.setTimeout(() => {
      if (!shouldAutoOpen(seen, window.scrollY, window.innerHeight)) return;
      setByItself(true);
      setOpen(true);
      remember();
    }, 2400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  // Closed, the panel is out of the tab order and the accessibility tree.
  useEffect(() => {
    if (panel.current) panel.current.inert = !open;
  }, [open]);

  // One that opened by itself leaves once the visitor scrolls well into the page.
  useLenis(
    (l) => {
      if (open && byItself && l.scroll > window.innerHeight * 0.6) setOpen(false);
    },
    [open, byItself],
  );

  // Escape closes it, and focus goes back to the pill if it was inside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const inside = panel.current?.contains(document.activeElement);
      setOpen(false);
      if (inside) pill.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const toggle = () => {
    remember();
    setByItself(false);
    setOpen((v) => {
      if (!v) window.setTimeout(() => panel.current?.querySelector<HTMLElement>('h2')?.focus(), 30);
      return !v;
    });
  };
  const close = () => {
    setOpen(false);
    pill.current?.focus();
  };

  return (
    <>
      <button ref={pill} type="button" className="offer-pill" aria-label="Bundle offers" aria-expanded={open} aria-controls={`${id}-panel`} onClick={toggle}>
        <span className="offer-pill__long">Bundle offers</span>
        <span className="offer-pill__short">Bundles</span>
      </button>
      <div ref={panel} id={`${id}-panel`} className="offer" role="dialog" aria-labelledby={`${id}-title`} data-open={open}>
        <div className="offer__head">
          <p className="offer__kicker">
            Bundle offers <span>Samples</span>
          </p>
          <button type="button" className="offer__close" aria-label="Close bundle offers" onClick={close}>
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <h2 id={`${id}-title`} className="offer__title" tabIndex={-1}>
          Buy together, pay less.
        </h2>
        <ol className="offer__list">
          {BUNDLES.map((b, i) => (
            <li key={b.id} style={{ '--i': i } as CSSProperties}>
              <p className="offer__save figure">
                {b.save}
                <span>% off</span>
              </p>
              <div className="offer__what">
                <p className="offer__name">{b.name}</p>
                <p className="offer__items">{b.items}</p>
              </div>
            </li>
          ))}
        </ol>
        <a href={bundleQuestion()} target="_blank" rel="noopener noreferrer" className="offer__ask">
          Ask on WhatsApp <ArrowRight size={18} weight="bold" aria-hidden="true" />
        </a>
        <p className="offer__note">{BUNDLE_NOTE}</p>
      </div>
    </>
  );
}
