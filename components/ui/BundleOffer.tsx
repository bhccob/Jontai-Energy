'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { useLenis } from 'lenis/react';
import { ArrowRight, X } from '@phosphor-icons/react';
import { BUNDLES, BUNDLE_NOTE, bundleQuestion, shouldAutoOpen } from '@/lib/bundles';

const SEEN = 'jontai-bundles-seen';

/**
 * The header's "Bundle offers" pill and the offers it opens (Bob, round 22: "in the middle with more rectangular
 * shaped"): a native dialog in the middle of the screen over a soft dimmed page, a wide rectangle with the three
 * offers side by side (name, saving, what is in it), one way to ask (the contact page), and the note that these are
 * samples. Being a dialog, it keeps keyboard focus inside while open and hands it back after; Escape, the close button
 * or a click on the dimmed page closes it, and the page holds still behind it. It opens by itself once per visit, a
 * moment after load while the visitor is still at the top, and closes when the menu opens (`hidden`).
 */
export function BundleOffer({ hidden }: { hidden: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const pill = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();

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
      setOpen(true);
      remember();
    }, 2400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  // The dialog follows `open`; the page holds still behind it, and moves again only when this dialog lets it go (so it
  // never wakes the scroll while the menu holds it).
  const held = useRef(false);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>('h2')?.focus();
      lenis?.stop();
      held.current = true;
    } else if (!open) {
      if (d.open) d.close();
      if (held.current) {
        held.current = false;
        lenis?.start();
      }
    }
  }, [open, lenis]);

  // Closed by Escape (the browser's own) or by anything else: keep the state in step.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () => setOpen(false);
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);

  // A click on the dimmed page around it (the dialog's own box, outside its content) closes it.
  const onDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) setOpen(false);
  };

  return (
    <>
      <button
        ref={pill}
        type="button"
        className="offer-pill"
        aria-label="Bundle offers"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => {
          remember();
          setOpen(true);
        }}
      >
        <span className="offer-pill__long">Bundle offers</span>
        <span className="offer-pill__short">Bundles</span>
      </button>
      <dialog ref={dialog} id={`${id}-panel`} className="offer" aria-labelledby={`${id}-title`} onClick={onDialogClick}>
        <div className="offer__head">
          <p className="offer__kicker">
            Bundle offers <span>Samples</span>
          </p>
          <button type="button" className="offer__close" aria-label="Close bundle offers" onClick={() => setOpen(false)}>
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="offer__lead">
          <h2 id={`${id}-title`} className="offer__title" tabIndex={-1}>
            Buy together,
            <br />
            pay less.
          </h2>
          <a href={bundleQuestion()} className="offer__ask">
            Ask about a bundle <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </a>
        </div>
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
        <p className="offer__note">{BUNDLE_NOTE}</p>
      </dialog>
    </>
  );
}
