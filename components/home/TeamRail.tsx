'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

/** Wide screens lay the row out reversed (team.css order), so it opens at its right end, next to "You?". */
const WIDE = '(min-width: 961px)';

/**
 * The team's sliding row: a scroller that snaps to each person, with two arrows, a count of who is in view and a bar
 * for how far along you are. On wide screens it moves the other way (Bob, round 15): it starts at its right end beside
 * "You?", and the arrow pushes the pictures to the right while the next people come in from the left, so nobody slides
 * out from behind "You?". With a mouse it can also be dragged and glides on a little when let go; touch scrolls it.
 */
export function TeamRail({ count, children }: { count: number; children: ReactNode }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [wide, setWide] = useState(false);
  const [first, setFirst] = useState(0);
  const [shown, setShown] = useState(2);
  const [progress, setProgress] = useState(0);

  const step = useCallback(() => {
    const el = scroller.current;
    const item = el?.querySelector<HTMLElement>(':scope > li');
    if (!el || !item) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0;
    return item.offsetWidth + gap;
  }, []);

  const measure = useCallback(() => {
    const el = scroller.current;
    const s = step();
    if (!el || !s) return;
    const max = el.scrollWidth - el.clientWidth;
    const reversed = window.matchMedia(WIDE).matches;
    // How far along the row the reader is, counted from where it opens.
    const along = reversed ? max - el.scrollLeft : el.scrollLeft;
    setShown(Math.max(1, Math.round((el.clientWidth + 14) / s)));
    setFirst(Math.round(along / s));
    setProgress(max > 0 ? along / max : 1);
  }, [step]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const mq = window.matchMedia(WIDE);
    const place = () => {
      setWide(mq.matches);
      // Open where the row starts: the right end on wide screens, the left on narrow ones.
      el.scrollLeft = mq.matches ? el.scrollWidth : 0;
      measure();
    };
    place();
    mq.addEventListener('change', place);
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // Dragging with a mouse, with a little glide on release.
    let down = false;
    let x0 = 0;
    let s0 = 0;
    let vx = 0;
    let lastX = 0;
    let lastT = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      moved = false;
      x0 = lastX = e.clientX;
      s0 = el.scrollLeft;
      lastT = performance.now();
      el.dataset.drag = 'true';
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const now = performance.now();
      if (Math.abs(e.clientX - x0) > 4) moved = true;
      el.scrollLeft = s0 - (e.clientX - x0);
      vx = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      delete el.dataset.drag;
      el.scrollBy({ left: -vx * 260, behavior: 'smooth' });
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    return () => {
      mq.removeEventListener('change', place);
      el.removeEventListener('scroll', measure);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, [measure]);

  /** Further along the row (+1) or back (-1), one person at a time. */
  const go = (dir: number) => {
    const el = scroller.current;
    const s = step();
    if (!el || !s) return;
    el.scrollBy({ left: (wide ? -dir : dir) * s, behavior: 'smooth' });
  };

  const last = Math.min(count, first + shown);
  // The arrow points to where the next people are (Bob, round 16): on wide screens they wait to the left, so the left
  // arrow brings them in (the pictures move right); on narrow screens they wait to the right, as usual.
  const Further = wide ? ArrowLeft : ArrowRight;
  const Back = wide ? ArrowRight : ArrowLeft;
  const further = (
    <button key="further" type="button" className="team__btn" aria-label="More people" onClick={() => go(1)} disabled={last >= count}>
      <Further size={18} weight="bold" aria-hidden="true" />
    </button>
  );
  const back = (
    <button key="back" type="button" className="team__btn" aria-label="Back" onClick={() => go(-1)} disabled={first <= 0}>
      <Back size={18} weight="bold" aria-hidden="true" />
    </button>
  );
  return (
    <div className="team__rail">
      <ul ref={scroller} className="team__scroller" aria-label="The team">
        {children}
      </ul>
      <div className="team__nav">
        {wide ? [further, back] : [back, further]}
        <span className="team__count" aria-live="polite">
          {first + 1}–{last} <span>of {count}</span>
        </span>
        <span className="team__progress" data-wide={wide || undefined} aria-hidden="true">
          {/* The bar sits where the view is along the row: from the right on wide screens, which open at the right. */}
          <i style={{ width: `${Math.round((shown / count) * 100)}%`, left: `${Math.round((wide ? 1 - progress : progress) * (100 - (shown / count) * 100))}%` }} />
        </span>
      </div>
    </div>
  );
}
