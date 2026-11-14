'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

/**
 * A range with more than two products (round 40, Bob: "if theres more than 2 products in 1 category like led lighting i
 * want it to only show 2 products and the rest need to scroll"): two in view, the rest waiting to the right. It scrolls
 * sideways and snaps to each product; two arrows, a count of which are in view and a bar for how far along, as the
 * team's row has. With a mouse it drags like a slide (left button held: it follows the pointer, glides on when let go
 * and settles on the nearest product; a drag never opens a product); touch and trackpads scroll it.
 */
export function ProductRail({ count, labelledBy, children }: { count: number; labelledBy: string; children: ReactNode }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [first, setFirst] = useState(0);
  const [shown, setShown] = useState(2);
  const [progress, setProgress] = useState(0);

  /** One product's width and the gap after it. */
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
    setShown(Math.max(1, Math.round(el.clientWidth / s)));
    setFirst(Math.round(el.scrollLeft / s));
    setProgress(max > 0 ? el.scrollLeft / max : 1);
  }, [step]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // Dragging with a mouse, with a little glide on release; a drag is not a click on the product under it.
    let down = false;
    let x0 = 0;
    let s0 = 0;
    let vx = 0;
    let lastX = 0;
    let lastT = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      x0 = lastX = e.clientX;
      s0 = el.scrollLeft;
      lastT = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      if (!moved && Math.abs(e.clientX - x0) > 5) {
        moved = true;
        el.dataset.drag = 'true';
      }
      if (!moved) return;
      const now = performance.now();
      el.scrollLeft = s0 - (e.clientX - x0);
      vx = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      delete el.dataset.drag;
      // Let go: it glides on in the direction it was thrown and settles on the nearest product, like a slide.
      const s = step();
      if (!s) return;
      // A flick carries it on by at most two products, so a quick throw never empties the whole slide.
      const glide = Math.max(-2 * s, Math.min(2 * s, -vx * 220));
      const target = Math.round((el.scrollLeft + glide) / s) * s;
      el.scrollTo({ left: Math.max(0, Math.min(el.scrollWidth - el.clientWidth, target)), behavior: 'smooth' });
    };
    // A picture or a link would otherwise be picked up and dragged away by the browser, and the slide would not move.
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    el.addEventListener('dragstart', onDragStart);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
      el.removeEventListener('dragstart', onDragStart);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, [measure, step]);

  /** Further along (+1) or back (-1), one product at a time. */
  const go = (dir: number) => {
    const el = scroller.current;
    const s = step();
    if (el && s) el.scrollBy({ left: dir * s, behavior: 'smooth' });
  };

  const last = Math.min(count, first + shown);
  const part = Math.min(1, shown / count);
  return (
    <div className="rail">
      <ul ref={scroller} className="range__products range__products--rail" aria-labelledby={labelledBy}>
        {children}
      </ul>
      <div className="rail__nav">
        <button type="button" className="rail__btn" aria-label="Back" onClick={() => go(-1)} disabled={first <= 0}>
          <ArrowLeft size={18} weight="bold" aria-hidden="true" />
        </button>
        <button type="button" className="rail__btn" aria-label="More products" onClick={() => go(1)} disabled={last >= count}>
          <ArrowRight size={18} weight="bold" aria-hidden="true" />
        </button>
        <span className="rail__count" aria-live="polite">
          {first + 1}–{last} <span>of {count}</span>
        </span>
        <span className="rail__progress" aria-hidden="true">
          <i style={{ width: `${Math.round(part * 100)}%`, left: `${Math.round(progress * (100 - part * 100))}%` }} />
        </span>
      </div>
    </div>
  );
}
