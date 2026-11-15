'use client';

import { useEffect } from 'react';

/** How quickly the light comes in (per frame, 0 to 1), and how bright it drifts. */
const FADE = 0.03;
const GLOW = 0.6;

/**
 * Aruba sunlight drifting over the first view (round 54). The soft sun behind the headline moves slowly by itself in a
 * loop round the top of the screen; where it shines the green veil thins, so the valley under it shows through
 * (sky.css, --sun-x, --sun-y, --sun-on), and the valley and the words lean a touch with it for depth (--lean-x,
 * --lean-y). It once followed the pointer; Bob later dropped cursor effects altogether ("remove the cursor thing
 * idea"), so the sun keeps to its own slow drift. Nothing moves with reduced motion, and it rests while the first view
 * is out of sight or covered by Rewards.
 */
export function HeroLight() {
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>('.sky-scope');
    const hero = document.getElementById('hero');
    if (!scope || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let glow = 0;
    let seen = true;
    let frame = 0;
    const set = (name: string, value: string) => scope.style.setProperty(name, value);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!seen || scope.dataset.covered === 'true') return;
      const t = now / 1000;
      const x = 0.5 + Math.sin(t * 0.21) * 0.2;
      const y = 0.34 + Math.sin(t * 0.33 + 1) * 0.08;
      glow += (GLOW - glow) * FADE;
      set('--sun-x', `${(x * 100).toFixed(2)}%`);
      set('--sun-y', `${(y * 100).toFixed(2)}%`);
      set('--sun-on', glow.toFixed(3));
      set('--lean-x', (x - 0.5).toFixed(4));
      set('--lean-y', (y - 0.4).toFixed(4));
    };

    const sight = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    sight.observe(hero);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      sight.disconnect();
      for (const v of ['--sun-x', '--sun-y', '--sun-on', '--lean-x', '--lean-y']) scope.style.removeProperty(v);
    };
  }, []);
  return null;
}
