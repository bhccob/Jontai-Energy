'use client';

import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { useLenis } from 'lenis/react';
import { X } from '@phosphor-icons/react';
import { BUNDLE_TEASER, bundleQuestion, shouldAutoOpen } from '@/lib/bundles';

const SEEN = 'jontai-bundles-seen';

/**
 * Off for now (round 48, Bob: "should remove bunbdles and discounts for now"): the header no longer shows it, and Support
 * takes its place. Put `<BundleOffer hidden={open} />` back in Header to bring it back.
 *
 * The header's "Bundle offers" button and the offers it opens. The button is the bar's one filled shape: a flat
 * forest pill with its name and nothing else (round 35, Bob: "more clean designed like bigger and more minimal"; the
 * round-32 pill carried three product pictures that popped in and fanned out). On narrow screens it says "Bundles".
 * What it opens (Bob, round 22: "in the middle"): a native dialog in the middle of the screen over a soft dimmed page.
 * Since round 38 it holds no offers; since round 41 (Bob: "make bundles just say coming soon no release month date and
 * maybe also like discount too") it says only that bundles and discounts are coming soon, with one way to hear first
 * (the contact page, with bundles chosen). The button says "Bundles & discounts", or "Deals" when the bar is narrow. Being a dialog, it keeps keyboard focus inside while open and hands it back after; Escape, the close button
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
        aria-label={BUNDLE_TEASER.name}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => {
          remember();
          setOpen(true);
        }}
      >
        <span className="offer-pill__long">{BUNDLE_TEASER.name}</span>
        <span className="offer-pill__short">{BUNDLE_TEASER.short}</span>
      </button>
      <dialog
        ref={dialog}
        id={`${id}-panel`}
        className="offer"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-text`}
        onClick={onDialogClick}
      >
        <div className="offer__head">
          <p className="offer__kicker">
            {BUNDLE_TEASER.name} <span>{BUNDLE_TEASER.when}</span>
          </p>
          <button type="button" className="offer__close" aria-label="Close" onClick={() => setOpen(false)}>
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <h2 id={`${id}-title`} className="offer__title" tabIndex={-1}>
          {BUNDLE_TEASER.title}
        </h2>
        <p id={`${id}-text`} className="offer__text">
          {BUNDLE_TEASER.text}
        </p>
        <a href={bundleQuestion()} className="offer__ask">
          {BUNDLE_TEASER.ask}
        </a>
      </dialog>
    </>
  );
}
