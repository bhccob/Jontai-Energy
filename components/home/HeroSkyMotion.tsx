'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Depth as the first view scrolls away: the island rises faster than the page and turns a touch, the headline lags a
 * little behind it, and the sky drifts the least, so the three read as near, middle and far. Transforms only, scrubbed
 * to the scroll; nothing with reduced motion. (The island's slow bob is CSS, sky.css.)
 */
export function HeroSkyMotion() {
  useGSAP(() => {
    const hero = document.getElementById('hero');
    const sky = document.querySelector<HTMLElement>('.sky__img');
    if (!hero) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to(hero.querySelector('.hero__island'), { yPercent: -38, rotate: -3, ease: 'none', scrollTrigger: scrub });
      gsap.to(hero.querySelector('.hero__display'), { yPercent: 22, ease: 'none', scrollTrigger: scrub });
      if (sky) gsap.fromTo(sky, { scale: 1.04 }, { scale: 1.12, yPercent: -4, ease: 'none', scrollTrigger: scrub });
    });
  });
  return null;
}
