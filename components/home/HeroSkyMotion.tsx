'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Wide and tall enough for the first view to fit the screen, so it can hold while Rewards slides over it. */
const HOLDS = '(min-width: 961px) and (min-height: 640px)';
const MOTION = '(prefers-reduced-motion: no-preference)';
/** How much longer than the first view is tall the hold runs, in screen heights (air.css: 50vh). */
const EXTRA = 0.5;
/** How far into the hold the islands have stopped bobbing and leaning, so the camera moves in on a still scene. */
const SETTLE = 0.08;

/**
 * The islands' bob while the first view holds, the same as the CSS one it replaces there (sky.css: island-float and
 * isle-bob): how far it lifts (px) and turns (deg), how long one bob lasts and where it starts (s).
 */
const BOB_MAIN = { lift: 16, turn: -0.6, period: 8, start: 2.6 };
const BOB_SMALL: Record<string, { period: number; start: number }> = {
  lantern: { period: 7, start: -2 },
  tree: { period: 9.5, start: -5 },
  meadow: { period: 8, start: -1 },
  chair: { period: 10.5, start: -7 },
};

/**
 * As the first view scrolls away its layers come apart, each at its own distance: the words lift away, the name sinks
 * letter by letter, the small islands rise at their own depths.
 * On wide screens the first view holds while one camera moves in (Bob, round 26: "i dont want the transition to change
 * color ... more seamless so the island dont move ... when it arrive at loyalty like more smooth and blended"): the
 * islands stop bobbing and leaning, then every one of them grows from the same point (data-zoom-x/y on the main island,
 * in % of its picture), so nothing slides; the sky's own white mist rises through them; and Rewards, which has risen
 * into place underneath, comes up out of the white as the mist clears. Transforms and opacity only, scrubbed to the
 * scroll; none with reduced motion. (The entrances, and the bob elsewhere, are CSS, sky.css.)
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
    // Shared by the hold and the pointer: how still the islands are (1 free, 0 settled), and where the pointer was.
    const state = { calm: 1, dx: 0, dy: 0 };
    let lean = () => {};
    const mm = gsap.matchMedia();

    mm.add({ motion: MOTION, holds: HOLDS }, (ctx) => {
      const { motion, holds } = ctx.conditions as Record<string, boolean>;
      if (!motion) return;
      const letters = all('.sky__name .c');
      if (!holds) {
        // Phones and short screens: the layers drift apart as the first view scrolls by.
        const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true };
        gsap.to(island, { yPercent: -8, ease: 'none', scrollTrigger: scrub });
        gsap.to(smalls, { yPercent: (_i: number, el: Element) => -20 - 40 * depth(el), ease: 'none', scrollTrigger: scrub });
        gsap.to(letters, { yPercent: (i) => 18 + i * 9, ease: 'none', scrollTrigger: scrub });
        if (media) gsap.fromTo(media, { scale: 1.04 }, { scale: 1.14, yPercent: -3, ease: 'none', scrollTrigger: scrub });
        return;
      }

      // The camera's point: the main island's zoom point, on the screen. Each island grows from it (its own
      // transform-origin set to that point), so together they grow as one picture would, and nothing slides.
      const zx = Number(island.dataset.zoomX ?? 50);
      const zy = Number(island.dataset.zoomY ?? 40);
      const origin = (el: HTMLElement) => {
        const o = offsetOf(island);
        const e = offsetOf(el);
        return `${o.left + (island.offsetWidth * zx) / 100 - e.left}px ${o.top + (island.offsetHeight * zy) / 100 - e.top}px`;
      };

      // The hold runs EXTRA screens longer than the first view is tall, and Rewards waits as much lower
      // (.sky-holds .loyal, on white), so it is in place under the header just as the mist clears.
      const root = document.documentElement;
      root.classList.add('sky-holds');

      // The bob, by script while the view holds (the CSS one is off, .sky-holds), so it can settle smoothly.
      const float = island.querySelector<HTMLElement>('.hero__float');
      const bobs = [
        ...(float ? [{ el: float, lift: BOB_MAIN.lift, turn: BOB_MAIN.turn, period: BOB_MAIN.period, start: BOB_MAIN.start }] : []),
        ...smalls.flatMap((el) => {
          const bob = el.querySelector<HTMLElement>('.hero__bob');
          const name = [...el.classList].find((c) => c.startsWith('hero__small--'))?.slice('hero__small--'.length) ?? '';
          const b = BOB_SMALL[name];
          return bob && b ? [{ el: bob, lift: 11, turn: 0.9, period: b.period, start: b.start }] : [];
        }),
      ].map((b) => ({ ...b, y: gsap.quickSetter(b.el, 'y', 'px'), r: gsap.quickSetter(b.el, 'rotation', 'deg') }));
      let calm = 1;
      const bob = () => {
        calm += (state.calm - calm) * 0.1;
        const now = performance.now() / 1000;
        for (const b of bobs) {
          // 0 at rest, 1 at the top of the bob, eased in and out like the CSS one.
          const w = ((1 - Math.cos((2 * Math.PI * Math.max(0, now - b.start)) / b.period)) / 2) * calm;
          b.y(-b.lift * w);
          b.r(b.turn * w);
        }
      };
      gsap.ticker.add(bob);

      // The first view holds on top while Rewards rises into place under it (pinSpacing off, sky-scope above .loyal):
      // the mist clears just as Rewards reaches the top, the hold ends, and the page is on Rewards with no empty
      // screen between (Bob, round 23: "gotta land on loyalty program").
      const isles = [island, ...smalls];
      const mist = all('.hero__mist');
      const rewards = document.querySelectorAll<HTMLElement>('#rewards .loyal__top, #rewards .tiers');
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          end: () => `+=${scope.offsetHeight + window.innerHeight * EXTRA}`,
          pin: true,
          pinSpacing: false,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            state.calm = 1 - gsap.utils.clamp(0, 1, self.progress / SETTLE);
            lean();
          },
          // Released without spacing, the first view would scroll on over Rewards; by then it is clear, so it steps
          // aside and comes back when the scroll returns into it.
          onLeave: () => gsap.set(scope, { visibility: 'hidden' }),
          onEnterBack: () => gsap.set(scope, { visibility: 'visible' }),
        },
      });
      tl.to(hero.querySelector('.hero__top'), { yPercent: -30, opacity: 0, duration: 0.28 }, 0)
        .to(letters, { yPercent: (i) => 40 + i * 10, opacity: 0, duration: 0.4, stagger: 0.02 }, 0)
        // One camera moving in: slowly at first, then more surely, every island from the same point.
        .fromTo(
          isles,
          { transformOrigin: (_i: number, el: HTMLElement) => origin(el), scale: 1 },
          { scale: 3.2, duration: 0.8, ease: 'power2.in' },
          0.06,
        )
        // The sky's white mist rises through the islands until it is all white…
        .fromTo(mist, { y: 0, yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.38, ease: 'power1.inOut' }, 0.42)
        // …then clears, and Rewards, in place underneath on white, comes up out of it.
        .to(scope, { opacity: 0, duration: 0.18, ease: 'power1.inOut' }, 0.82)
        .fromTo(rewards, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.04, ease: 'power2.out' }, 0.8);
      if (media) tl.fromTo(media, { scale: 1.04 }, { scale: 1.2, duration: 1 }, 0);

      return () => {
        gsap.ticker.remove(bob);
        gsap.set(
          bobs.map((b) => b.el),
          { clearProps: 'transform' },
        );
        root.classList.remove('sky-holds');
      };
    });

    // The islands lean toward the pointer, as if the air moved them: the main one turns a little, the small ones drift
    // by their depth, the near ones most. They settle as the camera moves in (state.calm).
    mm.add(`${MOTION} and (hover: hover) and (pointer: fine) and (min-width: 961px)`, () => {
      const leanEl = hero.querySelector<HTMLElement>('.hero__lean');
      if (!leanEl) return;
      const toX = gsap.quickTo(leanEl, 'x', { duration: 1.4, ease: 'power3' });
      const toY = gsap.quickTo(leanEl, 'y', { duration: 1.4, ease: 'power3' });
      const toR = gsap.quickTo(leanEl, 'rotationY', { duration: 1.4, ease: 'power3' });
      // Resting values written out: left to itself GSAP would read the island's transform while the CSS entrance
      // still holds it at its start (120px down, 90%), keep that as the resting place, and the island would end
      // there, low and small (round 26).
      gsap.set(leanEl, { x: 0, y: 0, scale: 1, rotationY: 0, transformPerspective: 1200 });
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
      lean = () => {
        const { dx, dy, calm } = state;
        toX(dx * 30 * calm);
        toY(dy * 18 * calm);
        toR(dx * 10 * calm);
        for (const f of drifts) {
          f.x(dx * 70 * f.d * calm);
          f.y(dy * 40 * f.d * calm);
        }
      };
      const move = (e: PointerEvent) => {
        state.dx = e.clientX / window.innerWidth - 0.5;
        state.dy = e.clientY / window.innerHeight - 0.5;
        lean();
      };
      window.addEventListener('pointermove', move, { passive: true });
      return () => {
        window.removeEventListener('pointermove', move);
        lean = () => {};
      };
    });
  });
  return null;
}
