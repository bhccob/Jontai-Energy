'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Wide and tall enough for the islands to float around the title without touching it. */
const ROOMY = '(min-width: 961px) and (min-height: 600px)';
const MOTION = '(prefers-reduced-motion: no-preference)';

/**
 * The archipelago's motion. The islands lean away from the pointer by their depth (data-depth), as near things move
 * more than far ones. Scrolled on, they scatter outward from the title, nearer ones further and bigger, the title
 * swells and fades, and the morning mist comes up behind them, so the walk's first island arrives in daylight.
 */
export function ArchipelagoMotion() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const root = ref.current?.closest<HTMLElement>('.archipelago');
    if (!root) return;
    const isles = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.archipelago__isles > li'));
    const mm = gsap.matchMedia();

    mm.add(`${ROOMY} and ${MOTION}`, () => {
      // Leaning with the pointer.
      const leans = isles.map((li) => {
        const img = li.querySelector<HTMLElement>('.isle__float');
        const d = Number(li.dataset.depth ?? 0.6);
        return { d, x: img && gsap.quickTo(img, 'x', { duration: 1.2, ease: 'power3' }), y: img && gsap.quickTo(img, 'y', { duration: 1.2, ease: 'power3' }) };
      });
      const move = (e: PointerEvent) => {
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        leans.forEach(({ d, x, y }) => {
          x?.(-dx * 60 * d);
          y?.(-dy * 40 * d);
        });
      };
      window.addEventListener('pointermove', move, { passive: true });

      // Scattering as the scroll goes on, and the morning coming up.
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
      // The first stretch is a hold: the archipelago rests whole, to be looked at and picked from.
      const HOLD = 0.5;
      isles.forEach((li) => {
        const d = Number(li.dataset.depth ?? 0.6);
        const x = parseFloat(li.style.getPropertyValue('--x')) - 50;
        const y = parseFloat(li.style.getPropertyValue('--y')) - 50;
        tl.to(li, { x: () => (x / 100) * window.innerWidth * 0.9 * d, y: () => (y / 100) * window.innerHeight * 0.9 * d, scale: 1 + 0.6 * d, duration: 1 }, HOLD);
        tl.to(li, { opacity: 0, duration: 0.35 }, HOLD + 0.55);
      });
      tl.to(root.querySelector('.archipelago__head'), { scale: 1.12, opacity: 0, duration: 0.6 }, HOLD + 0.15);
      tl.fromTo(root.querySelector('.archipelago__dawn'), { opacity: 0 }, { opacity: 1, duration: 0.45 }, HOLD + 0.55);

      return () => {
        window.removeEventListener('pointermove', move);
      };
    });
  });

  return <span ref={ref} hidden />;
}
