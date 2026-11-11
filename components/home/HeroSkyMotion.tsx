'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Wide and tall enough for the first view to fit the screen, so it can hold while Rewards slides over it. */
const HOLDS = '(min-width: 961px) and (min-height: 640px)';
const MOTION = '(prefers-reduced-motion: no-preference)';
/** How much longer than the first view is tall the hold runs, for the sunset, in screen heights (air.css: 60vh). */
const EXTRA = 0.6;

/**
 * As the first view scrolls away its layers come apart, each at its own distance: the words lift away, the name sinks
 * letter by letter, the valley inside the letters barely moves.
 * On wide screens the first view holds while the scroll plays a sunset over the home on the island (Bob, round 26:
 * "Sunset, lights on"; round 18: "seamless transition to the next page"): golden hour, then dusk over the valley and
 * the house; the window and the porch bulb switch on; then the flight goes into the bulb (data-zoom-x/y on the figure,
 * in % of the picture), brought to the middle of the screen, and its light swells until the screen is the white
 * Rewards starts in, so Rewards follows with no edge. Transforms and opacity only, scrubbed to the scroll; none with
 * reduced motion. (The entrance and the island's bob are CSS, sky.css.)
 */
export function HeroSkyMotion() {
  useGSAP(() => {
    const hero = document.getElementById('hero');
    const scope = hero?.closest<HTMLElement>('.sky-scope');
    const media = document.querySelector<HTMLElement>('.sky__media');
    const island = hero?.querySelector<HTMLElement>('.hero__island');
    if (!hero || !scope || !island) return;
    const all = (s: string) => scope.querySelectorAll<HTMLElement>(s);
    const mm = gsap.matchMedia();

    mm.add({ motion: MOTION, holds: HOLDS }, (ctx) => {
      const { motion, holds } = ctx.conditions as Record<string, boolean>;
      if (!motion) return;
      const letters = all('.sky__name .c');
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
      // Where the island sits in the first view, from layout offsets, so the zoom's own transforms never skew the
      // measure when it is taken again on resize; and how far its zoom point has to travel to the middle of the screen.
      const offset = () => {
        let top = 0;
        let left = 0;
        for (let el: HTMLElement | null = island; el && el !== scope; el = el.offsetParent as HTMLElement | null) {
          top += el.offsetTop;
          left += el.offsetLeft;
        }
        return { top, left };
      };
      const toMiddle = () => window.innerHeight * 0.5 - (offset().top + (island.offsetHeight * zy) / 100);
      const toCentre = () => scope.clientWidth * 0.5 - (offset().left + (island.offsetWidth * zx) / 100);

      // The sunset needs room: the hold runs EXTRA screens longer than the first view is tall, and Rewards waits as
      // much lower (.sky-holds .loyal), so it still arrives under the header just as the light fills the screen.
      const root = document.documentElement;
      root.classList.add('sky-holds');

      // The first view holds on top while Rewards rises into place under it (pinSpacing off, sky-scope above .loyal):
      // the light fills the screen just as Rewards reaches the top, the hold ends, and the page is on Rewards with no
      // empty screen between (Bob, round 23: "gotta land on loyalty program").
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: () => `+=${scope.offsetHeight + window.innerHeight * EXTRA}`,
          pin: true,
          pinSpacing: false,
          scrub: 0.5,
          invalidateOnRefresh: true,
          // Released without spacing, the first view would scroll on over Rewards; by then it is all light, so it
          // steps aside (hidden) and comes back when the scroll returns into it.
          onLeave: () => gsap.set(scope, { autoAlpha: 0 }),
          onEnterBack: () => gsap.set(scope, { autoAlpha: 1 }),
        },
      });
      const gold = all('.sky__dusk--gold, .hero__tint--gold');
      const night = all('.sky__dusk--night, .hero__tint--night');
      tl.to(hero.querySelector('.hero__top'), { yPercent: -40, opacity: 0, duration: 0.3 }, 0)
        .to(letters, { yPercent: (i) => 50 + i * 12, opacity: 0, duration: 0.45, stagger: 0.02 }, 0)
        // The island comes to the middle of the screen, its bulb at the centre, growing a little while the sun sets.
        .to(island, { x: toCentre, y: toMiddle, duration: 0.5, ease: 'power2.out' }, 0)
        .fromTo(island, { transformOrigin: `${zx}% ${zy}%`, scale: 1 }, { scale: 1.15, duration: 0.36 }, 0)
        // Golden hour, then dusk, over the valley and over the house.
        .to(gold, { opacity: 1, duration: 0.14 }, 0.03)
        .to(night, { opacity: 1, duration: 0.18 }, 0.16)
        .to(gold, { opacity: 0, duration: 0.12 }, 0.22)
        // The lights come on: the window, then the porch bulb's glow.
        .to(all('.hero__lights, .hero__glow--window'), { opacity: 1, duration: 0.04 }, 0.34)
        .to(all('.hero__glow--bulb'), { opacity: 1, duration: 0.03 }, 0.39)
        // A beat on the lit house, then into the bulb, faster and faster; its light swells from it, warm at the edge
        // and white at the heart, until the screen is white: Rewards.
        .to(island, { scale: 14, duration: 0.64, ease: 'power2.in' }, 0.36)
        .fromTo(all('.hero__flood'), { scale: 0.1, opacity: 0 }, { scale: 7, duration: 0.26, ease: 'power2.in' }, 0.66)
        .to(all('.hero__flood'), { opacity: 1, duration: 0.05 }, 0.66)
        .to(all('.hero__mist'), { opacity: 1, duration: 0.14, ease: 'power1.in' }, 0.86);
      if (media) tl.fromTo(media, { scale: 1.04 }, { scale: 1.3, duration: 1 }, 0);

      return () => root.classList.remove('sky-holds');
    });

    // The island leans toward the pointer, as if the air moved it.
    mm.add(`${MOTION} and (hover: hover) and (pointer: fine) and (min-width: 961px)`, () => {
      const lean = hero.querySelector<HTMLElement>('.hero__lean');
      if (!lean) return;
      const toX = gsap.quickTo(lean, 'x', { duration: 1.4, ease: 'power3' });
      const toY = gsap.quickTo(lean, 'y', { duration: 1.4, ease: 'power3' });
      const toR = gsap.quickTo(lean, 'rotationY', { duration: 1.4, ease: 'power3' });
      // Resting values written out: left to itself GSAP would read the island's transform while the CSS entrance
      // still holds it at its start (120px down, 90%), keep that as the resting place, and the island would end
      // there, low and small, off the zoom's aim (round 26).
      gsap.set(lean, { x: 0, y: 0, scale: 1, rotationY: 0, transformPerspective: 1200 });
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
