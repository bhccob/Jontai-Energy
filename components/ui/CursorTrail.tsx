'use client';

import { useEffect, useRef } from 'react';
import { CLICKABLE, CONTENT, MOTE_STEP, NO_LIGHT, emitCount, groundOf, insideAny, moteColor, moteLook, stepMote, type Box, type Mote } from '@/lib/cursorLight';

type Ground = 'dark' | 'light';

/** How quickly the trail's head catches up with the pointer (per frame at 60 fps, 0 to 1). */
const FOLLOW = 0.22;
/** At most this many specks at once. */
const MOST = 220;
/** Room kept round the page's words, pictures and buttons, in px: no speck comes nearer. */
const ROOM = 10;
/** How often the boxes of the page's content are read again while the trail is alive, in ms. */
const REREAD = 350;
/** How much faster specks age once the pointer is on something (so the trail is gone at once). */
const HURRY = 7;
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

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Specks of sunlight that follow the pointer over the page's plain ground (round 54). The logic is squared-media.nl's,
 * as Bob asked ("the cursor hover should has same logic as this site"): a trail that follows the moving pointer, thick
 * where it is and thinning behind it, gone soon after it rests. The look is Jontai's own (Bob: "dont need EXACT same
 * styling"): small round specks rise from the pointer's path like pollen in sunlight, shrink and fade; forest and leaf
 * on the light grounds, cream and mint on the deep green. It lives only on the ground between things (Bob: "it only
 * need to appear in certain places like in background that doesnt matter much"): no speck is drawn on or near a word,
 * a picture or anything that can be pressed, and once the pointer reaches one, the trail is gone at once. None in the
 * header, the menu or a product sheet, none for touch, none with reduced motion; it rests when there is nothing to draw.
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

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.floor(window.innerWidth * dpr);
      el.height = Math.floor(window.innerHeight * dpr);
      el.style.width = `${window.innerWidth}px`;
      el.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stale = true;
    };

    const seen = new WeakMap<Element, Ground | null>();
    const pointer = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };
    let motes: Mote[] = [];
    let boxes: Box[] = [];
    let readAt = -Infinity;
    let stale = true;
    let placed = false;
    let on = false;
    let ground: Ground = 'light';
    let pending: Element | null = null;
    let travel = 0; // how far the head has gone since it last left a speck, px
    let running = false;
    let frame = 0;
    let last = 0;
    size();

    // Where the words, pictures and buttons in sight are, so the specks keep off them. Only ones really showing count:
    // the closed menu's links and the footer waiting under the page have places too, but nothing to keep off.
    const read = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      boxes = [];
      document.querySelectorAll(CONTENT).forEach((node) => {
        const r = node.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) return;
        const cx = (Math.max(r.left, 0) + Math.min(r.right, w - 1)) / 2;
        const cy = (Math.max(r.top, 0) + Math.min(r.bottom, h - 1)) / 2;
        const top = document.elementFromPoint(cx, cy);
        if (!top || !(node === top || node.contains(top))) return;
        boxes.push({ l: r.left, t: r.top, r: r.right, b: r.bottom });
      });
      readAt = now;
      stale = false;
    };

    // Whether the pointer is on the plain ground, and which.
    const look = (at: Element | null) => {
      on = !!at && !at.closest(NO_LIGHT) && !at.closest(CONTENT) && !at.closest(CLICKABLE);
      if (on) ground = groundAt(at, seen);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (pending) {
        look(pending);
        pending = null;
      }
      if (stale || now - readAt > REREAD) read(now);

      // The head eases after the pointer; specks are left along the way it moved, on the plain ground only.
      const k = 1 - Math.pow(1 - FOLLOW, dt * 60);
      const fromX = head.x;
      const fromY = head.y;
      head.x += (pointer.x - head.x) * k;
      head.y += (pointer.y - head.y) * k;
      const moved = Math.hypot(head.x - fromX, head.y - fromY);
      travel = on ? Math.min(travel + moved, MOTE_STEP * 4) : 0;
      if (on && dt > 0) {
        const n = Math.min(emitCount(travel), MOST - motes.length);
        travel -= emitCount(travel) * MOTE_STEP;
        const vx = (head.x - fromX) / dt;
        for (let i = 0; i < n; i++) {
          const t = (i + Math.random()) / n;
          const x = fromX + (head.x - fromX) * t + rand(-5, 5);
          const y = fromY + (head.y - fromY) * t + rand(-5, 5);
          if (insideAny(x, y, boxes, ROOM)) continue;
          const bright = Math.random();
          const span = rand(0.6, 1.05);
          motes.push({
            x,
            y,
            vx: rand(-14, 14) + vx * 0.06,
            vy: rand(-36, -10),
            life: span,
            span,
            size: rand(1.6, 3.6),
            tone: bright > 0.8 ? 2 : bright > 0.35 ? 1 : 0,
          });
        }
      }

      const hurry = on ? 1 : HURRY;
      const next: Mote[] = [];
      for (const m of motes) {
        const s = stepMote(m, dt, hurry);
        if (s) next.push(s);
      }
      motes = next;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const m of motes) {
        if (insideAny(m.x, m.y, boxes, ROOM * 0.5)) continue;
        const { radius, alpha } = moteLook(m);
        const rgb = moteColor(ground, m.tone);
        // The brightest specks carry a faint halo of their own light.
        if (m.tone === 2) {
          ctx.fillStyle = `rgba(${rgb}, ${(alpha * 0.18).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, radius * 2.6, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${rgb}, ${(alpha * (ground === 'light' ? 0.75 : 0.85)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, radius, 0, TAU);
        ctx.fill();
      }

      if (!motes.length && moved < 0.2) {
        running = false;
        return;
      }
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
      pending = e.target instanceof Element ? e.target : null;
      wake();
    };
    // The page slides under a resting pointer: the boxes move, and what lies under the pointer may change.
    const scrolled = () => {
      stale = true;
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
