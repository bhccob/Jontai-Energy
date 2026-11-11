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
 * letter by letter, the small islands rise at their own depths.
 * On wide screens the first view holds while the scroll plays a sunset over the islands (Bob, round 26: "Sunset, lights
 * on"; round 18: "seamless transition to the next page"): golden hour, then dusk over the valley and every island; the
 * garden lights on the small islands and then the main island's lamp switch on; the small islands rush past, and the
 * flight goes into the lamp's bulb (data-zoom-x/y on the figure, in % of the picture), brought to the middle of the
 * screen, whose light swells until the screen is the white Rewards starts in, so Rewards follows with no edge.
 * Transforms, opacity and the tints' colour only, scrubbed to the scroll; none with reduced motion. (The entrances and
 * the islands' bob are CSS, sky.css.)
 */
export function HeroSkyMotion() {
  useGSAP(() => {
    const hero = document.getElementById('hero');
    const scope = hero?.closest<HTMLElement>('.sky-scope');
    const media = document.querySelector<HTMLElement>('.sky__media');
    const island = hero?.querySelector<HTMLElement>('.hero__island');
    if (!hero || !scope || !island) return;
    const all = (s: string) => scope.querySelectorAll<HTMLElement>(s);
    const smalls = Array.from(all('.hero__small'));
    /** From far (0) to near (1), set on each small island in Hero. */
    const depth = (el: Element) => Number((el as HTMLElement).dataset.depth ?? 0.5);
    // Where an element sits in the first view, from layout offsets, so the motion's own transforms never skew the
    // measure when it is taken again on resize.
    const offsetOf = (el: HTMLElement) => {
      let top = 0;
      let left = 0;
      for (let n: HTMLElement | null = el; n && n !== scope; n = n.offsetParent as HTMLElement | null) {
        top += n.offsetTop;
        left += n.offsetLeft;
      }
      return { top, left };
    };
    const mm = gsap.matchMedia();

    mm.add({ motion: MOTION, holds: HOLDS }, (ctx) => {
      const { motion, holds } = ctx.conditions as Record<string, boolean>;
      if (!motion) return;
      const letters = all('.sky__name .c');
      if (!holds) {
        // Phones and short screens: the layers drift apart as the first view scrolls by.
        const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
        gsap.to(island, { yPercent: -8, ease: 'none', scrollTrigger: scrub });
        gsap.to(smalls, { yPercent: (_i: number, el: Element) => -20 - 40 * depth(el), ease: 'none', scrollTrigger: scrub });
        gsap.to(letters, { yPercent: (i) => 18 + i * 9, ease: 'none', scrollTrigger: scrub });
        if (media) gsap.fromTo(media, { scale: 1.04 }, { scale: 1.14, yPercent: -3, ease: 'none', scrollTrigger: scrub });
        return;
      }

      const zx = Number(island.dataset.zoomX ?? 50);
      const zy = Number(island.dataset.zoomY ?? 40);
      // How far the zoom point has to travel to the middle of the screen.
      const toMiddle = () => window.innerHeight * 0.5 - (offsetOf(island).top + (island.offsetHeight * zy) / 100);
      const toCentre = () => scope.clientWidth * 0.5 - (offsetOf(island).left + (island.offsetWidth * zx) / 100);
      // How far a small island moves away from the middle of the screen, the nearer the further: a little while the
      // sun sets (so they part from the main island as it comes to the middle), then fast as the scroll flies in, so
      // they have left the screen before the light fills it.
      const away = (el: HTMLElement, axis: 'x' | 'y', reach: number) => {
        const o = offsetOf(el);
        const d =
          axis === 'x'
            ? o.left + el.offsetWidth / 2 - scope.clientWidth / 2
            : o.top + el.offsetHeight / 2 - window.innerHeight / 2;
        return d * reach * (0.4 + depth(el));
      };

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
      const tints = all('.hero__tint');
      tl.to(hero.querySelector('.hero__top'), { yPercent: -40, opacity: 0, duration: 0.3 }, 0)
        .to(letters, { yPercent: (i) => 50 + i * 12, opacity: 0, duration: 0.45, stagger: 0.02 }, 0)
        // The main island comes to the middle of the screen, its bulb at the centre, growing a little while the sun
        // sets.
        .to(island, { x: toCentre, y: toMiddle, duration: 0.5, ease: 'power2.out' }, 0)
        .fromTo(island, { transformOrigin: `${zx}% ${zy}%`, scale: 1 }, { scale: 1.15, duration: 0.36 }, 0)
        // Golden hour, then dusk: over the valley, and over every island inside its own outline.
        .to(all('.sky__dusk--gold'), { opacity: 1, duration: 0.14 }, 0.03)
        .fromTo(tints, { opacity: 1, backgroundColor: '#ffffff' }, { backgroundColor: '#f6c592', duration: 0.14 }, 0.03)
        .to(all('.sky__dusk--night'), { opacity: 1, duration: 0.18 }, 0.16)
        .to(tints, { backgroundColor: '#3d4b70', duration: 0.2 }, 0.17)
        .to(all('.sky__dusk--gold'), { opacity: 0, duration: 0.12 }, 0.22)
        // The lights come on, one by one: the garden lights, then the lamp.
        .to(all('.hero__small--lantern .hero__glow'), { opacity: 1, duration: 0.03 }, 0.3)
        .to(all('.hero__small--meadow .hero__glow'), { opacity: 1, duration: 0.03 }, 0.33)
        .to(all('.hero__lights, .hero__glow--bulb'), { opacity: 1, duration: 0.04 }, 0.37)
        // A beat on the lit islands, then into the bulb, faster and faster, while the small islands rush past; its
        // light swells from it, warm at the edge and white at the heart, until the screen is white: Rewards.
        .to(island, { scale: 14, duration: 0.64, ease: 'power2.in' }, 0.36)
        .fromTo(all('.hero__flood'), { scale: 0.1, opacity: 0 }, { scale: 7, duration: 0.26, ease: 'power2.in' }, 0.66)
        .to(all('.hero__flood'), { opacity: 1, duration: 0.05 }, 0.66)
        .to(all('.hero__mist'), { opacity: 1, duration: 0.14, ease: 'power1.in' }, 0.86);
      for (const el of smalls) {
        tl.to(el, { x: () => away(el, 'x', 0.3), y: () => away(el, 'y', 0.12) - 26 * depth(el), duration: 0.36 }, 0).to(
          el,
          { x: () => away(el, 'x', 3), y: () => away(el, 'y', 3), scale: 1 + 2.6 * depth(el), duration: 0.48, ease: 'power2.in' },
          0.4,
        );
      }
      if (media) tl.fromTo(media, { scale: 1.04 }, { scale: 1.3, duration: 1 }, 0);

      return () => root.classList.remove('sky-holds');
    });

    // The islands lean toward the pointer, as if the air moved them: the main one turns a little, the small ones drift
    // by their depth, the near ones most.
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
      const drifts = smalls.flatMap((el) => {
        const drift = el.querySelector<HTMLElement>('.hero__drift');
        if (!drift) return [];
        return [
          {
            d: depth(el),
            x: gsap.quickTo(drift, 'x', { duration: 1.8, ease: 'power3' }),
            y: gsap.quickTo(drift, 'y', { duration: 1.8, ease: 'power3' }),
          },
        ];
      });
      const move = (e: PointerEvent) => {
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        toX(dx * 30);
        toY(dy * 18);
        toR(dx * 10);
        for (const f of drifts) {
          f.x(dx * 70 * f.d);
          f.y(dy * 40 * f.d);
        }
      };
      window.addEventListener('pointermove', move, { passive: true });
      return () => window.removeEventListener('pointermove', move);
    });
  });
  return null;
}
