'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { DEAL_MEDIA, STACK_MEDIA, cardCount, slideShape } from '@/lib/solutionDeck';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Where the strip starts: its first card this far across the screen (a fraction of the width). */
const SLIDE_FROM = 0.62;
/** A short hold, in strip lengths, with the last card in place before the section lets go. */
const SLIDE_HOLD = 0.1;

/**
 * Our solution's cards in motion (Solution, lib/solutionDeck). Bob: "more cinematic and have animation and seem more
 * like business"; of the options after design 1, "maybe design 3".
 *
 * - Wide screens (DEAL_MEDIA): the section holds still (air.css lays out the tall track and the held stage for the same
 *   screens) while the strip of cards runs in from the right and across. Each card leans away from the middle of the
 *   screen and sits back a little, and stands straight as it passes the middle; the count under the strip and its rule
 *   follow how far the strip has run (01 / 06 to 06 / 06). Scrubbed, so scrolling back runs it back.
 * - Tablets and phones (STACK_MEDIA): each card stops under the header and the next slides over it (CSS sticky); the
 *   one being covered sinks back a little and dims, so the deck has depth.
 *
 * Reduced motion gets neither: the cards stand in rows, or in the deck, every one readable.
 */
export function SolutionDeck() {
  useGSAP(() => {
    const section = document.getElementById('solution');
    const track = section?.querySelector<HTMLElement>('.solution__track');
    const deck = section?.querySelector<HTMLElement>('.solution__deck');
    const strip = section?.querySelector<HTMLElement>('.solution__cards');
    if (!section || !track || !deck || !strip) return;
    const cards = [...section.querySelectorAll<HTMLElement>('.solution__card')];
    const slots = [...section.querySelectorAll<HTMLElement>('.solution__slot')];
    const count = section.querySelector<HTMLElement>('.solution__count');
    const fill = section.querySelector<HTMLElement>('.solution__fill');
    if (!cards.length) return;

    const mm = gsap.matchMedia();

    mm.add(DEAL_MEDIA, () => {
      let shown = -1;
      let slide: gsap.core.Timeline | undefined;
      // The cards' shape follows where each slot is on screen (the slots move with the strip, the cards turn in them).
      // The count and the rule follow how far the strip has run, so both end on the last card together.
      const shape = () => {
        const box = deck.getBoundingClientRect();
        const middle = box.left + box.width / 2;
        slots.forEach((slot, i) => {
          const r = slot.getBoundingClientRect();
          const { tilt, drop, scale } = slideShape((r.left + r.width / 2 - middle) / box.width);
          gsap.set(cards[i], { rotation: tilt, y: drop, scale });
        });
        const run = Math.min(1, slide?.time() ?? 0);
        const at = Math.min(cards.length - 1, Math.floor(run * cards.length));
        if (at !== shown && count) {
          shown = at;
          count.textContent = cardCount(at, cards.length);
        }
        if (fill) fill.style.scale = `${run} 1`;
      };
      slide = gsap
        .timeline({
          scrollTrigger: {
            trigger: track,
            start: 'top 40%',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: shape,
          },
        })
        .fromTo(
          strip,
          { x: () => deck.clientWidth * SLIDE_FROM },
          { x: () => deck.clientWidth - strip.scrollWidth, duration: 1, ease: 'none', onUpdate: shape },
        )
        .to({}, { duration: SLIDE_HOLD });
      shape();
      return () => {
        // The shapes were set from scroll callbacks, outside what matchMedia reverts on its own.
        gsap.set(cards, { clearProps: 'transform' });
        if (count) count.textContent = cardCount(0, cards.length);
        if (fill) fill.style.scale = '';
      };
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
