'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MOTION = '(prefers-reduced-motion: no-preference)';

/**
 * The collection's motion, kept quiet (round 39, Bob: "more business design and scrolling not too game like"): the page
 * scrolls normally, and each range's words and products rise a little and fade in once as they arrive, a few at a time.
 * Gone: the row that held for the scroll and moved sideways, the frames that leaned toward the pointer, the round
 * "View" that followed it, and the pictures that swayed with the speed of the scroll.
 */
export function CollectionMotion() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = ref.current?.closest<HTMLElement>('.collection');
    if (!section) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION, () => {
      const items = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.range__info, .product, .range__other'));
      gsap.set(items, { autoAlpha: 0, y: 28 });
      const batches = ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
      });
      return () => {
        batches.forEach((b) => b.kill());
        gsap.set(items, { clearProps: 'opacity,visibility,transform' });
      };
    });
  });

  return <span ref={ref} hidden />;
}
