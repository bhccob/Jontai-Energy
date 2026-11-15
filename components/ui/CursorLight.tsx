'use client';

import { useEffect, useRef } from 'react';
import { CLICKABLE, NO_LIGHT, groundOf } from '@/lib/cursorLight';

/** The light's width in px, and how quickly it catches up with the pointer (per frame, 0 to 1). */
const SIZE = 560;
const FOLLOW = 0.11;

type Ground = 'dark' | 'light';

/** The ground an element sits on: the first colour behind it that is not see-through, looking outwards. */
function groundAt(el: Element | null, seen: WeakMap<Element, Ground | null>): Ground {
  for (let at = el; at && at !== document.documentElement; at = at.parentElement) {
    let g = seen.get(at);
    if (g === undefined) {
      g = (at as HTMLElement).dataset?.tone === 'dark' ? 'dark' : groundOf(getComputedStyle(at).backgroundColor);
      seen.set(at, g);
    }
    if (g) return g;
  }
  return 'light';
}

/**
 * A soft light that follows the pointer over the page's grounds (round 54, Bob: "i want the cursor hover to be
 * everywhere thats not clickable so like background thats not matter it should feel premium"). It trails the pointer
 * a little, as light would, and takes the ground it is over: a pale glow on the deep greens, a faint leaf tint on the
 * light ones. Over anything that can be pressed it fades away, so a button or a link is only ever itself; on the first
 * view the sun does this instead (HeroLight), and an open sheet or the menu has none. A mouse only: no light for touch,
 * and none with reduced motion. One listener for the page, moved by transform alone, resting when it has caught up.
 */
export function CursorLight() {
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = light.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const seen = new WeakMap<Element, Ground | null>();
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let placed = false;
    let frame = 0;
    let pending: Element | null = null;
    let read = 0;

    const place = () => {
      el.style.transform = `translate3d(${(x - SIZE / 2).toFixed(1)}px, ${(y - SIZE / 2).toFixed(1)}px, 0)`;
    };
    const tick = () => {
      x += (tx - x) * FOLLOW;
      y += (ty - y) * FOLLOW;
      place();
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const follow = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // What is under the pointer: whether the light shows there, and on which ground. At most once a frame.
    const look = () => {
      read = 0;
      const at = pending;
      pending = null;
      if (!at) return;
      const off = at.closest(NO_LIGHT) || at.closest(CLICKABLE);
      el.dataset.on = off ? 'false' : 'true';
      if (!off) el.dataset.ground = groundAt(at, seen);
    };
    const lookAt = (target: Element | null) => {
      pending = target;
      if (!read) read = requestAnimationFrame(look);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        el.dataset.on = 'false';
        return;
      }
      tx = e.clientX;
      ty = e.clientY;
      if (!placed) {
        placed = true;
        x = tx;
        y = ty;
        place();
      }
      follow();
      lookAt(e.target instanceof Element ? e.target : null);
    };
    // The page slides under a still pointer: what is under it changes.
    const scrolled = () => {
      if (placed) lookAt(document.elementFromPoint(tx, ty));
    };
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) el.dataset.on = 'false';
    };

    document.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', scrolled, { passive: true });
    document.addEventListener('mouseout', out);
    return () => {
      document.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scrolled);
      document.removeEventListener('mouseout', out);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(read);
    };
  }, []);

  return (
    <div ref={light} className="cursor-light" aria-hidden="true" data-on="false" data-ground="light" style={{ width: SIZE, height: SIZE }}>
      <span className="cursor-light__glow cursor-light__glow--dark" />
      <span className="cursor-light__glow cursor-light__glow--light" />
    </div>
  );
}
