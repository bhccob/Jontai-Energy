'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Wide and tall enough for the first view to fit the screen, so it can hold while Rewards slides over it. */
const HOLDS = '(min-width: 961px) and (min-height: 640px)';
const MOTION = '(prefers-reduced-motion: no-preference)';

/**
 * As the first view scrolls away its layers come apart, each at its own distance: the words lift away, the name sinks
 * letter by letter, the valley inside the letters barely moves.
 * On wide screens (Bob, round 18: "when scroll it will zoom on the island and seamless transition to the next page") the
 * first view holds while the scroll flies into the island: it grows toward its zoom point (data-zoom-x/y on the
 * figure, in % of the picture) and brings that point to the middle of the screen, and the morning mist rises until
 * the screen is the colour Rewards starts with, so Rewards follows with no edge. Transforms and opacity only, scrubbed
 * to the scroll; none with reduced motion. (The entrance and the island's bob are CSS, sky.css.)
 */
export function HeroSkyMotion() {
  useGSAP(() => {
    const hero = document.getElementById('hero');
    const scope = hero?.closest<HTMLElement>('.sky-scope');
    const media = document.querySelector<HTMLElement>('.sky__media');
    const island = hero?.querySelector<HTMLElement>('.hero__island');
    if (!hero || !scope || !island) return;
    const mm = gsap.matchMedia();

    mm.add({ motion: MOTION, holds: HOLDS }, (ctx) => {
      const { motion, holds } = ctx.conditions as Record<string, boolean>;
      if (!motion) return;
      const letters = scope.querySelectorAll('.sky__name .c');
      if (!holds) {
        // Phones and short screens: the layers drift apart as the first view scrolls by.
        const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
        gsap.to(island, { yPercent: -8, rotate: -2, ease: 'none', scrollTrigger: scrub });
        gsap.to(letters, { yPercent: (i) => 18 + i * 9, ease: 'none', scrollTrigger: scrub });
        if (media) gsap.fromTo(media, { scale: 1.04 }, { scale: 1.14, yPercent: -3, ease: 'none', scrollTrigger: scrub });
        return;
      }

      const zx = Number(island.dataset.zoomX ?? 50);
      const zy = Number(island.dataset.zoomY ?? 40);
      // How far the zoom point has to travel to reach the middle of the screen. Layout offsets, so the zoom's own
      // transforms never skew the measure when it is taken again on resize.
      const toMiddle = () => {
        let top = 0;
        for (let el: HTMLElement | null = island; el && el !== scope; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
        return window.innerHeight * 0.5 - (top + (island.offsetHeight * zy) / 100);
      };
      // The first view holds on top while Rewards rises into place under it (pinSpacing off, sky-scope above .loyal):
      // the mist fills the screen just as Rewards reaches the top, the hold ends, and the page is on Rewards with no
      // empty screen between (Bob, round 23: "gotta land on loyalty program").
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: () => `+=${scope.offsetHeight}`,
          pin: true,
          pinSpacing: false,
          scrub: 0.5,
          invalidateOnRefresh: true,
          // Released without spacing, the first view would scroll on over Rewards; by then it is all mist, so it steps
          // aside (hidden) and comes back when the scroll returns into it.
          onLeave: () => gsap.set(scope, { autoAlpha: 0 }),
          onEnterBack: () => gsap.set(scope, { autoAlpha: 1 }),
        },
      });
      tl.to(hero.querySelector('.hero__top'), { yPercent: -40, opacity: 0, duration: 0.3 }, 0)
        .to(letters, { yPercent: (i) => 50 + i * 12, opacity: 0, duration: 0.45, stagger: 0.02 }, 0)
        // First the island rises to the middle of the screen, then the flight in speeds up.
        .to(island, { y: toMiddle, duration: 0.55, ease: 'power2.out' }, 0)
        .fromTo(island, { transformOrigin: `${zx}% ${zy}%`, scale: 1 }, { scale: 10, duration: 1, ease: 'power3.in' }, 0)
        .to(hero.querySelector('.hero__mist'), { opacity: 1, duration: 0.3, ease: 'power1.in' }, 0.55);
      if (media) tl.fromTo(media, { scale: 1.04 }, { scale: 1.3, duration: 1 }, 0);
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
