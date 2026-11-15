'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** How much of the held stretch the filling takes; the rest holds the full sentence with its points. */
const FILL = 0.8;
/** Where the six points rise in. */
const POINTS_AT = 0.84;

/**
 * Holds Our solution on the screen for three screens of scroll (data-held, air.css) while its words fill in one after
 * another, then shows the points. With reduced motion nothing is held and the sentence shows full.
 */
export function SolutionMotion() {
  useGSAP(() => {
    const section = document.getElementById('solution');
    const points = section?.querySelector<HTMLElement>('.solution__points');
    if (!section || !points) return;
    const words = section.querySelectorAll<HTMLElement>('.solution__text .wi');
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      section.dataset.held = 'true';
      ScrollTrigger.refresh();
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (st) => points.classList.toggle('is-on', st.progress > POINTS_AT),
        },
      });
      tl.fromTo(words, { opacity: 0.14 }, { opacity: 1, duration: 1, stagger: 1, ease: 'none' }, 0);
      // An empty stretch after the last word, so the full sentence holds before the page lets go.
      tl.to({}, { duration: (words.length * (1 - FILL)) / FILL });
      return () => {
        delete section.dataset.held;
        points.classList.remove('is-on');
      };
    });
    return () => mm.revert();
  });
  return null;
}
