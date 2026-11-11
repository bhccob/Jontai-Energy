'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Wide and tall enough for the first view to fit the screen, so it can hold while Rewards slides over it. */
const HOLDS = '(min-width: 961px) and (min-height: 640px)';
const MOTION = '(prefers-reduced-motion: no-preference)';

/**
 * As the first view scrolls away its layers come apart, each at its own distance: the grass nearest rushes up, the
 * island rises and turns, the name sinks back into the valley letter by letter, the words lag, the valley barely moves.
 * On wide screens the first view also holds still while Rewards slides up over it like a sheet, and it sinks back and
 * darkens under it; the island leans toward the pointer. Transforms only, scrubbed to the scroll; none with reduced
 * motion. (The entrance and the island's bob are CSS, sky.css.)
 */
export function HeroSkyMotion() {
  useGSAP(() => {
    const hero = document.getElementById('hero');
    const scope = hero?.closest<HTMLElement>('.sky-scope');
    const media = document.querySelector<HTMLElement>('.sky__media');
    if (!hero || !scope) return;
    const mm = gsap.matchMedia();

    mm.add({ motion: MOTION, holds: HOLDS }, (ctx) => {
      const { motion, holds } = ctx.conditions as Record<string, boolean>;
      if (!motion) return;
      const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
      gsap.to(hero.querySelector('.hero__island'), { yPercent: holds ? -30 : -8, rotate: holds ? -4 : -2, ease: 'none', scrollTrigger: scrub });
      gsap.to(hero.querySelector('.hero__top'), { yPercent: holds ? -18 : 0, opacity: holds ? 0.2 : 1, ease: 'none', scrollTrigger: scrub });
      gsap.to(hero.querySelector('.hero__grass'), { y: -60, ease: 'none', scrollTrigger: scrub });
      gsap.to(hero.querySelectorAll('.hero__word .c'), { yPercent: (i) => 18 + i * 9, ease: 'none', scrollTrigger: scrub });
      if (media) gsap.fromTo(media, { scale: 1.04 }, { scale: 1.14, yPercent: -3, ease: 'none', scrollTrigger: scrub });
      if (!holds) return;
      // The sheet: the first view holds for a screen while Rewards rises over it, sinking back and darkening.
      ScrollTrigger.create({ trigger: scope, start: 'top top', end: '+=100%', pin: true, pinSpacing: false });
      gsap.fromTo(hero, { scale: 1 }, { scale: 0.92, transformOrigin: '50% 30%', ease: 'none', scrollTrigger: scrub });
      gsap.fromTo(hero.querySelector('.hero__shade'), { opacity: 0 }, { opacity: 0.55, ease: 'none', scrollTrigger: scrub });
    });

    // The island leans toward the pointer, as if the air moved it.
    mm.add(`${MOTION} and (hover: hover) and (pointer: fine) and (min-width: 961px)`, () => {
      const island = hero.querySelector<HTMLElement>('.hero__float img');
      if (!island) return;
      const toX = gsap.quickTo(island, 'x', { duration: 1.4, ease: 'power3' });
      const toY = gsap.quickTo(island, 'y', { duration: 1.4, ease: 'power3' });
      const toR = gsap.quickTo(island, 'rotationY', { duration: 1.4, ease: 'power3' });
      gsap.set(island, { transformPerspective: 1200 });
      const move = (e: PointerEvent) => {
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        toX(dx * 30);
        toY(dy * 18);
        toR(dx * 10);
      };
      window.addEventListener('pointermove', move, { passive: true });
      return () => window.removeEventListener('pointermove', move);
    });
  });
  return null;
}
