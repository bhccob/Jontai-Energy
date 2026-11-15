'use client';

import { useEffect } from 'react';

/** How quickly the light catches up with the pointer, and comes and goes (per frame, 0 to 1). */
const FOLLOW = 0.06;
const FADE = 0.05;
/** How long after the pointer leaves before the light drifts on its own, in ms. */
const IDLE = 1200;

/**
 * Aruba sunlight under the pointer (round 54, Bob: "i want that so the first view page is interactive and seamless motion
 * with cursor hover effect"). The soft sun that rises behind the headline follows the pointer, easing after it; where it
 * shines the green veil thins, so the valley under it shows through (sky.css, --sun-x, --sun-y, --sun-on). The valley
 * leans a touch the other way and the words a touch with it, for depth (--lean-x, --lean-y). With no pointer on the first
 * view (phones, or the pointer elsewhere) the light drifts slowly by itself. Nothing moves with reduced motion, and it
 * rests while the first view is out of sight or covered by Rewards.
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
    let left = -Infinity;
    let seen = true;
    let frame = 0;

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      inside = true;
    };
    const leave = () => {
      inside = false;
      left = performance.now();
    };
    const set = (name: string, value: string) => scope.style.setProperty(name, value);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!seen || scope.dataset.covered === 'true') return;
      let target = 1;
      if (!inside && now - left > IDLE) {
        // On its own: a slow loop round the top of the screen, a little softer than under the pointer.
        const t = now / 1000;
        tx = 0.5 + Math.sin(t * 0.21) * 0.24;
        ty = 0.34 + Math.sin(t * 0.33 + 1) * 0.1;
        target = 0.55;
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
