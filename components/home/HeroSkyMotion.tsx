'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The layers of the first view come apart as it scrolls away, each at its own distance: the grass nearest rushes up,
 * the island rises and turns, the name sinks back into the valley letter by letter, the headline lags, and the valley
 * itself barely moves. On wide screens the island also leans a little toward the pointer. Transforms only, scrubbed to
 * the scroll; nothing with reduced motion. (The entrance and the island's bob are CSS, sky.css.)
 */
export function HeroSkyMotion() {
  useGSAP(() => {
    const hero = document.getElementById('hero');
    const media = document.querySelector<HTMLElement>('.sky__media');
    if (!hero) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
      // On a narrow screen the island sits in the flow under the buttons, so it may only lift a little.
      const wide = () => window.innerWidth > 960;
      gsap.to(hero.querySelector('.hero__island'), { yPercent: () => (wide() ? -42 : -8), rotate: () => (wide() ? -4 : -2), ease: 'none', scrollTrigger: scrub });
      gsap.to(hero.querySelector('.hero__display'), { yPercent: () => (wide() ? 26 : 0), ease: 'none', scrollTrigger: scrub });
      gsap.to(hero.querySelector('.hero__grass'), { y: -60, ease: 'none', scrollTrigger: scrub });
      const letters = hero.querySelectorAll('.hero__word .c');
      gsap.to(letters, { yPercent: (i) => 18 + i * 9, ease: 'none', scrollTrigger: scrub });
      if (media) gsap.fromTo(media, { scale: 1.04 }, { scale: 1.14, yPercent: -3, ease: 'none', scrollTrigger: scrub });
    });
    // The island leans toward the pointer, as if the air moved it.
    mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-width: 961px)', () => {
      const island = hero.querySelector<HTMLElement>('.hero__float img');
      if (!island) return;
      const toX = gsap.quickTo(island, 'x', { duration: 1.4, ease: 'power3' });
      const toY = gsap.quickTo(island, 'y', { duration: 1.4, ease: 'power3' });
      const toR = gsap.quickTo(island, 'rotationY', { duration: 1.4, ease: 'power3' });
      gsap.set(island, { transformPerspective: 1200 });
      const move = (e: PointerEvent) => {
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        toX(dx * 28);
        toY(dy * 18);
        toR(dx * 8);
      };
      window.addEventListener('pointermove', move, { passive: true });
      return () => window.removeEventListener('pointermove', move);
    });
  });
  return null;
}
