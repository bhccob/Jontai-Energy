'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MOTION = '(prefers-reduced-motion: no-preference)';
/** How dark the first view gets once the section after it covers it, 0 to 1. */
const SHADE = 0.32;

/**
 * The first view and the section after it as one plain scroll (round 37, Bob: "redesign the transition of first page
 * view to loyalty just make it normal scroll ... like the loyalty page when scroll its on top of the first page"). The
 * first view stays where it is (sticky, sky.css) and the next section in .cover slides up over it, while the first view
 * dims a little under it: Rewards until round 54, What we sell since Bob's new order ("1. First view 2. What we sell"); once covered it stops painting and the valley stops playing. It replaces round 26's camera flight
 * into the card through the white mist. A first view taller than the screen first scrolls to its foot, then holds
 * (--cover-top). The islands that leaned toward the pointer are gone (round 38).
 */
export function HeroSkyMotion() {
  useGSAP(() => {
    const hero = document.getElementById('hero');
    const scope = hero?.closest<HTMLElement>('.sky-scope');
    const next = scope?.nextElementSibling as HTMLElement | null;
    if (!hero || !scope) return;

    // Where the first view holds: at the top, or, when it is taller than the screen, with its foot at the screen's foot.
    const hold = () => scope.style.setProperty('--cover-top', `${Math.min(0, window.innerHeight - scope.offsetHeight)}px`);
    hold();
    const sizes = new ResizeObserver(hold);
    sizes.observe(scope);
    window.addEventListener('resize', hold);

    /** Tells the valley video whether the first view is covered (SkyVideo pauses then). */
    const cover = (covered: boolean) => {
      scope.dataset.covered = covered ? 'true' : 'false';
      scope.dispatchEvent(new CustomEvent('sky:cover', { detail: covered }));
    };
    const covering = next
      ? ScrollTrigger.create({
          trigger: next,
          start: 'top bottom',
          end: 'top top',
          onLeave: () => cover(true),
          onEnterBack: () => cover(false),
        })
      : null;

    const mm = gsap.matchMedia();
    // The next section rising over it: the first view darkens a little as it goes under.
    mm.add(MOTION, () => {
      if (!next) return;
      gsap.fromTo(
        scope,
        { '--shade': 0 },
        { '--shade': SHADE, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } },
      );
    });

    return () => {
      sizes.disconnect();
      window.removeEventListener('resize', hold);
      covering?.kill();
    };
  });
  return null;
}
