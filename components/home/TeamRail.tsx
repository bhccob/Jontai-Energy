'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

/**
 * The team's sliding row: a scroller that snaps to each person, with previous and next, a count of who is in view and
 * a bar for how far along the row you are. With a mouse it can also be dragged, and it glides on a little when let go.
 * Touch scrolls it natively. The row's own scrolling is kept for keyboards and screen readers (it is a list).
 */
export function TeamRail({ count, children }: { count: number; children: ReactNode }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [first, setFirst] = useState(0);
  const [shown, setShown] = useState(2);
  const [progress, setProgress] = useState(0);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(':scope > li');
    if (!item) return;
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0;
    const step = item.offsetWidth + gap;
    const per = Math.max(1, Math.round((el.clientWidth + gap) / step));
    setShown(per);
    setFirst(Math.round(el.scrollLeft / step));
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
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
      el.removeEventListener('scroll', measure);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, [measure]);

  const go = (dir: number) => {
    const el = scroller.current;
    const item = el?.querySelector<HTMLElement>(':scope > li');
    if (!el || !item) return;
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0;
    el.scrollBy({ left: dir * (item.offsetWidth + gap), behavior: 'smooth' });
  };

  const last = Math.min(count, first + shown);
  return (
    <div className="team__rail">
      <ul ref={scroller} className="team__scroller" aria-label="The team">
        {children}
      </ul>
      <div className="team__nav">
        <button type="button" className="team__btn" aria-label="Previous people" onClick={() => go(-1)} disabled={first <= 0}>
          <ArrowLeft size={18} weight="bold" aria-hidden="true" />
        </button>
        <button type="button" className="team__btn" aria-label="More people" onClick={() => go(1)} disabled={last >= count}>
          <ArrowRight size={18} weight="bold" aria-hidden="true" />
        </button>
        <span className="team__count" aria-live="polite">
          {first + 1}–{last} <span>of {count}</span>
        </span>
        <span className="team__progress" aria-hidden="true">
          <i style={{ width: `${Math.round((shown / count) * 100)}%`, left: `${Math.round(progress * (100 - (shown / count) * 100))}%` }} />
        </span>
      </div>
    </div>
  );
}
