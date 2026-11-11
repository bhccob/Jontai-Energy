'use client';

import { useEffect } from 'react';

/** Every pane of liquid glass (glass.css, letter.css) whose highlight follows the pointer. */
const PANES =
  '.nav, .btn, .chip, .sheet, .tier, .tier__info, .loyal__strip, .offer, .offer-pill, .sunclock, .team__you, .team__you-cta, .team__btn, .offer-row__go, .review, .visit__panel, .collection__all, .collection__ring';

/**
 * The light on the glass follows the pointer (Bob, round 18, liquid glass): over a pane it sets --gx/--gy, where the
 * pointer is in it, and the pane's highlight gathers there; leaving, the highlight drifts back above the pane. Fine
 * pointers only, at most once a frame, one listener for the whole page.
 */
export function GlassLight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let pending: PointerEvent | null = null;
    let frame = 0;
    let last: HTMLElement | null = null;
    const apply = () => {
      frame = 0;
      const e = pending;
      if (!e) return;
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(PANES) : null;
      if (last && last !== el) {
        last.style.removeProperty('--gx');
        last.style.removeProperty('--gy');
      }
      last = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    const move = (e: PointerEvent) => {
      pending = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener('pointermove', move, { passive: true });
    return () => {
      document.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
