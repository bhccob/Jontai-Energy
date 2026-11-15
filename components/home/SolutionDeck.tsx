'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { DEAL_MEDIA, STACK_MEDIA } from '@/lib/solutionDeck';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Scroll, in timeline units, between one card leaving the bottom of the screen and the next: the cards overlap in
 *  flight, so the deal reads as one movement rather than six. */
const DEAL_GAP = 0.7;
/** A short hold on the whole fan before the section lets go. */
const DEAL_HOLD = 0.6;

/**
 * Our solution's cards, dealt as the page scrolls (Solution, lib/solutionDeck). Bob: "more cinematic and have animation
 * and seem more like business".
 *
 * - Wide screens (DEAL_MEDIA): the section holds still (air.css lays out the tall track and the held stage for the same
 *   screens) while the six cards rise one by one from below the screen, turning from a slight angle into their place
 *   in the fan. Scrubbed, so scrolling back takes them away again.
 * - Tablets and phones (STACK_MEDIA): each card stops under the header and the next slides over it (CSS sticky); the
 *   one being covered sinks back a little and dims, so the deck has depth.
 *
 * Reduced motion gets neither: the fan or the deck stands still, every card readable.
 */
export function SolutionDeck() {
  useGSAP(() => {
    const section = document.getElementById('solution');
    const track = section?.querySelector<HTMLElement>('.solution__track');
    if (!section || !track) return;
    const cards = [...section.querySelectorAll<HTMLElement>('.solution__card')];
    const slots = [...section.querySelectorAll<HTMLElement>('.solution__slot')];
    if (!cards.length) return;

    const mm = gsap.matchMedia();

    mm.add(DEAL_MEDIA, () => {
      const deal = gsap.timeline({
        defaults: { duration: 1, ease: 'power3.out' },
        scrollTrigger: { trigger: track, start: 'top 40%', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
      });
      cards.forEach((card, i) => {
        deal.fromTo(
          card,
          { y: () => window.innerHeight * 0.92, rotation: i % 2 ? 9 : -9, scale: 0.94, transformOrigin: '50% 70%' },
          { y: 0, rotation: 0, scale: 1 },
          i * DEAL_GAP,
        );
      });
      deal.to({}, { duration: DEAL_HOLD });
    });

    mm.add(STACK_MEDIA, () => {
      cards.slice(0, -1).forEach((card, i) => {
        gsap.fromTo(
          card,
          { scale: 1, '--dim': 0, transformOrigin: '50% 0%' },
          { scale: 0.9, '--dim': 1, ease: 'none', scrollTrigger: { trigger: slots[i + 1], start: 'top bottom', end: 'top 30%', scrub: true } },
        );
      });
    });

    return () => mm.revert();
  });
  return null;
}
