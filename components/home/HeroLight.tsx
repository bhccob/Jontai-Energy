'use client';

import { useEffect } from 'react';
import { CLICKABLE } from '@/lib/cursorLight';

/** How quickly the light catches up with the pointer, and comes and goes (per frame, 0 to 1). */
const FOLLOW = 0.045;
const FADE = 0.04;
/** How long after the pointer leaves before the light drifts on its own, in ms. */
const IDLE = 1200;
/** How far the sun goes towards the pointer (1: all the way), so it leans after it rather than chasing it. */
const REACH = 0.6;

/**
 * Aruba sunlight under the pointer (round 54, Bob: "i want that so the first view page is interactive and seamless motion
 * with cursor hover effect"). The soft sun that rises behind the headline follows the pointer, easing after it; where it
 * shines the green veil thins, so the valley under it shows through (sky.css, --sun-x, --sun-y, --sun-on). The valley
 * leans a touch the other way and the words a touch with it, for depth (--lean-x, --lean-y). With no pointer on the first
 * view (phones, or the pointer elsewhere) the light drifts slowly by itself. Nothing moves with reduced motion, and it
 * rests while the first view is out of sight or covered by Rewards. Softer since (Bob: "the cursor hover should be
 * less"): the sun leans only part of the way towards the pointer, the veil thins less, and over a button or a link it
 * holds where it is and dims, so only the ground answers the pointer (Bob: "everywhere thats not clickable").
 */
export function HeroLight() {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>('.sky-scope');
    const hero = document.getElementById('hero');
    if (!scope || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let tx = 0.5;
    let ty = 0.32;
    let x = tx;
    let y = ty;
    let glow = 0;
    let inside = false;
    let pressable = false;
    let left = -Infinity;
    let seen = true;
    let frame = 0;

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      inside = true;
      pressable = e.target instanceof Element && e.target.closest(CLICKABLE) !== null;
      if (pressable) return;
      const r = hero.getBoundingClientRect();
      tx = 0.5 + ((e.clientX - r.left) / r.width - 0.5) * REACH;
      ty = 0.34 + ((e.clientY - r.top) / r.height - 0.34) * REACH;
    };
    const leave = () => {
      inside = false;
      pressable = false;
      left = performance.now();
    };
    const set = (name: string, value: string) => scope.style.setProperty(name, value);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!seen || scope.dataset.covered === 'true') return;
      let target = pressable ? 0.35 : 0.8;
      if (!inside && now - left > IDLE) {
        // On its own: a slow loop round the top of the screen, a little softer than under the pointer.
        const t = now / 1000;
        tx = 0.5 + Math.sin(t * 0.21) * 0.18;
        ty = 0.34 + Math.sin(t * 0.33 + 1) * 0.07;
        target = 0.45;
      }
      x += (tx - x) * FOLLOW;
      y += (ty - y) * FOLLOW;
      glow += (target - glow) * FADE;
      set('--sun-x', `${(x * 100).toFixed(2)}%`);
      set('--sun-y', `${(y * 100).toFixed(2)}%`);
      set('--sun-on', glow.toFixed(3));
      set('--lean-x', (x - 0.5).toFixed(4));
      set('--lean-y', (y - 0.4).toFixed(4));
    };

    const sight = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    sight.observe(hero);
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      sight.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      for (const v of ['--sun-x', '--sun-y', '--sun-on', '--lean-x', '--lean-y']) scope.style.removeProperty(v);
    };
  }, []);
  return null;
}
