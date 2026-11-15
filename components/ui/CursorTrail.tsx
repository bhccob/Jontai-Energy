'use client';

import { useEffect, useRef } from 'react';
import { CLICKABLE, NO_LIGHT, TRAIL_CELL, cellNoise, dotColor, dotLevel, dotSize, groundOf, trailRadius } from '@/lib/cursorLight';

type Ground = 'dark' | 'light';

/** How quickly the trail's head catches up with the pointer (per frame at 60 fps, 0 to 1). */
const FOLLOW = 0.14;
/** How many of the head's past places the trail keeps, and at most how many of them light the grid each frame. */
const LENGTH = 90;
const SAMPLES = 56;
/** How long the shimmer holds one pattern, in ms. */
const SHIMMER = 320;
const TAU = Math.PI * 2;

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
 * A trail of small dots that follows the pointer (round 54, Bob: "the cursor hover should has same logic as this site
 * https://www.squared-media.nl/"). The screen is a fine grid; the pointer's head eases after it and leaves a comet
 * behind, wide at the head and thin at the tail, and every cell the comet covers shows a dot: larger and brighter
 * where more of it lies, shimmering a little. When the pointer rests, the comet draws in and fades within a second and
 * the drawing stops. In the site's greens: forest and leaf on the light grounds, mint and cream on the deep green.
 * Over anything that can be pressed it fades away (Bob: "everywhere thats not clickable"), and the header, the menu and
 * an open product sheet have none. A mouse only, and none with reduced motion.
 */
export function CursorTrail() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let heat = new Float32Array(0);
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      el.width = Math.floor(w * dpr);
      el.height = Math.floor(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / TRAIL_CELL) + 1;
      rows = Math.ceil(h / TRAIL_CELL) + 1;
      heat = new Float32Array(cols * rows);
    };
    size();

    const seen = new WeakMap<Element, Ground | null>();
    const pointer = { x: w / 2, y: h / 2 };
    const head = { x: pointer.x, y: pointer.y };
    const trail: { x: number; y: number }[] = [];
    let placed = false;
    let energy = 0; // 1 when the pointer moves, running down while it rests
    let shown = 0; // how visible the trail is, easing after the energy (0 over something pressable)
    let on = false;
    let ground: Ground = 'light';
    let pending: Element | null = null;
    let running = false;
    let frame = 0;
    let last = 0;
    let dirty: { x: number; y: number; w: number; h: number } | null = null;

    const look = (at: Element | null) => {
      on = !!at && !at.closest(NO_LIGHT) && !at.closest(CLICKABLE);
      if (on) ground = groundAt(at, seen);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (pending) {
        look(pending);
        pending = null;
      }
      const k = 1 - Math.pow(1 - FOLLOW, dt * 60);
      head.x += (pointer.x - head.x) * k;
      head.y += (pointer.y - head.y) * k;
      energy = Math.max(0, energy - 1.2 * dt);
      shown += ((on ? energy : 0) - shown) * Math.min(1, 8 * dt);
      trail.push({ x: head.x, y: head.y });
      if (trail.length > LENGTH) trail.shift();

      if (dirty) {
        ctx.clearRect(dirty.x, dirty.y, dirty.w, dirty.h);
        dirty = null;
      }
      if (shown < 0.01 && energy === 0) {
        running = false;
        trail.length = 0;
        return;
      }
      if (trail.length < 4 || shown < 0.01) {
        frame = requestAnimationFrame(tick);
        return;
      }

      // Lay the comet on the grid: each place it has been warms the cells round it, more and wider towards the head.
      const breathe = 1 + 0.06 * Math.sin((now / 1000) * 1.6) * (1 - energy);
      const reachScale = 0.4 + 0.6 * shown;
      const stride = Math.max(1, Math.ceil(trail.length / SAMPLES));
      let c0 = cols;
      let c1 = -1;
      let r0 = rows;
      let r1 = -1;
      for (let j = 0; j < trail.length; j += stride) {
        const p = trail[j];
        const i = j / (trail.length - 1);
        const r = trailRadius(i) * breathe * reachScale;
        const amount = (0.16 + Math.pow(i, 1.8)) * stride * 0.5;
        const inv = 1 / (2 * r * r);
        const reach = 2.2 * r;
        const ca = Math.max(0, Math.floor((p.x - reach) / TRAIL_CELL));
        const cb = Math.min(cols - 1, Math.ceil((p.x + reach) / TRAIL_CELL));
        const ra = Math.max(0, Math.floor((p.y - reach) / TRAIL_CELL));
        const rb = Math.min(rows - 1, Math.ceil((p.y + reach) / TRAIL_CELL));
        if (ca > cb || ra > rb) continue;
        c0 = Math.min(c0, ca);
        c1 = Math.max(c1, cb);
        r0 = Math.min(r0, ra);
        r1 = Math.max(r1, rb);
        for (let y = ra; y <= rb; y++) {
          const dy = y * TRAIL_CELL + TRAIL_CELL / 2 - p.y;
          const row = y * cols;
          for (let x = ca; x <= cb; x++) {
            const dx = x * TRAIL_CELL + TRAIL_CELL / 2 - p.x;
            heat[row + x] += amount * Math.exp(-(dx * dx + dy * dy) * inv);
          }
        }
      }
      if (c0 > c1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      // One dot per warm cell, gathered by brightness so each brightness is one fill.
      const dots = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      const moment = Math.floor(now / SHIMMER);
      for (let y = r0; y <= r1; y++) {
        const row = y * cols;
        const cy = y * TRAIL_CELL + TRAIL_CELL / 2;
        for (let x = c0; x <= c1; x++) {
          const level = dotLevel(heat[row + x]);
          heat[row + x] = 0;
          if (level < 0) continue;
          const cx = x * TRAIL_CELL + TRAIL_CELL / 2;
          const radius = dotSize(level, cellNoise(x, y, moment + level));
          dots[level].moveTo(cx + radius, cy);
          dots[level].arc(cx, cy, radius, 0, TAU);
        }
      }
      ctx.globalAlpha = shown;
      dots.forEach((d, level) => {
        ctx.fillStyle = dotColor(ground, level);
        ctx.fill(d);
      });
      ctx.globalAlpha = 1;
      dirty = { x: (c0 - 1) * TRAIL_CELL, y: (r0 - 1) * TRAIL_CELL, w: (c1 - c0 + 3) * TRAIL_CELL, h: (r1 - r0 + 3) * TRAIL_CELL };
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!placed) {
        placed = true;
        head.x = pointer.x;
        head.y = pointer.y;
      }
      energy = 1;
      pending = e.target instanceof Element ? e.target : null;
      wake();
    };
    // The page slides under a resting pointer: what lies under it may change (a button arriving under it).
    const scrolled = () => {
      if (running && placed) pending = document.elementFromPoint(pointer.x, pointer.y);
    };
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) on = false;
    };

    window.addEventListener('resize', size);
    document.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', scrolled, { passive: true });
    document.addEventListener('mouseout', out);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', size);
      document.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scrolled);
      document.removeEventListener('mouseout', out);
    };
  }, []);

  return <canvas ref={canvas} className="cursor-trail" aria-hidden="true" />;
}
